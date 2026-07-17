import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Not authorized, no token provided");
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, "Not authorized, token is invalid or expired");
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError(401, "Not authorized, user no longer exists");
  }

  req.user = user;
  next();
});
