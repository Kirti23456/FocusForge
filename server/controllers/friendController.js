const User = require("../models/User");
const FriendRequest = require("../models/FriendRequest");
const Friend = require("../models/Friend");
const StudySession = require("../models/StudySession");

// ==========================================
// GET ALL USERS
// ==========================================

const getUsers = async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user.id },
    }).select("name email avatar createdAt");

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get Users Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// ==========================================
// GET MY FRIENDS
// ==========================================

const getMyFriends = async (req, res) => {
  try {
    const userId = req.user.id;

    const friendships = await Friend.find({
      $or: [
        { user1: userId },
        { user2: userId },
      ],
    })
      .populate("user1", "name email avatar")
      .populate("user2", "name email avatar");

    const friends = friendships
      .map((friendship) => {
        if (!friendship.user1 || !friendship.user2) {
          return null;
        }

        if (
          friendship.user1._id.toString() ===
          userId.toString()
        ) {
          return friendship.user2;
        }

        return friendship.user1;
      })
      .filter(Boolean);

    res.status(200).json({
      success: true,
      friends,
    });
  } catch (error) {
    console.error("Get Friends Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch friends",
    });
  }
};

// ==========================================
// GET FRIEND REQUESTS
// ==========================================

const getFriendRequests = async (req, res) => {
  try {
    console.log(
      "Getting requests for user:",
      req.user.id
    );

    const requests = await FriendRequest.find({
      receiver: req.user.id,
      status: "pending",
    })
      .populate("sender", "name email avatar")
      .sort({ createdAt: -1 });

    console.log(
      "Requests found:",
      requests.map((r) => ({
        id: r._id,
        sender: r.sender?._id,
        receiver: r.receiver,
      }))
    );

    res.status(200).json({
      success: true,
      requests,
    });

  } catch (error) {
    console.error("Get Friend Requests Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch friend requests",
    });
  }
};

// ==========================================
// SEND FRIEND REQUEST
// ==========================================

const sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { userId: receiverId } = req.params;

    console.log("===== SEND FRIEND REQUEST =====");
    console.log("Sender:", senderId);
    console.log("Receiver:", receiverId);
    console.log("================================");

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Cannot send request to yourself
    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a friend request to yourself",
      });
    }

    // Check receiver exists
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check already friends
    const existingFriend = await Friend.findOne({
      $or: [
        {
          user1: senderId,
          user2: receiverId,
        },
        {
          user1: receiverId,
          user2: senderId,
        },
      ],
    });

    if (existingFriend) {
      return res.status(400).json({
        success: false,
        message: "You are already friends",
      });
    }

    // Check pending request
    const existingRequest = await FriendRequest.findOne({
      $or: [
        {
          sender: senderId,
          receiver: receiverId,
          status: "pending",
        },
        {
          sender: receiverId,
          receiver: senderId,
          status: "pending",
        },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "Friend request already exists",
      });
    }

    // IMPORTANT
    // sender = logged-in user
    // receiver = jis user ke Add Friend button par click kiya
    const request = await FriendRequest.create({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });

    console.log("REQUEST CREATED:");
    console.log("Request ID:", request._id);
    console.log("Sender:", request.sender);
    console.log("Receiver:", request.receiver);

    res.status(201).json({
      success: true,
      message: "Friend request sent",
      request,
    });

  } catch (error) {
    console.error("Send Friend Request Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send friend request",
    });
  }
};

// ==========================================
// ACCEPT FRIEND REQUEST
// ==========================================

const acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    const request = await FriendRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found",
      });
    }

    if (
      request.receiver.toString() !==
      userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot accept this request",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Friend request is no longer pending",
      });
    }

    const existingFriend = await Friend.findOne({
      $or: [
        {
          user1: request.sender,
          user2: request.receiver,
        },
        {
          user1: request.receiver,
          user2: request.sender,
        },
      ],
    });

    if (!existingFriend) {
      await Friend.create({
        user1: request.sender,
        user2: request.receiver,
      });
    }

    request.status = "accepted";
    await request.save();

    res.status(200).json({
      success: true,
      message: "Friend request accepted",
    });
  } catch (error) {
    console.error("Accept Friend Request Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to accept friend request",
    });
  }
};

// ==========================================
// REJECT FRIEND REQUEST
// ==========================================

const rejectFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    const request = await FriendRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found",
      });
    }

    if (
      request.receiver.toString() !==
      userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot reject this request",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Friend request is no longer pending",
      });
    }

    request.status = "rejected";
    await request.save();

    res.status(200).json({
      success: true,
      message: "Friend request rejected",
    });
  } catch (error) {
    console.error("Reject Friend Request Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to reject friend request",
    });
  }
};

// ==========================================
// REMOVE FRIEND
// ==========================================

const removeFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.params;

    const friendship = await Friend.findOne({
      $or: [
        {
          user1: userId,
          user2: friendId,
        },
        {
          user1: friendId,
          user2: userId,
        },
      ],
    });

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: "Friendship not found",
      });
    }

    await Friend.findByIdAndDelete(friendship._id);

    res.status(200).json({
      success: true,
      message: "Friend removed successfully",
    });
  } catch (error) {
    console.error("Remove Friend Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to remove friend",
    });
  }
};

// ==========================================
// GET FRIEND STATS
// ==========================================

// ==========================================
// GET FRIEND STATS
// ==========================================

const getFriendStats = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;
    const { userId } = req.params;

    // ==========================================
    // CHECK SELF
    // ==========================================

    const isSelf =
      loggedInUserId.toString() ===
      userId.toString();

    // ==========================================
    // CHECK FRIENDSHIP
    // ==========================================

    let isFriend = false;

    if (!isSelf) {
      const friendship =
        await Friend.findOne({
          $or: [
            {
              user1: loggedInUserId,
              user2: userId,
            },
            {
              user1: userId,
              user2: loggedInUserId,
            },
          ],
        });

      isFriend = !!friendship;
    }

    // ==========================================
    // ONLY SELF OR FRIEND ALLOWED
    // ==========================================

    if (!isSelf && !isFriend) {
      return res.status(403).json({
        success: false,
        message:
          "You can only view your own or your friend's stats",
      });
    }

    // ==========================================
    // GET STUDY SESSIONS
    // ==========================================

    const sessions =
      await StudySession.find({
        user: userId,
        status: "completed",
      }).sort({
        startTime: 1,
      });

    const totalSessions =
      sessions.length;

    const totalDuration =
      sessions.reduce(
        (sum, session) =>
          sum +
          (session.duration || 0),
        0
      );

    const averageFocus =
      totalSessions > 0
        ? Math.round(
            sessions.reduce(
              (sum, session) =>
                sum +
                (session.focusScore || 0),
              0
            ) / totalSessions
          )
        : 0;

    const totalDistractions =
      sessions.reduce(
        (sum, session) =>
          sum +
          (session.distractionCount || 0),
        0
      );

    const totalSleepy =
      sessions.reduce(
        (sum, session) =>
          sum +
          (session.sleepyCount || 0),
        0
      );

    // ==========================================
    // STREAK
    // ==========================================

    const uniqueDates = [
      ...new Set(
        sessions.map((session) =>
          new Date(session.startTime)
            .toISOString()
            .split("T")[0]
        )
      ),
    ];

    let streak = 0;

    if (uniqueDates.length > 0) {
      let currentDate = new Date();

      currentDate.setHours(
        0,
        0,
        0,
        0
      );

      const todayString =
        currentDate
          .toISOString()
          .split("T")[0];

      if (
        !uniqueDates.includes(
          todayString
        )
      ) {
        currentDate.setDate(
          currentDate.getDate() - 1
        );
      }

      for (
        let i = uniqueDates.length - 1;
        i >= 0;
        i--
      ) {
        const studyDate =
          new Date(uniqueDates[i]);

        studyDate.setHours(
          0,
          0,
          0,
          0
        );

        const difference =
          Math.floor(
            (currentDate -
              studyDate) /
              (1000 *
                60 *
                60 *
                24)
          );

        if (difference === 0) {
          streak++;

          currentDate.setDate(
            currentDate.getDate() - 1
          );
        } else if (
          difference > 0
        ) {
          break;
        }
      }
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(200).json({
      success: true,

      stats: {
        totalSessions,
        totalDuration,
        averageFocus,
        totalDistractions,
        totalSleepy,
        streak,
      },
    });

  } catch (error) {
    console.error(
      "Get Friend Stats Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch friend stats",
    });
  }
};

// ==========================================
// LEADERBOARD
// ==========================================

// ==========================================
// USER-SPECIFIC LEADERBOARD
// ==========================================

const getLeaderboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // ==========================================
    // GET MY FRIENDSHIPS
    // ==========================================

    const friendships = await Friend.find({
      $or: [
        { user1: userId },
        { user2: userId },
      ],
    });

    // ==========================================
    // GET FRIEND IDS
    // ==========================================

    const friendIds = friendships.map((friendship) => {
      if (
        friendship.user1.toString() ===
        userId.toString()
      ) {
        return friendship.user2;
      }

      return friendship.user1;
    });

    // ==========================================
    // INCLUDE LOGGED-IN USER + FRIENDS
    // ==========================================

    const leaderboardUserIds = [
      userId,
      ...friendIds,
    ];

    // Remove duplicate IDs
    const uniqueUserIds = [
      ...new Set(
        leaderboardUserIds.map((id) =>
          id.toString()
        )
      ),
    ];

    // ==========================================
    // GET USERS
    // ==========================================

    const users = await User.find({
      _id: {
        $in: uniqueUserIds,
      },
    }).select(
      "name email avatar"
    );

    // ==========================================
    // BUILD LEADERBOARD
    // ==========================================

    const leaderboard = [];

    for (const user of users) {
      const sessions = await StudySession.find({
        user: user._id,
        status: "completed",
      });

      const totalDuration = sessions.reduce(
        (sum, session) =>
          sum + (session.duration || 0),
        0
      );

      const averageFocus =
        sessions.length > 0
          ? Math.round(
              sessions.reduce(
                (sum, session) =>
                  sum +
                  (session.focusScore || 0),
                0
              ) / sessions.length
            )
          : 0;

      leaderboard.push({
        user,
        totalSessions: sessions.length,
        totalDuration,
        averageFocus,
        isMe:
          user._id.toString() ===
          userId.toString(),
      });
    }

    // ==========================================
    // SORT BY FOCUS TIME
    // ==========================================

    leaderboard.sort(
      (a, b) =>
        b.totalDuration -
        a.totalDuration
    );

    // ==========================================
    // ADD RANK
    // ==========================================

    const rankedLeaderboard =
      leaderboard.map(
        (item, index) => ({
          rank: index + 1,
          ...item,
        })
      );

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(200).json({
      success: true,
      leaderboard:
        rankedLeaderboard,
    });

  } catch (error) {
    console.error(
      "Get User-Specific Leaderboard Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch leaderboard",
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  getUsers,
  getMyFriends,
  getFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriendStats,
  getLeaderboard,
};