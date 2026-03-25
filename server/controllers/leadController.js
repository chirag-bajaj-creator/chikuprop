const mongoose = require("mongoose");
const Lead = require("../models/Lead");
const Property = require("../models/Property");
const createNotification = require("../utils/createNotification");

// Unlock contact — creates a lead and returns full contact info
const unlockContact = async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (!mongoose.isValidObjectId(propertyId)) {
      return res.status(400).json({ success: false, error: "Invalid property ID" });
    }

    const property = await Property.findById(propertyId)
      .select("contactPhone contactEmail contactUnlockCount vendorId status")
      .lean();

    if (!property) {
      return res.status(404).json({ success: false, error: "Property not found" });
    }

    if (property.status !== "active") {
      return res.status(400).json({ success: false, error: "This property is no longer active" });
    }

    // Don't let vendors unlock their own properties
    if (property.vendorId.toString() === req.user._id.toString()) {
      return res.status(200).json({
        success: true,
        data: {
          contactPhone: property.contactPhone,
          contactEmail: property.contactEmail,
          isOwner: true,
        },
      });
    }

    // Check if user already unlocked this property
    const existingLead = await Lead.findOne({
      userId: req.user._id,
      propertyId,
    }).lean();

    if (existingLead) {
      // Already unlocked — return contact without creating duplicate
      return res.status(200).json({
        success: true,
        data: {
          contactPhone: property.contactPhone,
          contactEmail: property.contactEmail,
          alreadyUnlocked: true,
        },
      });
    }

    // Create new lead record
    await Lead.create({
      propertyId,
      vendorId: property.vendorId,
      userId: req.user._id,
      userRole: req.user.role || "user",
      eventType: "contact_unlock",
    });

    // Increment contact unlock count on the property
    await Property.findByIdAndUpdate(propertyId, {
      $inc: { contactUnlockCount: 1 },
    });

    // Notify property owner about the new lead
    const fullProperty = await Property.findById(propertyId).select("title vendorId").lean();
    if (fullProperty) {
      createNotification({
        userId: fullProperty.vendorId,
        type: "lead_created",
        title: "New Lead",
        message: `Someone unlocked contact info on your property: ${fullProperty.title}`,
        relatedId: propertyId,
        relatedModel: "Property",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        contactPhone: property.contactPhone,
        contactEmail: property.contactEmail,
      },
    });
  } catch (error) {
    console.error("Unlock contact error:", error);
    // Handle duplicate key error gracefully (race condition)
    if (error.code === 11000) {
      try {
        const property = await Property.findById(req.params.propertyId)
          .select("contactPhone contactEmail")
          .lean();

        if (property) {
          return res.status(200).json({
            success: true,
            data: {
              contactPhone: property.contactPhone,
              contactEmail: property.contactEmail,
              alreadyUnlocked: true,
            },
          });
        }
      } catch (innerError) {
        console.error("Fallback query error:", innerError);
      }
    }
    res.status(500).json({ success: false, error: "Failed to unlock contact" });
  }
};

// Check if user has already unlocked a property's contact
const checkUnlockStatus = async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (!mongoose.isValidObjectId(propertyId)) {
      return res.status(400).json({ success: false, error: "Invalid property ID" });
    }

    const lead = await Lead.findOne({
      userId: req.user._id,
      propertyId,
    }).lean();

    if (lead) {
      // Already unlocked — return full contact
      const property = await Property.findById(propertyId)
        .select("contactPhone contactEmail")
        .lean();

      if (!property) {
        return res.status(404).json({ success: false, error: "Property not found" });
      }

      return res.status(200).json({
        success: true,
        data: {
          unlocked: true,
          contactPhone: property.contactPhone,
          contactEmail: property.contactEmail,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: { unlocked: false },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to check unlock status" });
  }
};

// Get leads for a vendor (who unlocked their properties)
const getVendorLeads = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const safePage = Math.max(1, Math.floor(Number(page)) || 1);
    const safeLimit = Math.min(50, Math.max(1, Math.floor(Number(limit)) || 20));
    const skip = (safePage - 1) * safeLimit;

    const [leads, total] = await Promise.all([
      Lead.find({ vendorId: req.user._id })
        .populate("userId", "name email phone")
        .populate("propertyId", "title location images")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      Lead.countDocuments({ vendorId: req.user._id }),
    ]);

    res.status(200).json({
      success: true,
      data: leads,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        pages: Math.ceil(total / safeLimit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch leads" });
  }
};

// Get leads where userId = current user (properties the buyer unlocked)
const getBuyerLeads = async (req, res) => {
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
    console.error("Get buyer leads error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch your contacted properties" });
  }
};

module.exports = { unlockContact, checkUnlockStatus, getVendorLeads, getBuyerLeads };
