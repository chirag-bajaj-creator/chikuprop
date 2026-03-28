const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/adminController");
const { protect, requireAdmin } = require("../middleware/auth");

// All admin routes require authentication + admin role
router.use(protect, requireAdmin);

// Stats
router.get("/stats", getAdminStats);

// User management
router.get("/users", getUsers);
router.patch("/users/:id/block", blockUser);

// Property moderation
router.get("/properties", getAdminProperties);
router.patch("/properties/:id/status", updatePropertyStatus);
router.delete("/properties/:id", deleteAdminProperty);

// Grievance management
router.get("/grievances", getGrievances);
router.patch("/grievances/:id/status", updateGrievanceStatus);

// Appointment management
router.get("/appointments", getAppointments);
router.patch("/appointments/:id/status", updateAppointmentStatus);

module.exports = router;
