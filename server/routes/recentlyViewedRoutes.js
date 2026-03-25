const express = require("express");
const router = express.Router();
const { recordView, getRecentlyViewed } = require("../controllers/recentlyViewedController");
const { protect } = require("../middleware/auth");

// All recently viewed routes require authentication
router.post("/:propertyId", protect, recordView);
router.get("/", protect, getRecentlyViewed);

module.exports = router;
