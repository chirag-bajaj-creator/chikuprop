const express = require("express");
const router = express.Router();
const {
  getProperties,
  getPropertyById,
  createProperty,
  getMyProperties,
  updateProperty,
  deleteProperty,
  togglePropertyStatus,
  getSearchSuggestions,
} = require("../controllers/propertyController");
const { protect, optionalAuth } = require("../middleware/auth");

// Public routes
router.get("/", getProperties);
router.get("/search-suggestions", getSearchSuggestions);

// Protected routes — /my MUST come before /:id
router.get("/my", protect, getMyProperties);
router.post("/", protect, createProperty);
router.put("/:id", protect, updateProperty);
router.delete("/:id", protect, deleteProperty);
router.patch("/:id/status", protect, togglePropertyStatus);

// Public single property (optionalAuth to skip view count for owner)
router.get("/:id", optionalAuth, getPropertyById);

module.exports = router;
