const mongoose = require("mongoose");
const User = require("../models/User");
const Property = require("../models/Property");
const Lead = require("../models/Lead");
const Grievance = require("../models/Grievance");
const SavedProperty = require("../models/SavedProperty");
const RecentlyViewed = require("../models/RecentlyViewed");
const Appointment = require("../models/Appointment");
const { escapeRegex } = require("../utils/sanitize");
const createNotification = require("../utils/createNotification");

// GET /api/admin/stats — Site-wide analytics
const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalListings,
      activeListings,
      pausedListings,
      expiredListings,
      flaggedListings,
      rejectedListings,
      viewsAgg,
      totalLeads,
    ] = await Promise.all([
      User.countDocuments(),
      Property.countDocuments(),
      Property.countDocuments({ status: "active" }),
      Property.countDocuments({ status: "paused" }),
      Property.countDocuments({ status: "expired" }),
      Property.countDocuments({ status: "flagged" }),
      Property.countDocuments({ status: "rejected" }),
      Property.aggregate([
        { $group: { _id: null, totalViews: { $sum: "$viewCount" } } },
      ]),
      Lead.countDocuments(),
    ]);

    const totalViews = viewsAgg[0] ? viewsAgg[0].totalViews : 0;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalListings,
        activeListings,
        pausedListings,
        expiredListings,
        flaggedListings,
        rejectedListings,
        totalViews,
        totalLeads,
      },
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch admin stats" });
  }
};

// GET /api/admin/users — List users with search + pagination
const getUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const safePage = Math.max(1, Math.floor(Number(page)) || 1);
    const safeLimit = Math.min(50, Math.max(1, Math.floor(Number(limit)) || 20));
    const skip = (safePage - 1) * safeLimit;

    const filter = {};
    if (search && typeof search === "string" && search.trim().length > 0) {
      const safeSearch = escapeRegex(search.trim());
      filter.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { email: { $regex: safeSearch, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        pages: Math.ceil(total / safeLimit),
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch users" });
  }
};

// PATCH /api/admin/users/:id/block — Toggle block/unblock
const blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: "Invalid user ID" });
    }

    if (typeof isBlocked !== "boolean") {
      return res.status(400).json({ success: false, error: "isBlocked must be a boolean" });
    }

    // Prevent admin from blocking themselves
    if (id === req.user._id.toString()) {
      return res.status(400).json({ success: false, error: "Cannot block yourself" });
    }

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Prevent blocking other admins
    if (user.role === "admin") {
      return res.status(400).json({ success: false, error: "Cannot block admin users" });
    }

    user.isBlocked = isBlocked;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isBlocked: user.isBlocked,
      },
    });
  } catch (error) {
    console.error("Block user error:", error);
    res.status(500).json({ success: false, error: "Failed to update user block status" });
  }
};

// GET /api/admin/properties — All properties with filters + pagination
const getAdminProperties = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const safePage = Math.max(1, Math.floor(Number(page)) || 1);
    const safeLimit = Math.min(50, Math.max(1, Math.floor(Number(limit)) || 20));
    const skip = (safePage - 1) * safeLimit;

    const filter = {};
    if (status && ["active", "paused", "expired", "flagged", "rejected"].includes(status)) {
      filter.status = status;
    }
    if (search && typeof search === "string" && search.trim().length > 0) {
      filter.title = { $regex: escapeRegex(search.trim()), $options: "i" };
    }

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .populate("vendorId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      Property.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: properties,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        pages: Math.ceil(total / safeLimit),
      },
    });
  } catch (error) {
    console.error("Get admin properties error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch properties" });
  }
};

// PATCH /api/admin/properties/:id/status — Update property status
const updatePropertyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: "Invalid property ID" });
    }

    const validStatuses = ["active", "paused", "expired", "flagged", "rejected"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Status must be one of: ${validStatuses.join(", ")}` });
    }

    const property = await Property.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )
      .select("_id title status vendorId")
      .lean();

    if (!property) {
      return res.status(404).json({ success: false, error: "Property not found" });
    }

    // Notify vendor when property is flagged or rejected
    if (["flagged", "rejected"].includes(status) && property.vendorId) {
      createNotification({
        userId: property.vendorId,
        type: "property_flagged",
        title: "Property Status Changed",
        message: `Your property "${property.title}" was ${status} by admin`,
        relatedId: property._id,
        relatedModel: "Property",
      });
    }

    res.status(200).json({ success: true, data: property });
  } catch (error) {
    console.error("Update property status error:", error);
    res.status(500).json({ success: false, error: "Failed to update property status" });
  }
};

// DELETE /api/admin/properties/:id — Hard delete a property
const deleteAdminProperty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: "Invalid property ID" });
    }

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ success: false, error: "Property not found" });
    }

    // Delete property and cleanup associated saved/viewed records
    await Promise.all([
      Property.findByIdAndDelete(id),
      SavedProperty.deleteMany({ propertyId: id }),
      RecentlyViewed.deleteMany({ propertyId: id }),
    ]);

    res.status(200).json({ success: true, data: { message: "Property deleted successfully" } });
  } catch (error) {
    console.error("Delete admin property error:", error);
    res.status(500).json({ success: false, error: "Failed to delete property" });
  }
};

// GET /api/admin/grievances — List grievances with filters + pagination
const getGrievances = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const safePage = Math.max(1, Math.floor(Number(page)) || 1);
    const safeLimit = Math.min(50, Math.max(1, Math.floor(Number(limit)) || 20));
    const skip = (safePage - 1) * safeLimit;

    const filter = {};
    if (status && ["pending", "in-progress", "resolved"].includes(status)) {
      filter.status = status;
    }

    const [grievances, total] = await Promise.all([
      Grievance.find(filter)
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      Grievance.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: grievances,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        pages: Math.ceil(total / safeLimit),
      },
    });
  } catch (error) {
    console.error("Get grievances error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch grievances" });
  }
};

// PATCH /api/admin/grievances/:id/status — Update grievance status
const updateGrievanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: "Invalid grievance ID" });
    }

    const validStatuses = ["pending", "in-progress", "resolved"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Status must be one of: ${validStatuses.join(", ")}` });
    }

    const grievance = await Grievance.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )
      .select("_id subject status userId")
      .lean();

    if (!grievance) {
      return res.status(404).json({ success: false, error: "Grievance not found" });
    }

    // Notify user about grievance status change
    if (grievance.userId) {
      createNotification({
        userId: grievance.userId,
        type: "grievance_updated",
        title: "Grievance Update",
        message: `Your grievance "${grievance.subject}" status changed to ${status}`,
        relatedId: grievance._id,
        relatedModel: "Grievance",
      });
    }

    res.status(200).json({ success: true, data: grievance });
  } catch (error) {
    console.error("Update grievance status error:", error);
    res.status(500).json({ success: false, error: "Failed to update grievance status" });
  }
};

// GET /api/admin/appointments — List appointments with filters + pagination
const getAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const safePage = Math.max(1, Math.floor(Number(page)) || 1);
    const safeLimit = Math.min(50, Math.max(1, Math.floor(Number(limit)) || 20));
    const skip = (safePage - 1) * safeLimit;

    const filter = {};
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      filter.status = status;
    }

    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      Appointment.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: appointments,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        pages: Math.ceil(total / safeLimit),
      },
    });
  } catch (error) {
    console.error("Get appointments error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch appointments" });
  }
};

// PATCH /api/admin/appointments/:id/status — Approve or reject appointment
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: "Invalid appointment ID" });
    }

    const validStatuses = ["pending", "approved", "rejected"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Status must be one of: ${validStatuses.join(", ")}` });
    }

    const updateData = { status };
    if (adminNotes && typeof adminNotes === "string") {
      updateData.adminNotes = adminNotes.trim().slice(0, 1000);
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .select("_id appointmentType status userId description")
      .lean();

    if (!appointment) {
      return res.status(404).json({ success: false, error: "Appointment not found" });
    }

    // Notify user about appointment status change
    if (appointment.userId) {
      const typeLabel = appointment.appointmentType.replace("_", " ");
      createNotification({
        userId: appointment.userId,
        type: "grievance_updated",
        title: "Appointment Update",
        message: `Your ${typeLabel} appointment has been ${status}`,
        relatedId: appointment._id,
        relatedModel: "Grievance",
      });
    }

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    console.error("Update appointment status error:", error);
    res.status(500).json({ success: false, error: "Failed to update appointment status" });
  }
};

module.exports = {
  getAdminStats,
  getUsers,
  blockUser,
  getAdminProperties,
  updatePropertyStatus,
  deleteAdminProperty,
  getGrievances,
  updateGrievanceStatus,
  getAppointments,
  updateAppointmentStatus,
};
