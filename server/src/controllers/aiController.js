import fs from "fs/promises";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { analyzeRepository } from "../utils/repoAnalyzer.js";

const TEXT_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx", ".json", ".md"]);
const SKIP_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".next",
]);

// Cap how much source we stuff into the prompt so a large repo doesn't
// blow the context window or the request payload.
const MAX_CONTEXT_CHARS = 120_000;
const MAX_FILE_CHARS = 8_000;

let genAI;
function getClient() {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new ApiError(500, "GEMINI_API_KEY is not configured on the server");
    }
    genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAI;
}

async function collectSourceContext(rootPath) {
  let remaining = MAX_CONTEXT_CHARS;
  const chunks = [];

  async function walk(currentPath) {
    if (remaining <= 0) return;
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      if (remaining <= 0) return;
      if (SKIP_DIRS.has(entry.name)) continue;

      const entryPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        await walk(entryPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (!TEXT_EXTENSIONS.has(ext)) continue;

        try {
          const raw = await fs.readFile(entryPath, "utf8");
          const truncated = raw.slice(0, MAX_FILE_CHARS);
          const relativePath = path.relative(rootPath, entryPath);
          const block = `\n--- FILE: ${relativePath} ---\n${truncated}\n`;

          if (block.length > remaining) continue;
          chunks.push(block);
          remaining -= block.length;
        } catch {
          // Unreadable file (binary, permissions, etc) — skip it.
        }
      }
    }
  }

  await walk(rootPath);
  return chunks.join("");
}

/**
 * POST /api/ai/ask
 * No database, no stored path. The client sends the githubUrl of the
 * repo it currently has open; this re-clones that URL into the user's
 * single clone slot (guaranteeing it's the one on disk) and answers
 * from that fresh copy.
 */
export const askAboutRepository = asyncHandler(async (req, res) => {
  const { githubUrl, question } = req.body;

  if (!githubUrl || !question || typeof question !== "string") {
    throw new ApiError(400, "githubUrl and question are required");
  }

  // Throws ApiError(422) itself if the clone fails — asyncHandler forwards it.
  const analysis = await analyzeRepository(req.user._id, githubUrl);

  const context = await collectSourceContext(analysis.repositoryPath);

  const prompt = `You are a code assistant answering questions about a single GitHub repository: ${analysis.githubUrl}.
Answer the user's question using ONLY the source code excerpts below. If the answer is not
present in the excerpts, say you don't have enough information from the indexed files rather
than guessing.

${context}

USER QUESTION: ${question}`;

  const client = getClient();
  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const answer = response.text ?? "";

  res.status(200).json(new ApiResponse("Answer generated", { answer }));
});
