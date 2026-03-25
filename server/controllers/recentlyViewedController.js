const mongoose = require("mongoose");
const RecentlyViewed = require("../models/RecentlyViewed");
const Property = require("../models/Property");

// POST /api/recently-viewed/:propertyId — Record a view
const recordView = async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (!mongoose.isValidObjectId(propertyId)) {
      return res.status(400).json({ success: false, error: "Invalid property ID" });
    }

    const property = await Property.findById(propertyId).select("_id").lean();
    if (!property) {
      return res.status(404).json({ success: false, error: "Property not found" });
    }

    // Upsert — if already viewed, update viewedAt; otherwise create
    await RecentlyViewed.findOneAndUpdate(
      { userId: req.user._id, propertyId },
      { viewedAt: new Date() },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, data: { recorded: true } });
  } catch (error) {
    console.error("Record view error:", error);
    res.status(500).json({ success: false, error: "Failed to record view" });
  }
};

// GET /api/recently-viewed — Get user's recently viewed properties
const getRecentlyViewed = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const safeLimit = Math.min(50, Math.max(1, Math.floor(Number(limit)) || 20));

    const recentViews = await RecentlyViewed.find({ userId: req.user._id })
      .populate("propertyId", "title price location images listingType propertyType status")
      .sort({ viewedAt: -1 })
      .limit(safeLimit)
      .lean();

    // Filter out entries where the property has been deleted
    const filtered = recentViews.filter((rv) => rv.propertyId !== null);

    res.status(200).json({ success: true, data: filtered });
  } catch (error) {
    console.error("Get recently viewed error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch recently viewed properties" });
  }
};

module.exports = { recordView, getRecentlyViewed };
