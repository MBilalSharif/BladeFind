const jwt = require("jsonwebtoken");

/**
 * Middleware to verify JWT on protected routes.
 * Attaches decoded user to req.user if valid.
 */
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

/**
 * Optional auth — attaches user if token present but doesn't block if missing.
 * Use on routes that work for both guests and logged-in users.
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      // Invalid token — just treat as guest
      req.user = null;
    }
  }
  next();
};

module.exports = { requireAuth, optionalAuth };
