const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * POST /api/auth/google
 * Receives a Google ID token from the frontend, verifies it,
 * upserts the user in MongoDB, and returns our own JWT.
 */
const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body; // ID token from @react-oauth/google

    if (!credential) {
      return res.status(400).json({ success: false, message: "Google credential is required." });
    }

    // Verify the token with Google
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture: avatar } = payload;

    // Upsert user — create if new, update name/avatar if returning
    const user = await User.findOneAndUpdate(
      { googleId },
      { googleId, email, name, avatar },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Sign our own JWT (7 day expiry)
    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name, avatar: user.avatar, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ googleAuth error:", err.message);
    return res.status(401).json({ success: false, message: "Invalid Google token." });
  }
};

/**
 * GET /api/auth/me
 * Returns the current user from the JWT (used on page reload).
 */
const getMe = async (req, res) => {
  // req.user is set by the auth middleware
  return res.status(200).json({ success: true, user: req.user });
};

module.exports = { googleAuth, getMe };
