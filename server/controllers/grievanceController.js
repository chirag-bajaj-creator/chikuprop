const Grievance = require("../models/Grievance");
const { stripHtml } = require("../utils/sanitize");

// POST /api/grievances — Submit a grievance
const createGrievance = async (req, res) => {
  try {
    const { subject, message, category } = req.body;

    // Validate subject
    if (!subject || typeof subject !== "string") {
      return res.status(400).json({ success: false, error: "Subject is required" });
    }
    const sanitizedSubject = stripHtml(subject);
    if (sanitizedSubject.length < 5 || sanitizedSubject.length > 200) {
      return res.status(400).json({ success: false, error: "Subject must be between 5 and 200 characters" });
    }

    // Validate message
    if (!message || typeof message !== "string") {
      return res.status(400).json({ success: false, error: "Message is required" });
    }
    const sanitizedMessage = stripHtml(message);
    if (sanitizedMessage.length < 20 || sanitizedMessage.length > 2000) {
      return res.status(400).json({ success: false, error: "Message must be between 20 and 2000 characters" });
    }

    // Validate category if provided
    const validCategories = ["listing", "account", "payment", "technical", "other"];
    const safeCategory = category && validCategories.includes(category) ? category : "other";

    const grievance = await Grievance.create({
      userId: req.user._id,
      subject: sanitizedSubject,
      message: sanitizedMessage,
      category: safeCategory,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      data: {
        _id: grievance._id,
        subject: grievance.subject,
        status: grievance.status,
        createdAt: grievance.createdAt,
      },
    });
  } catch (error) {
    console.error("Create grievance error:", error);
    res.status(500).json({ success: false, error: "Failed to submit grievance" });
  }
};

module.exports = { createGrievance };
