import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { analyzeRepository } from "../utils/repoAnalyzer.js";

/**
 * POST /api/repositories/clone
 * No database involved. Clones the given URL into this user's single
 * clone slot — wiping out whatever repo they previously analyzed — scans
 * it, and returns the result directly. The frontend is what remembers
 * "the current repo"; the server holds no record between requests beyond
 * whatever is sitting in that one folder on disk.
 */
export const cloneRepository = asyncHandler(async (req, res) => {
  const { githubUrl } = req.body;
  if (!githubUrl || typeof githubUrl !== "string") {
    throw new ApiError(400, "githubUrl is required");
  }

  const analysis = await analyzeRepository(req.user._id, githubUrl);

  res.status(200).json(
    new ApiResponse("Repository analyzed successfully", {
      repository: {
        githubUrl: analysis.githubUrl,
        totalFiles: analysis.totalFiles,
        totalFolders: analysis.totalFolders,
        languages: analysis.languages,
      },
    })
  );
});
