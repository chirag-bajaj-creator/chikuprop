const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { uploadImages, uploadVideo } = require("../middleware/multerUpload");
const uploadController = require("../controllers/uploadController");

// POST /api/upload/images — upload up to 10 images
router.post("/images", protect, uploadImages, uploadController.uploadImages);

// POST /api/upload/video — upload a single video
router.post("/video", protect, uploadVideo, uploadController.uploadVideo);

module.exports = router;
