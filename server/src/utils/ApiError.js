/**
 * Custom error class carrying an HTTP status code.
 * Thrown anywhere in the app and caught by the central error handler.
 */
export class ApiError extends Error {
  constructor(statusCode, message = "Something went wrong") {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    Error.captureStackTrace?.(this, this.constructor);
  }
}
