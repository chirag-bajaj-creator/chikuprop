const express = require("express");
const router = express.Router();
const { createAppointment, getMyAppointments } = require("../controllers/appointmentController");
const { protect } = require("../middleware/auth");

// All appointment routes require authentication
router.use(protect);

// Create appointment request
router.post("/", createAppointment);

// Get user's own appointments
router.get("/my", getMyAppointments);

module.exports = router;
