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
  process.env.CLIENT_URL,           // e.g. https://blade-find.vercel.app
  process.env.CLIENT_URL_PREVIEW,   // optional exact preview
].filter(Boolean);

const vercelPreview = /^https:\/\/blade-find-.*\.vercel\.app$/; // adjust project prefix if needed

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);

    const ok = allowedOrigins.includes(origin) || vercelPreview.test(origin);
    return cb(null, ok); // don't throw error; just disallow
  },
  credentials: true,
}));

app.options("*", cors());

connectDB();

// app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use("/api/auth",    authRoutes);
app.use("/api/shops",   shopRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/api/health", (_, res) => res.json({ success: true, message: "BarberFinder API running 🚀" }));

app.use(errorHandler);

app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));
