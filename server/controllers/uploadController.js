const cloudinary = require("../config/cloudinary");

// Helper: upload a single buffer to Cloudinary via stream
const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });
};

// POST /api/upload/images
const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "At least one image is required" });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error("❌ Cloudinary env vars not configured");
      return res.status(500).json({ success: false, error: "Upload service is not properly configured" });
    }

    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file.buffer, {
        folder: "chikuprop/properties",
        resource_type: "image",
      })
    );

    const results = await Promise.all(uploadPromises);
    const urls = results.map((r) => r.secure_url);

    res.status(200).json({ success: true, data: { urls } });
  } catch (error) {
    console.error("Image upload error:", error.message || error);
    res
      .status(500)
      .json({ success: false, error: "Image upload failed. Please try again." });
  }
};

// POST /api/upload/video
const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "A video file is required" });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error("❌ Cloudinary env vars not configured");
      return res.status(500).json({ success: false, error: "Upload service is not properly configured" });
    }

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: "chikuprop/properties",
      resource_type: "video",
    });

    res.status(200).json({ success: true, data: { url: result.secure_url } });
  } catch (error) {
    console.error("Video upload error:", error.message || error);
    res
      .status(500)
      .json({ success: false, error: "Video upload failed. Please try again." });
  }
};

module.exports = { uploadImages, uploadVideo };
