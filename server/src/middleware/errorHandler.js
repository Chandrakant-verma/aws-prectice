import { ApiError } from "../utils/ApiError.js";

/**
 * Central error handler. Any error passed to next(err), or thrown inside
 * an asyncHandler-wrapped route, ends up here.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  // Mongoose duplicate key error (e.g. duplicate user/githubUrl pair)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || {}).join(", ");
    message = field
      ? `A record with this ${field} already exists`
      : "Duplicate record";
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid value for ${err.path}`;
  }

  if (process.env.NODE_ENV !== "production" && !(err instanceof ApiError)) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
}

export function notFoundHandler(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}
