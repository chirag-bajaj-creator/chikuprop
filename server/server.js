const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Validate required env vars
const requiredEnvVars = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET", "JWT_SECRET", "MONGO_URI"];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(", ")}`);
  process.exit(1);
}

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const propertyRoutes = require("./routes/propertyRoutes");
const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const leadRoutes = require("./routes/leadRoutes");
const savedRoutes = require("./routes/savedRoutes");
const recentlyViewedRoutes = require("./routes/recentlyViewedRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const adminRoutes = require("./routes/adminRoutes");
const grievanceRoutes = require("./routes/grievanceRoutes");
const profileRoutes = require("./routes/profileRoutes");
const wantedRoutes = require("./routes/wantedRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Middleware
const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://chikuprop.vercel.app",
  "https://chikuprop-fust.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3001",
].filter(Boolean);

// If your Vercel domain changes, add it above for CORS

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/saved", savedRoutes);
app.use("/api/recently-viewed", recentlyViewedRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/grievances", grievanceRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/wanted", wantedRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/appointments", appointmentRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "ChikuProp API is running" });
});

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
