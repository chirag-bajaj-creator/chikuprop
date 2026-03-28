const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [20, "Description must be at least 20 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    appointmentType: {
      type: String,
      enum: ["audio_call", "video_call", "chat"],
      required: [true, "Appointment type is required"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: [1000, "Admin notes cannot exceed 1000 characters"],
      default: "",
    },
  },
  { timestamps: true }
);

// Admin listing: filter by status, newest first
appointmentSchema.index({ status: 1, createdAt: -1 });

// User's own appointments
appointmentSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
