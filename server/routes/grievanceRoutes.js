const express = require("express");
const router = express.Router();
const { createGrievance } = require("../controllers/grievanceController");
const { protect } = require("../middleware/auth");

// Submit a grievance (protected)
router.post("/", protect, createGrievance);

module.exports = router;
