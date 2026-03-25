const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Strip HTML tags to prevent XSS
const stripHtml = (str) => str.replace(/<[^>]*>/g, "").trim();

// POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: "Name, email, and password are required" });
    }

    // Block NoSQL injection — all inputs must be strings
    if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ success: false, error: "Invalid input" });
    }
    if (phone && typeof phone !== "string") {
      return res.status(400).json({ success: false, error: "Invalid input" });
    }

    const sanitizedName = stripHtml(name);
    if (!sanitizedName || sanitizedName.length < 2) {
      return res.status(400).json({ success: false, error: "Name must be at least 2 valid characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "Email already registered" });
    }

    const user = await User.create({
      name: sanitizedName,
      email,
      password,
      phone,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        token,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: "Email already registered" });
    }
    console.error(error);
    res.status(500).json({ success: false, error: "An internal error occurred" });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    // Block NoSQL injection — inputs must be strings
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ success: false, error: "Invalid input" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        token,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "An internal error occurred" });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        avatar: req.user.avatar,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "An internal error occurred" });
  }
};

// POST /api/auth/admin-signup — create admin account with secret key
const adminSignup = async (req, res) => {
  try {
    const { name, email, password, phone, secretKey } = req.body;

    if (!name || !email || !password || !secretKey) {
      return res.status(400).json({ success: false, error: "All fields including secret key are required" });
    }

    if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string" || typeof secretKey !== "string") {
      return res.status(400).json({ success: false, error: "Invalid input" });
    }
    if (phone && typeof phone !== "string") {
      return res.status(400).json({ success: false, error: "Invalid input" });
    }

    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret || secretKey !== adminSecret) {
      return res.status(403).json({ success: false, error: "Invalid secret key" });
    }

    const sanitizedName = stripHtml(name);
    if (!sanitizedName || sanitizedName.length < 2) {
      return res.status(400).json({ success: false, error: "Name must be at least 2 valid characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "Email already registered" });
    }

    const user = await User.create({
      name: sanitizedName,
      email,
      password,
      phone,
      role: "admin",
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        token,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: "Email already registered" });
    }
    console.error(error);
    res.status(500).json({ success: false, error: "An internal error occurred" });
  }
};

module.exports = { signup, login, getMe, adminSignup };
