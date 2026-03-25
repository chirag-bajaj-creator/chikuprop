const Notification = require("../models/Notification");

const createNotification = async ({ userId, type, title, message, relatedId, relatedModel }) => {
  try {
    await Notification.create({ userId, type, title, message, relatedId, relatedModel });
  } catch (error) {
    // Non-blocking — notification failure should never break the main operation
    console.error("Failed to create notification:", error);
  }
};

module.exports = createNotification;
