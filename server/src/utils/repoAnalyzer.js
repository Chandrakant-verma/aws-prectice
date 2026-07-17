import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import simpleGit from "simple-git";
import { ApiError } from "./ApiError.js";

const CLONES_ROOT = path.resolve(process.cwd(), "clones");

const SKIP_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".next",
]);

const GITHUB_URL_PATTERN =
  /^https:\/\/github\.com\/[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\/[a-zA-Z0-9._-]+$/;

const CLONE_TIMEOUT_MS = 30_000;

/**
 * Trim whitespace, strip a trailing slash, strip a trailing `.git`,
 * so equivalent URLs compare and store identically.
 */
export function normalizeGithubUrl(rawUrl) {
  if (typeof rawUrl !== "string") return "";
  let url = rawUrl.trim();
  url = url.replace(/\/+$/, "");
  url = url.replace(/\.git$/i, "");
  return url;
}

/**
 * Validate that a normalized URL matches https://github.com/<owner>/<repo>.
 * Throws ApiError(400) if not, so malformed input never reaches git clone.
 */
export function assertValidGithubUrl(normalizedUrl) {
  if (!GITHUB_URL_PATTERN.test(normalizedUrl)) {
    throw new ApiError(
      400,
      "Please provide a valid public GitHub repository URL, e.g. https://github.com/owner/repo"
    );
  }
}

/**
 * ONE clone slot per user — not per repo. There is nothing in the
 * database recording which repo a user last analyzed, so the only way
 * "only one repo at a time" is enforced is physically: every analysis
 * clones into this same folder, wiping whatever was there before.
 */
export function getRepositoryPathFor(userId) {
  const folderName = crypto.createHash("sha256").update(String(userId)).digest("hex").slice(0, 24);
  return path.join(CLONES_ROOT, folderName);
}

export async function removeClonedFolder(dirPath) {
  await fs.rm(dirPath, { recursive: true, force: true });
}

/**
 * Shallow, single-branch clone with terminal prompts disabled so a
 * private/mistyped URL fails fast instead of hanging on a credential
 * prompt, plus a timeout backstop.
 */
async function cloneIntoSlot(githubUrl, destPath) {
  await fs.mkdir(CLONES_ROOT, { recursive: true });
  // Wipes whatever the user previously had cloned — this IS the
  // mechanism that makes "only one repo at a time" true.
  await removeClonedFolder(destPath);

  const git = simpleGit({
    timeout: { block: CLONE_TIMEOUT_MS },
  });

  const clonePromise = git.env("GIT_TERMINAL_PROMPT", "0").clone(githubUrl, destPath, [
    "--depth",
    "1",
    "--single-branch",
  ]);

  const timeoutPromise = new Promise((_resolve, reject) => {
    setTimeout(
      () => reject(new Error("Clone timed out after 30 seconds")),
      CLONE_TIMEOUT_MS
    );
  });

  try {
    await Promise.race([clonePromise, timeoutPromise]);
  } catch (err) {
    // Clean up any partial clone so a failed attempt doesn't leave junk on disk.
    await removeClonedFolder(destPath);
    throw new ApiError(
      422,
      `Could not clone repository — check the URL is a real, public GitHub repo. (${err.message})`
    );
  }
}

/**
 * Walk a cloned folder: count files, count folders, collect the set
 * of file extensions present as a stand-in for "languages used".
 */
async function scanDirectory(rootPath) {
  let totalFiles = 0;
  let totalFolders = 0;
  const languages = new Set();

  async function walk(currentPath) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      if (SKIP_DIRS.has(entry.name)) continue;

      const entryPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        totalFolders += 1;
        await walk(entryPath);
      } else if (entry.isFile()) {
        totalFiles += 1;
        const ext = path.extname(entry.name);
        if (ext) languages.add(ext.slice(1).toLowerCase());
      }
    }
  }

  await walk(rootPath);

  return {
    totalFiles,
    totalFolders,
    languages: Array.from(languages).sort(),
  };
}

/**
 * Full analysis pipeline for one user: normalize -> validate -> clone
 * into that user's single slot (replacing whatever was there) -> scan.
 * Nothing here touches a database — the caller decides what, if
 * anything, to do with the result.
 */
export async function analyzeRepository(userId, rawGithubUrl) {
  const normalizedUrl = normalizeGithubUrl(rawGithubUrl);
  assertValidGithubUrl(normalizedUrl);

  const repositoryPath = getRepositoryPathFor(userId);

  await cloneIntoSlot(normalizedUrl, repositoryPath);
  const { totalFiles, totalFolders, languages } = await scanDirectory(repositoryPath);

  return {
    githubUrl: normalizedUrl,
    repositoryPath,
    totalFiles,
    totalFolders,
    languages,
  };
}
