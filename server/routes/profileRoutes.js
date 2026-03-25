const express = require("express");
const router = express.Router();
const { updateProfile, changePassword, updateAvatar } = require("../controllers/profileController");
const { protect } = require("../middleware/auth");
const { uploadAvatar } = require("../middleware/multerUpload");

router.put("/", protect, updateProfile);
router.put("/password", protect, changePassword);
router.put("/avatar", protect, uploadAvatar, updateAvatar);

module.exports = router;
