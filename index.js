require("dotenv").config();
const express  = require("express");
const cors     = require("cors");
const mongoose = require("mongoose");

// ── Safety check: log all env vars on startup ─────────────────────────────────
console.log("🔍 Checking environment variables...");
console.log("MONGO_URI set:", !!process.env.MONGO_URI);
console.log("JWT_SECRET set:", !!process.env.JWT_SECRET);
console.log("GROQ_API_KEY set:", !!process.env.GROQ_API_KEY);
console.log("PORT:", process.env.PORT || 5000);

if (!process.env.MONGO_URI) {
  console.error("❌ FATAL: MONGO_URI is not set. Add it in Render → Environment.");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("❌ FATAL: JWT_SECRET is not set. Add it in Render → Environment.");
  process.exit(1);
}

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Request logger ────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});

// ── Health check — MUST be before routes ─────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "AI Interview Server running ✅" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ── Routes ────────────────────────────────────────────────────────────────────
try {
  const authRoutes      = require("./src/routes/authRoutes");
  const interviewRoutes = require("./src/routes/interviewRoutes");
  app.use("/api/auth",      authRoutes);
  app.use("/api/interview", interviewRoutes);
  console.log("✅ Routes loaded successfully");
} catch (err) {
  console.error("❌ Failed to load routes:", err.message);
  process.exit(1);
}

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err.message);
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

// ── Catch crashes ─────────────────────────────────────────────────────────────
process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err.message);
});

// ── Connect MongoDB then start server ─────────────────────────────────────────
console.log("🔄 Connecting to MongoDB...");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection FAILED:", err.message);
    console.error("Check your MONGO_URI in Render → Environment tab");
    process.exit(1);
  });