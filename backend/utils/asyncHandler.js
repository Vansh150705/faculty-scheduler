// Wraps an async route handler so rejected promises are forwarded to Express'
// error-handling middleware instead of being swallowed. This removes the
// repetitive try/catch blocks from every controller.
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
