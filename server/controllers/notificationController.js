const Notification = require("../models/Notification");

// GET /api/notifications — get user's notifications (paginated)
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const safePage = Math.max(1, Math.floor(Number(page)) || 1);
    const safeLimit = Math.min(50, Math.max(1, Math.floor(Number(limit)) || 20));
    const skip = (safePage - 1) * safeLimit;

    const filter = { userId: req.user._id };
    if (unreadOnly === "true") filter.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ isRead: 1, createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId: req.user._id, isRead: false }),
    ]);

    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        pages: Math.ceil(total / safeLimit),
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch notifications" });
  }
};

// GET /api/notifications/unread-count
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user._id, isRead: false });
    res.status(200).json({ success: true, data: { count } });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch unread count" });
  }
};

// PUT /api/notifications/read-all
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );
    res.status(200).json({ success: true, data: { message: "All notifications marked as read" } });
  } catch (error) {
    console.error("Mark all read error:", error);
    res.status(500).json({ success: false, error: "Failed to mark notifications as read" });
  }
};

// PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ success: false, error: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ success: false, error: "Failed to mark notification as read" });
  }
};

module.exports = { getNotifications, getUnreadCount, markAllRead, markAsRead };
