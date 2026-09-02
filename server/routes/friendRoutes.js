const express = require("express");

const {
  getUsers,
  getMyFriends,
  getFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriendStats,
  getLeaderboard,
} = require("../controllers/friendController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// USERS
// ==========================================

router.get(
  "/users",
  authMiddleware,
  getUsers
);

// ==========================================
// MY FRIENDS
// ==========================================

router.get(
  "/my",
  authMiddleware,
  getMyFriends
);

// ==========================================
// FRIEND REQUESTS
// ==========================================

router.get(
  "/requests",
  authMiddleware,
  getFriendRequests
);

router.post(
  "/request/:userId",
  authMiddleware,
  sendFriendRequest
);

router.put(
  "/accept/:requestId",
  authMiddleware,
  acceptFriendRequest
);

router.put(
  "/reject/:requestId",
  authMiddleware,
  rejectFriendRequest
);

// ==========================================
// REMOVE FRIEND
// ==========================================

router.delete(
  "/remove/:friendId",
  authMiddleware,
  removeFriend
);

// ==========================================
// FRIEND STATS
// ==========================================

router.get(
  "/stats/:userId",
  authMiddleware,
  getFriendStats
);

// ==========================================
// LEADERBOARD
// ==========================================

router.get(
  "/leaderboard",
  authMiddleware,
  getLeaderboard
);

module.exports = router;