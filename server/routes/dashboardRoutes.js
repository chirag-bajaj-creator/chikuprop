const express = require("express");
const router = express.Router();
const { getVendorStats, getBuyerContacted, getMatchingBuyers } = require("../controllers/dashboardController");
const { protect } = require("../middleware/auth");

// All dashboard routes require authentication
router.get("/vendor", protect, getVendorStats);
router.get("/buyer", protect, getBuyerContacted);
router.get("/matching-buyers", protect, getMatchingBuyers);

module.exports = router;
