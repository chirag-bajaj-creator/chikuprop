const mongoose = require("mongoose");
const SavedProperty = require("../models/SavedProperty");
const Property = require("../models/Property");

// POST /api/saved/:propertyId — Toggle save/unsave
const saveProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (!mongoose.isValidObjectId(propertyId)) {
      return res.status(400).json({ success: false, error: "Invalid property ID" });
    }

    const property = await Property.findById(propertyId).select("status").lean();
    if (!property) {
      return res.status(404).json({ success: false, error: "Property not found" });
    }

    // Check if already saved
    const existing = await SavedProperty.findOne({
      userId: req.user._id,
      propertyId,
    }).lean();

    if (existing) {
      // Unsave
      await SavedProperty.findByIdAndDelete(existing._id);
      return res.status(200).json({ success: true, data: { saved: false } });
    }

    // Save
    await SavedProperty.create({
      userId: req.user._id,
      propertyId,
    });

    res.status(200).json({ success: true, data: { saved: true } });
  } catch (error) {
    console.error("Save property error:", error);
    // Handle duplicate key error gracefully (race condition)
    if (error.code === 11000) {
      return res.status(200).json({ success: true, data: { saved: true } });
    }
    res.status(500).json({ success: false, error: "Failed to save property" });
  }
};

// DELETE /api/saved/:propertyId — Unsave a property
const unsaveProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (!mongoose.isValidObjectId(propertyId)) {
      return res.status(400).json({ success: false, error: "Invalid property ID" });
    }

    const result = await SavedProperty.findOneAndDelete({
      userId: req.user._id,
      propertyId,
    });

    if (!result) {
      return res.status(404).json({ success: false, error: "Property was not saved" });
    }

    res.status(200).json({ success: true, data: { saved: false } });
  } catch (error) {
    console.error("Unsave property error:", error);
    res.status(500).json({ success: false, error: "Failed to unsave property" });
  }
};

// GET /api/saved — Get user's saved properties
const getSavedProperties = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const safePage = Math.max(1, Math.floor(Number(page)) || 1);
    const safeLimit = Math.min(50, Math.max(1, Math.floor(Number(limit)) || 12));
    const skip = (safePage - 1) * safeLimit;

    const [savedProperties, total] = await Promise.all([
      SavedProperty.find({ userId: req.user._id })
        .populate("propertyId", "title price location images listingType propertyType status viewCount")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      SavedProperty.countDocuments({ userId: req.user._id }),
    ]);

    // Filter out entries where the property has been deleted
    const filtered = savedProperties.filter((sp) => sp.propertyId !== null);

    res.status(200).json({
      success: true,
      data: filtered,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        pages: Math.ceil(total / safeLimit),
      },
    });
  } catch (error) {
    console.error("Get saved properties error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch saved properties" });
  }
};

// GET /api/saved/check/:propertyId — Check if a single property is saved
const checkSaved = async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (!mongoose.isValidObjectId(propertyId)) {
      return res.status(400).json({ success: false, error: "Invalid property ID" });
    }

    const saved = await SavedProperty.findOne({
      userId: req.user._id,
      propertyId,
    }).lean();

    res.status(200).json({ success: true, data: { saved: !!saved } });
  } catch (error) {
    console.error("Check saved error:", error);
    res.status(500).json({ success: false, error: "Failed to check saved status" });
  }
};

// GET /api/saved/check-batch — Batch check saved status for multiple properties
const checkSavedBatch = async (req, res) => {
  try {
    const { ids } = req.query;

    if (!ids || typeof ids !== "string" || ids.trim().length === 0) {
      return res.status(400).json({ success: false, error: "Provide property IDs as comma-separated query param" });
    }

    const idArray = ids.split(",").map((id) => id.trim()).filter(Boolean);

    if (idArray.length === 0) {
      return res.status(400).json({ success: false, error: "Provide property IDs as comma-separated query param" });
    }

    if (idArray.length > 50) {
      return res.status(400).json({ success: false, error: "Maximum 50 IDs per batch check" });
    }

    // Validate all IDs
    const validIds = idArray.filter((id) => mongoose.isValidObjectId(id));

    const savedDocs = await SavedProperty.find({
      userId: req.user._id,
      propertyId: { $in: validIds },
    })
      .select("propertyId")
      .lean();

    // Build a map of saved property IDs
    const savedMap = {};
    savedDocs.forEach((doc) => {
      savedMap[doc.propertyId.toString()] = true;
    });

    res.status(200).json({ success: true, data: savedMap });
  } catch (error) {
    console.error("Check saved batch error:", error);
    res.status(500).json({ success: false, error: "Failed to check saved status" });
  }
};

module.exports = { saveProperty, unsaveProperty, getSavedProperties, checkSaved, checkSavedBatch };
