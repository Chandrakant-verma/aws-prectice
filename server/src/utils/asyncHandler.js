/**
 * Wraps an async Express route handler so any thrown/rejected error
 * is forwarded to next(), instead of needing try/catch in every controller.
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
