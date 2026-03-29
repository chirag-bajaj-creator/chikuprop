const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");

// Create reusable transporter once (not on every request)
// Using Brevo SMTP (works on Render, unlike Gmail)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("Email transporter error:", error);
  } else {
    console.log("Email transporter ready:", success);
  }
});

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

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ success: false, error: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Store hashed token and expiry (15 minutes)
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // Send email with reset link
    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Link - ChikuProp",
      html: `
        <p>Hi ${user.name},</p>
        <p>You requested a password reset for your ChikuProp account.</p>
        <p><a href="${resetLink}" style="color: #9333EA; font-weight: bold;">Click here to reset your password</a></p>
        <p>This link expires in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br/>ChikuProp Team</p>
      `,
    };

    // Send email asynchronously (don't wait for it)
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Email send error for", user.email, ":", err);
      } else {
        console.log("Email sent successfully to", user.email, ":", info.response);
      }
    });

    // Respond immediately to user
    res.status(200).json({
      success: true,
      data: { message: "Reset link sent to your email. Check your inbox." },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to send reset email" });
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, error: "Token and password are required" });
    }

    if (typeof token !== "string" || typeof password !== "string") {
      return res.status(400).json({ success: false, error: "Invalid input" });
    }

    // Hash the token to compare
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Find user by token
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpiry: { $gt: new Date() },
    }).select("+password");

    if (!user) {
      return res.status(400).json({ success: false, error: "Invalid or expired reset link" });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      data: { message: "Password reset successfully. Please login with your new password." },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to reset password" });
  }
};

module.exports = { signup, login, getMe, adminSignup, forgotPassword, resetPassword };
