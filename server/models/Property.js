const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    listingType: {
      type: String,
      enum: ["sale", "rent"],
      required: true,
    },
    propertyType: {
      type: String,
      enum: ["flat", "house", "plot", "commercial"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    location: {
      city: { type: String, required: true },
      area: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String },
    },
    bedrooms: { type: Number },
    bathrooms: { type: Number },
    areaSqft: { type: Number },
    furnishing: {
      type: String,
      enum: ["furnished", "semi-furnished", "unfurnished"],
    },
    amenities: [{ type: String }],
    images: [{ type: String }],
    video: { type: String },
    contactPhone: {
      type: String,
      required: true,
    },
    contactEmail: {
      type: String,
      required: true,
    },
    planType: {
      type: String,
      enum: ["free", "paid"],
      default: "free",
    },
    status: {
      type: String,
      enum: ["active", "paused", "expired", "flagged", "rejected"],
      default: "active",
    },
    viewCount: { type: Number, default: 0 },
    contactUnlockCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

propertySchema.index({ "location.city": 1, listingType: 1, status: 1 });

module.exports = mongoose.model("Property", propertySchema);
