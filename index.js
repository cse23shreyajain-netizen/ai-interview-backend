require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes      = require("./src/routes/authRoutes");
const interviewRoutes = require("./src/routes/interviewRoutes");

const app = express();

// ✅ Open CORS for deployment — update origin to your frontend URL after deploying
app.use(cors());
app.use(express.json());

// ✅ Routes
app.use("/api/auth",      authRoutes);
app.use("/api/interview", interviewRoutes);

// ✅ Health check
app.get("/", (req, res) => {
  res.json({ status: "AI Interview Server running" });
});

// ✅ Connect MongoDB then start
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