const StudySession = require("../models/StudySession");

// START SESSION
const startSession = async (req, res) => {
  try {
    const existingSession = await StudySession.findOne({
      user: req.user._id,
      status: "active",
    });

    if (existingSession) {
      return res.status(400).json({
        success: false,
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
    const {
      sessionId,
      duration,
      focusScore,
      distractions,
      phoneDetections,
      sleepyCount,
      noiseDistractions,
      noiseLevel,
      emotion,
      bookDetected,
    } = req.body;

    // IMPORTANT:
    // Session sirf current logged-in user ki hi milegi
    const session = await StudySession.findOne({
      _id: sessionId,
      user: req.user._id,
      status: "active",
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "No active study session found",
      });
    }

    const endTime = new Date();

    // Frontend duration use karenge.
    // Isse paused time count nahi hoga.
    const frontendDuration = Number(duration);

    const finalDuration =
      Number.isFinite(frontendDuration) && frontendDuration >= 0
        ? Math.floor(frontendDuration)
        : Math.floor((endTime - session.startTime) / 1000);

    const finalFocusScore = Math.max(
      0,
      Math.min(100, Number(focusScore) || 0)
    );

    const finalDistractions = Math.max(
      0,
      Math.floor(Number(distractions) || 0)
    );

    const finalPhoneDetections = Math.max(
      0,
      Math.floor(Number(phoneDetections) || 0)
    );

    const finalSleepyCount = Math.max(
      0,
      Math.floor(Number(sleepyCount) || 0)
    );

    const finalNoiseDistractions = Math.max(
      0,
      Math.floor(Number(noiseDistractions) || 0)
    );

    const finalNoiseLevel = Math.max(
      0,
      Math.min(100, Number(noiseLevel) || 0)
    );

    session.endTime = endTime;
    session.duration = finalDuration;
    session.status = "completed";

    session.focusScore = finalFocusScore;
    session.distractionCount = finalDistractions;
    session.phoneDetections = finalPhoneDetections;
    session.sleepyCount = finalSleepyCount;
    session.noiseDistractions = finalNoiseDistractions;
    session.noiseLevel = finalNoiseLevel;

    if (
      [
        "happy",
        "neutral",
        "sad",
        "angry",
        "surprised",
      ].includes(emotion)
    ) {
      session.emotion = emotion;
    }

    session.bookDetected = Boolean(bookDetected);

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
    }).sort({ startTime: -1 });

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