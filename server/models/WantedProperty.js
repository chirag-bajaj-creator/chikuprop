const mongoose = require("mongoose");

const wantedPropertySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [20, "Description must be at least 20 characters"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    propertyType: {
      type: String,
      enum: ["flat", "house", "plot", "commercial"],
      required: [true, "Property type is required"],
    },
    listingType: {
      type: String,
      enum: ["sale", "rent"],
      required: [true, "Listing type is required"],
    },
    budget: {
      min: {
        type: Number,
        required: [true, "Minimum budget is required"],
        min: [0, "Budget cannot be negative"],
      },
      max: {
        type: Number,
        required: [true, "Maximum budget is required"],
        min: [0, "Budget cannot be negative"],
      },
    },
    location: {
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
      },
      area: {
        type: String,
        trim: true,
        default: "",
      },
      state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
      },
    },
    bedrooms: {
      type: Number,
      min: 0,
    },
    contactPhone: {
      type: String,
      required: [true, "Contact phone is required"],
      trim: true,
    },
    contactEmail: {
      type: String,
      required: [true, "Contact email is required"],
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: ["active", "fulfilled", "expired"],
      default: "active",
    },
  },
  { timestamps: true }
);

wantedPropertySchema.index({ "location.city": 1, status: 1, createdAt: -1 });
wantedPropertySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("WantedProperty", wantedPropertySchema);
