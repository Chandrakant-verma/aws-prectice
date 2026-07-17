import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

/**
 * Run after an array of express-validator checks.
 * Collects any validation errors and throws a single ApiError(400).
 */
export function validate(req, _res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const message = errors
    .array()
    .map((e) => e.msg)
    .join(", ");

  next(new ApiError(400, message));
}
