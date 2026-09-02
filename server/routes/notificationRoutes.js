const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  getNotifications
);

router.get(
  "/unread",
  authMiddleware,
  getUnreadCount
);

router.put(
  "/read-all",
  authMiddleware,
  markAllAsRead
);

router.put(
  "/:id/read",
  authMiddleware,
  markAsRead
);

router.delete(
  "/:id",
  authMiddleware,
  deleteNotification
);

module.exports = router;