const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

// Helper: upload a single buffer to Cloudinary via stream
const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });
};

const stripHtml = (str) => str.replace(/<[^>]*>/g, "").trim();

// PUT /api/profile — update name, phone, email
const updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const updates = {};

    if (name !== undefined) {
      if (typeof name !== "string") {
        return res.status(400).json({ success: false, error: "Invalid input" });
      }
      const sanitized = stripHtml(name);
      if (!sanitized || sanitized.length < 2 || sanitized.length > 50) {
        return res.status(400).json({ success: false, error: "Name must be 2–50 characters" });
      }
      updates.name = sanitized;
    }

    if (email !== undefined) {
      if (typeof email !== "string") {
        return res.status(400).json({ success: false, error: "Invalid input" });
      }
      const trimmedEmail = email.trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
        return res.status(400).json({ success: false, error: "Please enter a valid email" });
      }
      const existing = await User.findOne({ email: trimmedEmail, _id: { $ne: req.user._id } });
      if (existing) {
        return res.status(400).json({ success: false, error: "Email already in use" });
      }
      updates.email = trimmedEmail;
    }

    if (phone !== undefined) {
      if (phone === "" || phone === null) {
        updates.phone = "";
      } else {
        if (typeof phone !== "string") {
          return res.status(400).json({ success: false, error: "Invalid input" });
        }
        const trimmedPhone = phone.trim();
        if (!/^[6-9]\d{8}$/.test(trimmedPhone)) {
          return res.status(400).json({ success: false, error: "Enter a valid 10-digit Indian phone number" });
        }
        updates.phone = trimmedPhone;
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, error: "No fields to update" });
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, error: "Failed to update profile" });
  }
};

// PUT /api/profile/password — change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: "Current and new passwords are required" });
    }

    if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
      return res.status(400).json({ success: false, error: "Invalid input" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      data: { message: "Password updated successfully" },
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ success: false, error: "Failed to change password" });
  }
};

// PUT /api/profile/avatar — upload avatar image
const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "An image file is required" });
    }

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: "chikuprop/avatars",
      resource_type: "image",
      transformation: [{ width: 300, height: 300, crop: "fill", gravity: "face" }],
    });

    await User.findByIdAndUpdate(req.user._id, { avatar: result.secure_url });

    res.status(200).json({
      success: true,
      data: { avatar: result.secure_url },
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    res.status(500).json({ success: false, error: "Avatar upload failed. Please try again." });
  }
};

module.exports = { updateProfile, changePassword, updateAvatar };
