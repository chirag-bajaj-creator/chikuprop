const express = require("express");
const router = express.Router();
const { signup, login, getMe, adminSignup, forgotPassword, resetPassword } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/admin-signup", adminSignup);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
