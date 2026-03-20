require("dotenv").config();
const express  = require("express");
const cors     = require("cors");
const mongoose = require("mongoose");

const authRoutes      = require("./src/routes/authRoutes");
const interviewRoutes = require("./src/routes/interviewRoutes");

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());           // ✅ MUST be before routes
app.use(express.urlencoded({ extended: true }));

// ── Request logger (shows every hit in Render logs) ───────────────────────────
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",      authRoutes);
app.use("/api/interview", interviewRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "AI Interview Server running" });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
});

// ── Global error handler (catches ALL unhandled errors, no crash) ─────────────
app.use((err, req, res, next) => {
  console.error("❌ Global error:", err.message);
  console.error(err.stack);
  res.status(500).json({
    message: "Internal server error",
    error: err.message
  });
});

// ── Catch unhandled promise rejections (prevents process crash) ───────────────
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err.message);
  console.error(err.stack);
  // Don't exit — keep server alive
});

// ── Connect MongoDB then start ────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });