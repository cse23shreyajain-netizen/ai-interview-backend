const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ── REGISTER ──────────────────────────────────────────────────────────────────
exports.registerUser = async (req, res) => {
  try {
    console.log("📥 Register request body:", req.body);

    // ✅ Validate body exists
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request body is empty" });
    }

    const { name, email, password } = req.body;

    // ✅ Validate all fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "name, email and password are all required"
      });
    }

    // ✅ Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // ✅ Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // ✅ Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists with this email" });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });

    await user.save();
    console.log("✅ User registered:", email);

    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    // ✅ Log full error for Render logs
    console.error("❌ Register error:", error.message);
    console.error(error.stack);

    // ✅ Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // ✅ Handle mongoose validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({
      message: "Server error during registration",
      error: error.message
    });
  }
};

// ── LOGIN ─────────────────────────────────────────────────────────────────────
exports.loginUser = async (req, res) => {
  try {
    console.log("📥 Login request body:", req.body);

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request body is empty" });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    // ✅ Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // ✅ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // ✅ Sign JWT
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET is not set in environment variables!");
      return res.status(500).json({ message: "Server config error: JWT_SECRET missing" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✅ User logged in:", email);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("❌ Login error:", error.message);
    console.error(error.stack);

    res.status(500).json({
      message: "Server error during login",
      error: error.message
    });
  }
};