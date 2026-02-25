/**
 * Global error handler middleware.
 * Catches any error passed via next(err) in route handlers.
 */
const errorHandler = (err, req, res, next) => {
  console.error("🔥 Unhandled Error:", err.stack);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

module.exports = errorHandler;
