const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userRole: {
      type: String,
      default: "user",
    },
    eventType: {
      type: String,
      default: "contact_unlock",
    },
  },
  { timestamps: true }
);

// Prevent duplicate leads — one user can only unlock a property once
leadSchema.index({ userId: 1, propertyId: 1 }, { unique: true });

// Fast lookups for vendor leads page
leadSchema.index({ vendorId: 1, createdAt: -1 });

module.exports = mongoose.model("Lead", leadSchema);
