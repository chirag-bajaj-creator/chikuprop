const express = require("express");
const router = express.Router();
const {
  saveProperty,
  unsaveProperty,
  getSavedProperties,
  checkSaved,
  checkSavedBatch,
} = require("../controllers/savedController");
const { protect } = require("../middleware/auth");

// All saved routes require authentication
router.get("/", protect, getSavedProperties);
router.get("/check-batch", protect, checkSavedBatch);
router.get("/check/:propertyId", protect, checkSaved);
router.post("/:propertyId", protect, saveProperty);
router.delete("/:propertyId", protect, unsaveProperty);

module.exports = router;
