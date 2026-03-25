const mongoose = require("mongoose");

const grievanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      minlength: [5, "Subject must be at least 5 characters"],
      maxlength: [200, "Subject cannot exceed 200 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      minlength: [20, "Message must be at least 20 characters"],
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    category: {
      type: String,
      enum: ["listing", "account", "payment", "technical", "other"],
      default: "other",
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved"],
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

// Fast lookup for admin listing sorted by newest
grievanceSchema.index({ status: 1, createdAt: -1 });

// Fast lookup for user's own grievances
grievanceSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Grievance", grievanceSchema);
