const multer = require("multer");

const storage = multer.memoryStorage();

// Image filter: jpg, png, webp only
const imageFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only jpg, png, and webp images are allowed"));
  }
};

// Video filter: mp4 only
const videoFilter = (req, file, cb) => {
  if (file.mimetype === "video/mp4") {
    cb(null, true);
  } else {
    cb(new Error("Only mp4 videos are allowed"));
  }
};

// Multer instances
const uploadImages = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
}).array("images", 10);

const uploadVideo = multer({
  storage,
  fileFilter: videoFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
}).single("video");

// Wrapper to catch multer errors and send proper JSON responses
const handleMulterError = (uploadFn) => (req, res, next) => {
  uploadFn(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ success: false, error: "File size exceeds the limit" });
      }
      if (err.code === "LIMIT_FILE_COUNT") {
        return res
          .status(400)
          .json({ success: false, error: "Too many files" });
      }
      return res.status(400).json({ success: false, error: err.message });
    }
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    next();
  });
};

const uploadAvatarRaw = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("avatar");

module.exports = {
  uploadImages: handleMulterError(uploadImages),
  uploadVideo: handleMulterError(uploadVideo),
  uploadAvatar: handleMulterError(uploadAvatarRaw),
};
