const express = require("express");
const router = express.Router();
const { googleAuth, getMe } = require("../controllers/authController");
const { requireAuth } = require("../middlewares/authMiddleware");

// POST /api/auth/google  — exchange Google credential for our JWT
router.post("/google", googleAuth);

// GET  /api/auth/me      — return current user (requires JWT)
router.get("/me", requireAuth, getMe);

module.exports = router;
