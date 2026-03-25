const mongoose = require("mongoose");

const savedPropertySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Property ID is required"],
    },
  },
  { timestamps: true }
);

// Compound unique index — one user can save a property only once
savedPropertySchema.index({ userId: 1, propertyId: 1 }, { unique: true });

// Fast lookup for "get all saved by user" sorted by newest first
savedPropertySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("SavedProperty", savedPropertySchema);
