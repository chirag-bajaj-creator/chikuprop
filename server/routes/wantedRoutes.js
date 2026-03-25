const express = require("express");
const router = express.Router();
const { getWantedProperties, createWanted, getMyWanted, updateWanted, deleteWanted } = require("../controllers/wantedController");
const { protect, optionalAuth } = require("../middleware/auth");

router.get("/", optionalAuth, getWantedProperties);
router.post("/", protect, createWanted);
router.get("/mine", protect, getMyWanted);
router.put("/:id", protect, updateWanted);
router.delete("/:id", protect, deleteWanted);

module.exports = router;
