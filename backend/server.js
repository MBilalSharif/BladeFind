require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const shopRoutes    = require("./src/routes/shopRoutes");
const reviewRoutes  = require("./src/routes/reviewRoutes");
const authRoutes    = require("./src/routes/authRoutes");
const errorHandler  = require("./src/middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.CLIENT_URL,           // production (exact)
  process.env.CLIENT_URL_PREVIEW,   // optional exact preview URL
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // allow curl/postman
    const isAllowed =
      allowedOrigins.includes(origin) ||
      /^https:\/\/blade-find-.*\.vercel\.app$/.test(origin);
    cb(isAllowed ? null : new Error("Not allowed by CORS"), isAllowed);
  },
  credentials: true,
}));

connectDB();

// app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use("/api/auth",    authRoutes);
app.use("/api/shops",   shopRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/api/health", (_, res) => res.json({ success: true, message: "BarberFinder API running 🚀" }));

app.use(errorHandler);

app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));
