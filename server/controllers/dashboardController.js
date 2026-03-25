const mongoose = require("mongoose");
const Property = require("../models/Property");
const Lead = require("../models/Lead");

// GET /api/dashboard/vendor — Vendor stats
const getVendorStats = async (req, res) => {
  try {
    const vendorId = req.user._id;

    const [totalListings, aggregation, totalLeads] = await Promise.all([
      Property.countDocuments({ vendorId }),
      Property.aggregate([
        { $match: { vendorId: new mongoose.Types.ObjectId(vendorId) } },
        {
          $group: {
            _id: null,
            totalViews: { $sum: "$viewCount" },
            totalUnlocks: { $sum: "$contactUnlockCount" },
          },
        },
      ]),
      Lead.countDocuments({ vendorId }),
    ]);

    const stats = aggregation[0] || { totalViews: 0, totalUnlocks: 0 };

    res.status(200).json({
      success: true,
      data: {
        totalListings,
        totalViews: stats.totalViews,
        totalLeads,
        totalUnlocks: stats.totalUnlocks,
      },
    });
  } catch (error) {
    console.error("Get vendor stats error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch vendor stats" });
  }
};

// GET /api/dashboard/buyer — Buyer's contacted properties
const getBuyerContacted = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const safePage = Math.max(1, Math.floor(Number(page)) || 1);
    const safeLimit = Math.min(50, Math.max(1, Math.floor(Number(limit)) || 20));
    const skip = (safePage - 1) * safeLimit;

    const [leads, total] = await Promise.all([
      Lead.find({ userId: req.user._id })
        .populate("propertyId", "title price location images listingType propertyType status")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      Lead.countDocuments({ userId: req.user._id }),
    ]);

    // Filter out entries where the property has been deleted
    const filtered = leads.filter((lead) => lead.propertyId !== null);

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
    console.error("Get buyer contacted error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch contacted properties" });
  }
};

// GET /api/dashboard/matching-buyers — Wanted properties matching vendor's listings
const getMatchingBuyers = async (req, res) => {
  try {
    const WantedProperty = require("../models/WantedProperty");
    const vendorId = req.user._id;

    // Get vendor's active properties
    const vendorProperties = await Property.find(
      { vendorId, status: "active" },
      "price location.city propertyType listingType title"
    ).lean();

    if (vendorProperties.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Build OR conditions — one per vendor property
    const orConditions = vendorProperties.map((p) => ({
      "location.city": { $regex: new RegExp(`^${p.location.city}$`, "i") },
      propertyType: p.propertyType,
      listingType: p.listingType,
      "budget.min": { $lte: p.price },
      "budget.max": { $gte: p.price },
    }));

    const matches = await WantedProperty.find({
      status: "active",
      userId: { $ne: vendorId },
      $or: orConditions,
    })
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Attach which vendor property each wanted post matches
    const enriched = matches.map((wanted) => {
      const matchedProperty = vendorProperties.find(
        (p) =>
          p.location.city.toLowerCase() === wanted.location.city.toLowerCase() &&
          p.propertyType === wanted.propertyType &&
          p.listingType === wanted.listingType &&
          wanted.budget.min <= p.price &&
          wanted.budget.max >= p.price
      );
      return {
        ...wanted,
        matchedPropertyId: matchedProperty?._id || null,
        matchedPropertyTitle: matchedProperty?.title || null,
      };
    });

    res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    console.error("Get matching buyers error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch matching buyers" });
  }
};

module.exports = { getVendorStats, getBuyerContacted, getMatchingBuyers };
