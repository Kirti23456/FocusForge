const StudySession = require("../models/StudySession");

// START SESSION
const startSession = async (req, res) => {
  try {
    // Check if user already has an active session
    const existingSession = await StudySession.findOne({
      user: req.user._id,
      status: "active",
    });

    if (existingSession) {
      return res.status(400).json({
        message: "A study session is already active",
        session: existingSession,
      });
    }

    const session = await StudySession.create({
      user: req.user._id,
      startTime: new Date(),
      status: "active",
    });

    res.status(201).json({
      success: true,
      message: "Study session started",
      session,
    });
  } catch (error) {
    console.error("START SESSION ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to start study session",
    });
  }
};


// STOP SESSION
const stopSession = async (req, res) => {
  try {
    const session = await StudySession.findOne({
      user: req.user._id,
      status: "active",
    });

    if (!session) {
      return res.status(404).json({
        message: "No active study session found",
      });
    }

    const endTime = new Date();

    const duration = Math.floor(
      (endTime - session.startTime) / 1000
    );

    session.endTime = endTime;
    session.duration = duration;
    session.status = "completed";

    await session.save();

    res.status(200).json({
      success: true,
      message: "Study session completed",
      session,
    });
  } catch (error) {
    console.error("STOP SESSION ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to stop study session",
    });
  }
};


// GET ACTIVE SESSION
const getActiveSession = async (req, res) => {
  try {
    const session = await StudySession.findOne({
      user: req.user._id,
      status: "active",
    });

    res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    console.error("GET ACTIVE SESSION ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get active session",
    });
  }
};


// GET SESSION HISTORY
const getSessions = async (req, res) => {
  try {
    const sessions = await StudySession.find({
      user: req.user._id,
      status: "completed",
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      sessions,
    });
  } catch (error) {
    console.error("GET SESSIONS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get study sessions",
    });
  }
};


module.exports = {
  startSession,
  stopSession,
  getActiveSession,
  getSessions,
};