const express = require("express");
const router = express.Router();
const { getNotifications, getUnreadCount, markAllRead, markAsRead } = require("../controllers/notificationController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getNotifications);
router.get("/unread-count", protect, getUnreadCount);
router.put("/read-all", protect, markAllRead);
router.put("/:id/read", protect, markAsRead);

module.exports = router;
