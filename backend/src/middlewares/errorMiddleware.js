/**
 * Request logger middleware — logs method, URL, and timestamp for every request.
 */
const requestLogger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
};

/**
 * 404 handler — catches any unmatched routes.
 */
const notFound = (req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
};

/**
 * Global error handler — catches errors passed via next(err).
 */
const errorHandler = (err, req, res, next) => {
  console.error("Global Error:", err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

module.exports = { requestLogger, notFound, errorHandler };
