const Appointment = require("../models/Appointment");
const { stripHtml } = require("../utils/sanitize");

const VALID_TYPES = ["audio_call", "video_call", "chat"];

// POST /api/appointments — Create an appointment request
const createAppointment = async (req, res) => {
  try {
    const { description, appointmentType } = req.body;

    // Validate description
    if (!description || typeof description !== "string") {
      return res.status(400).json({ success: false, error: "Description is required" });
    }
    const sanitizedDesc = stripHtml(description);
    if (sanitizedDesc.length < 20 || sanitizedDesc.length > 2000) {
      return res.status(400).json({ success: false, error: "Description must be between 20 and 2000 characters" });
    }

    // Validate appointment type
    if (!appointmentType || !VALID_TYPES.includes(appointmentType)) {
      return res.status(400).json({ success: false, error: "Appointment type must be audio_call, video_call, or chat" });
    }

    const appointment = await Appointment.create({
      userId: req.user._id,
      description: sanitizedDesc,
      appointmentType,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      data: {
        _id: appointment._id,
        appointmentType: appointment.appointmentType,
        status: appointment.status,
        createdAt: appointment.createdAt,
      },
    });
  } catch (error) {
    console.error("Create appointment error:", error);
    res.status(500).json({ success: false, error: "Failed to create appointment" });
  }
};

// GET /api/appointments/my — Get user's own appointments
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select("description appointmentType status adminNotes createdAt")
      .lean();

    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error("Get my appointments error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch appointments" });
  }
};

module.exports = { createAppointment, getMyAppointments };
