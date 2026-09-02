const mongoose = require("mongoose");
const Challenge = require("../models/Challenge");

// =====================================================
// SEND CHALLENGE
// =====================================================

const sendChallenge = async (req, res) => {
  try {
    const {
      opponentId,
      type,
      target,
      duration,
    } = req.body;

    const challengerId = req.user.id;

    console.log("========== SEND CHALLENGE ==========");
    console.log("Challenger:", challengerId);
    console.log("Opponent:", opponentId);
    console.log("Body:", req.body);

    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

    if (
      !opponentId ||
      !type ||
      target === undefined ||
      target === null ||
      !duration
    ) {
      return res.status(400).json({
        success: false,
        message: "All challenge fields are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(opponentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid opponent ID",
      });
    }

    // Cannot challenge yourself
    if (String(challengerId) === String(opponentId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot challenge yourself",
      });
    }

    // -----------------------------------------------------
    // CHALLENGE TYPE
    // -----------------------------------------------------

    let challengeType;

    if (
      type === "focus" ||
      type === "focusTime"
    ) {
      challengeType = "focusTime";
    } else if (type === "sessions") {
      challengeType = "sessions";
    } else if (type === "streak") {
      challengeType = "streak";
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid challenge type",
      });
    }

    // -----------------------------------------------------
    // TARGET
    // -----------------------------------------------------

    const numericTarget = Number(target);

    if (
      !Number.isFinite(numericTarget) ||
      numericTarget <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Target must be greater than 0",
      });
    }

    // -----------------------------------------------------
    // DURATION
    // -----------------------------------------------------

    const numericDuration = Number(duration);

    if (
      !Number.isFinite(numericDuration) ||
      numericDuration <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Duration must be greater than 0",
      });
    }

    // -----------------------------------------------------
    // CHECK EXISTING PENDING CHALLENGE
    // -----------------------------------------------------

    const existingChallenge =
      await Challenge.findOne({
        challenger: challengerId,
        opponent: opponentId,
        status: "pending",
      });

    if (existingChallenge) {
      return res.status(400).json({
        success: false,
        message: "Challenge already sent",
      });
    }

    // -----------------------------------------------------
    // CREATE DATES
    // -----------------------------------------------------

    const startDate = new Date();

    const endDate = new Date();

    endDate.setDate(
      endDate.getDate() + numericDuration
    );

    // -----------------------------------------------------
    // CREATE CHALLENGE
    // -----------------------------------------------------

    const challenge =
      await Challenge.create({
        challenger: challengerId,
        opponent: opponentId,

        type: challengeType,

        target: numericTarget,

        duration: numericDuration,

        startDate,
        endDate,

        status: "pending",

        challengerProgress: 0,
        opponentProgress: 0,
      });

    // -----------------------------------------------------
    // POPULATE
    // -----------------------------------------------------

    const populatedChallenge =
      await Challenge.findById(
        challenge._id
      )
        .populate(
          "challenger",
          "name email avatar"
        )
        .populate(
          "opponent",
          "name email avatar"
        );

    console.log(
      "CHALLENGE CREATED:",
      populatedChallenge
    );

    return res.status(201).json({
      success: true,
      message: "Challenge sent successfully",
      challenge: populatedChallenge,
    });

  } catch (error) {
    console.error(
      "SEND CHALLENGE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to send challenge",
    });
  }
};


// =====================================================
// GET CHALLENGE REQUESTS
// =====================================================

const getChallengeRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests =
      await Challenge.find({
        opponent: userId,
        status: "pending",
      })
        .populate(
          "challenger",
          "name email avatar"
        )
        .populate(
          "opponent",
          "name email avatar"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      requests,
    });

  } catch (error) {
    console.error(
      "GET CHALLENGE REQUESTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch challenge requests",
    });
  }
};


// =====================================================
// GET ACTIVE CHALLENGES
// =====================================================

const getActiveChallenges = async (req, res) => {
  try {
    const userId = req.user.id;

    const challenges =
      await Challenge.find({
        $or: [
          {
            challenger: userId,
          },
          {
            opponent: userId,
          },
        ],

        status: "active",
      })
        .populate(
          "challenger",
          "name email avatar"
        )
        .populate(
          "opponent",
          "name email avatar"
        )
        .populate(
          "winner",
          "name email avatar"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      challenges,
    });

  } catch (error) {
    console.error(
      "GET ACTIVE CHALLENGES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch active challenges",
    });
  }
};


// =====================================================
// GET ALL MY CHALLENGES
// =====================================================

const getMyChallenges = async (req, res) => {
  try {
    const userId = req.user.id;

    const challenges =
      await Challenge.find({
        $or: [
          {
            challenger: userId,
          },
          {
            opponent: userId,
          },
        ],
      })
        .populate(
          "challenger",
          "name email avatar"
        )
        .populate(
          "opponent",
          "name email avatar"
        )
        .populate(
          "winner",
          "name email avatar"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      challenges,
    });

  } catch (error) {
    console.error(
      "GET CHALLENGES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch challenges",
    });
  }
};


// =====================================================
// ACCEPT CHALLENGE
// =====================================================

const acceptChallenge = async (req, res) => {
  try {
    const userId = req.user.id;

    const challenge =
      await Challenge.findOne({
        _id: req.params.id,

        // Only opponent can accept
        opponent: userId,

        status: "pending",
      });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: "Challenge not found",
      });
    }

    // Activate
    challenge.status = "active";

    challenge.startDate = new Date();

    const endDate = new Date();

    endDate.setDate(
      endDate.getDate() +
        Number(challenge.duration)
    );

    challenge.endDate = endDate;

    await challenge.save();

    // Populate
    const populatedChallenge =
      await Challenge.findById(
        challenge._id
      )
        .populate(
          "challenger",
          "name email avatar"
        )
        .populate(
          "opponent",
          "name email avatar"
        );

    return res.status(200).json({
      success: true,
      message: "Challenge accepted",
      challenge: populatedChallenge,
    });

  } catch (error) {
    console.error(
      "ACCEPT CHALLENGE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to accept challenge",
    });
  }
};


// =====================================================
// REJECT CHALLENGE
// =====================================================

const rejectChallenge = async (req, res) => {
  try {
    const userId = req.user.id;

    const challenge =
      await Challenge.findOne({
        _id: req.params.id,

        // Only opponent can reject
        opponent: userId,

        status: "pending",
      });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: "Challenge not found",
      });
    }

    challenge.status = "rejected";

    await challenge.save();

    return res.status(200).json({
      success: true,
      message: "Challenge rejected",
      challenge,
    });

  } catch (error) {
    console.error(
      "REJECT CHALLENGE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to reject challenge",
    });
  }
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  sendChallenge,
  getChallengeRequests,
  getActiveChallenges,
  getMyChallenges,
  acceptChallenge,
  rejectChallenge,
};