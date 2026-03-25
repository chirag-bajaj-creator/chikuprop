const express = require("express");
const router = express.Router();
const { unlockContact, checkUnlockStatus, getVendorLeads, getBuyerLeads } = require("../controllers/leadController");
const { protect } = require("../middleware/auth");

// All lead routes require authentication
router.post("/unlock/:propertyId", protect, unlockContact);
router.get("/check/:propertyId", protect, checkUnlockStatus);
router.get("/vendor", protect, getVendorLeads);
router.get("/buyer", protect, getBuyerLeads);

module.exports = router;
