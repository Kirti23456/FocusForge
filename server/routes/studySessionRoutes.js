// const express = require("express");

// const authMiddleware = require("../middleware/authMiddleware");
// const StudySession = require("../models/StudySession");

// const router = express.Router();


// // ==========================================
// // DEBUG
// // ==========================================

// console.log("===== STUDY SESSION DEBUG =====");
// console.log(
//   "authMiddleware:",
//   typeof authMiddleware
// );
// console.log(
//   "StudySession:",
//   typeof StudySession
// );
// console.log(
//   "StudySession.create:",
//   typeof StudySession.create
// );
// console.log(
//   "StudySession.findOne:",
//   typeof StudySession.findOne
// );
// console.log("================================");


// // ==========================================
// // START STUDY SESSION
// // POST /api/study-sessions/start
// // ==========================================

// router.post(
//   "/start",
//   authMiddleware,
//   async (req, res) => {
//     try {

//       // Check existing active session
//       const existingSession =
//         await StudySession.findOne({
//           user: req.user.id,
//           status: "active",
//         });

//       if (existingSession) {
//         return res.status(400).json({
//           success: false,
//           message:
//             "A study session is already active",
//           session: existingSession,
//         });
//       }

//       // Create new session
//       const session =
//         await StudySession.create({
//           user: req.user.id,
//           startTime: new Date(),
//           status: "active",
//           focusScore: 0,
//           distractionCount: 0,
//           sleepyCount: 0,
//         });

//       return res.status(201).json({
//         success: true,
//         message: "Study session started",
//         session,
//       });

//     } catch (error) {

//       console.error(
//         "START SESSION ERROR:",
//         error
//       );

//       return res.status(500).json({
//         success: false,
//         message:
//           "Failed to start study session",
//       });
//     }
//   }
// );


// // ==========================================
// // STOP STUDY SESSION
// // POST /api/study-sessions/stop
// // ==========================================

// router.post(
//   "/stop",
//   authMiddleware,
//   async (req, res) => {
//     try {

//       const session =
//         await StudySession.findOne({
//           user: req.user.id,
//           status: "active",
//         }).sort({
//           createdAt: -1,
//         });

//       if (!session) {
//         return res.status(404).json({
//           success: false,
//           message:
//             "No active study session found",
//         });
//       }

//       // End time
//       const endTime = new Date();

//       // Duration in seconds
//       const duration = Math.floor(
//         (endTime - session.startTime) /
//           1000
//       );

//       session.endTime = endTime;
//       session.duration = duration;
//       session.status = "completed";

//       await session.save();

//       return res.status(200).json({
//         success: true,
//         message:
//           "Study session completed",
//         session,
//       });

//     } catch (error) {

//       console.error(
//         "STOP SESSION ERROR:",
//         error
//       );

//       return res.status(500).json({
//         success: false,
//         message:
//           "Failed to stop study session",
//       });
//     }
//   }
// );


// // ==========================================
// // GET ACTIVE SESSION
// // GET /api/study-sessions/active
// // ==========================================

// router.get(
//   "/active",
//   authMiddleware,
//   async (req, res) => {
//     try {

//       const session =
//         await StudySession.findOne({
//           user: req.user.id,
//           status: "active",
//         }).sort({
//           createdAt: -1,
//         });

//       return res.status(200).json({
//         success: true,
//         session: session || null,
//       });

//     } catch (error) {

//       console.error(
//         "GET ACTIVE SESSION ERROR:",
//         error
//       );

//       return res.status(500).json({
//         success: false,
//         message:
//           "Failed to get active session",
//       });
//     }
//   }
// );


// // ==========================================
// // GET SESSION HISTORY
// // GET /api/study-sessions
// // ==========================================

// router.get(
//   "/",
//   authMiddleware,
//   async (req, res) => {
//     try {

//       const sessions =
//         await StudySession.find({
//           user: req.user.id,
//           status: "completed",
//         }).sort({
//           createdAt: -1,
//         });

//       return res.status(200).json({
//         success: true,
//         sessions,
//       });

//     } catch (error) {

//       console.error(
//         "GET SESSIONS ERROR:",
//         error
//       );

//       return res.status(500).json({
//         success: false,
//         message:
//           "Failed to fetch study sessions",
//       });
//     }
//   }
// );


// // ==========================================
// // UPDATE FOCUS DATA
// // PUT /api/study-sessions/:id/focus
// // ==========================================

// router.put(
//   "/:id/focus",
//   authMiddleware,
//   async (req, res) => {
//     try {

//       const {
//         focusScore,
//         distractionCount,
//         sleepyCount,
//       } = req.body;

//       const session =
//         await StudySession.findOne({
//           _id: req.params.id,
//           user: req.user.id,
//         });

//       if (!session) {
//         return res.status(404).json({
//           success: false,
//           message: "Session not found",
//         });
//       }

//       if (focusScore !== undefined) {
//         session.focusScore =
//           Math.max(
//             0,
//             Math.min(100, Number(focusScore))
//           );
//       }

//       if (
//         distractionCount !== undefined
//       ) {
//         session.distractionCount =
//           Math.max(
//             0,
//             Number(distractionCount)
//           );
//       }

//       if (sleepyCount !== undefined) {
//         session.sleepyCount =
//           Math.max(
//             0,
//             Number(sleepyCount)
//           );
//       }

//       await session.save();

//       return res.status(200).json({
//         success: true,
//         message:
//           "Focus data updated",
//         session,
//       });

//     } catch (error) {

//       console.error(
//         "UPDATE FOCUS ERROR:",
//         error
//       );

//       return res.status(500).json({
//         success: false,
//         message:
//           "Failed to update focus data",
//       });
//     }
//   }
// );


// module.exports = router;


const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const StudySession = require("../models/StudySession");

const router = express.Router();

// =====================================================
// START STUDY SESSION
// POST /api/study-sessions/start
// =====================================================

router.post(
  "/start",
  authMiddleware,
  async (req, res) => {
    try {
      // -----------------------------------------------
      // CURRENT LOGGED-IN USER
      // -----------------------------------------------

      const userId = req.user.id;

      console.log(
        "START SESSION USER:",
        userId
      );

      // -----------------------------------------------
      // CHECK ACTIVE SESSION
      // -----------------------------------------------

      const existingSession =
        await StudySession.findOne({
          user: userId,
          status: "active",
        });

      if (existingSession) {
        return res.status(400).json({
          success: false,
          message:
            "A study session is already active",
          session: existingSession,
        });
      }

      // -----------------------------------------------
      // CREATE SESSION
      // -----------------------------------------------

      const session =
        await StudySession.create({
          user: userId,

          startTime: new Date(),

          status: "active",

          focusScore: 100,

          distractionCount: 0,

          sleepyCount: 0,

          phoneDetections: 0,

          noiseDistractions: 0,

          noiseLevel: 0,

          emotion: "neutral",

          bookDetected: false,
        });

      console.log(
        "SESSION CREATED:",
        session._id,
        "USER:",
        session.user
      );

      return res.status(201).json({
        success: true,
        message:
          "Study session started",
        session,
      });
    } catch (error) {
      console.error(
        "START SESSION ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to start study session",
      });
    }
  }
);

// =====================================================
// STOP STUDY SESSION
// POST /api/study-sessions/stop
// =====================================================

router.post(
  "/stop",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const {
        sessionId,
        duration,
        focusScore,
        distractions,
        phoneDetections,
        noiseDistractions,
        noiseLevel,
        emotion,
        bookDetected,
      } = req.body;

      console.log(
        "STOP SESSION USER:",
        userId
      );

      console.log(
        "STOP SESSION ID:",
        sessionId
      );

      // =================================================
      // FIND USER'S SESSION
      // =================================================

      let session;

      if (sessionId) {
        session =
          await StudySession.findOne({
            _id: sessionId,
            user: userId,
            status: "active",
          });
      } else {
        session =
          await StudySession.findOne({
            user: userId,
            status: "active",
          }).sort({
            createdAt: -1,
          });
      }

      // =================================================
      // SESSION NOT FOUND
      // =================================================

      if (!session) {
        return res.status(404).json({
          success: false,
          message:
            "No active study session found",
        });
      }

      // =================================================
      // END TIME
      // =================================================

      const endTime = new Date();

      // =================================================
      // DURATION
      // =================================================

      const calculatedDuration =
        Math.floor(
          (endTime - session.startTime) /
            1000
        );

      const finalDuration =
        Number.isFinite(Number(duration)) &&
        Number(duration) >= 0
          ? Number(duration)
          : calculatedDuration;

      // =================================================
      // UPDATE SESSION
      // =================================================

      session.endTime = endTime;

      session.duration = finalDuration;

      session.status = "completed";

      // =================================================
      // FOCUS SCORE
      // =================================================

      if (focusScore !== undefined) {
        session.focusScore = Math.max(
          0,
          Math.min(
            100,
            Number(focusScore) || 0
          )
        );
      }

      // =================================================
      // DISTRACTIONS
      // =================================================

      if (distractions !== undefined) {
        session.distractionCount =
          Math.max(
            0,
            Number(distractions) || 0
          );
      }

      // =================================================
      // PHONE
      // =================================================

      if (
        phoneDetections !== undefined
      ) {
        session.phoneDetections =
          Math.max(
            0,
            Number(phoneDetections) || 0
          );
      }

      // =================================================
      // NOISE DISTRACTIONS
      // =================================================

      if (
        noiseDistractions !== undefined
      ) {
        session.noiseDistractions =
          Math.max(
            0,
            Number(noiseDistractions) || 0
          );
      }

      // =================================================
      // NOISE LEVEL
      // =================================================

      if (noiseLevel !== undefined) {
        session.noiseLevel = Math.max(
          0,
          Math.min(
            100,
            Number(noiseLevel) || 0
          )
        );
      }

      // =================================================
      // EMOTION
      // =================================================

      const validEmotions = [
        "happy",
        "neutral",
        "sad",
        "angry",
        "surprised",
      ];

      if (
        emotion &&
        validEmotions.includes(
          String(emotion).toLowerCase()
        )
      ) {
        session.emotion =
          String(emotion).toLowerCase();
      }

      // =================================================
      // BOOK
      // =================================================

      if (bookDetected !== undefined) {
        session.bookDetected =
          Boolean(bookDetected);
      }

      // =================================================
      // SAVE
      // =================================================

      await session.save();

      console.log(
        "SESSION COMPLETED:",
        session._id
      );

      console.log(
        "SESSION USER:",
        session.user
      );

      console.log(
        "FINAL FOCUS:",
        session.focusScore
      );

      console.log(
        "FINAL DISTRACTIONS:",
        session.distractionCount
      );

      // =================================================
      // RESPONSE
      // =================================================

      return res.status(200).json({
        success: true,
        message:
          "Study session completed",
        session,
      });
    } catch (error) {
      console.error(
        "STOP SESSION ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to stop study session",
      });
    }
  }
);

// =====================================================
// GET ACTIVE SESSION
// GET /api/study-sessions/active
// =====================================================

router.get(
  "/active",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const session =
        await StudySession.findOne({
          user: userId,
          status: "active",
        }).sort({
          createdAt: -1,
        });

      return res.status(200).json({
        success: true,
        session: session || null,
      });
    } catch (error) {
      console.error(
        "GET ACTIVE SESSION ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to get active session",
      });
    }
  }
);

// =====================================================
// GET SESSION HISTORY
// GET /api/study-sessions
// =====================================================

router.get(
  "/",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const sessions =
        await StudySession.find({
          user: userId,
          status: "completed",
        }).sort({
          createdAt: -1,
        });

      return res.status(200).json({
        success: true,
        sessions,
      });
    } catch (error) {
      console.error(
        "GET SESSIONS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch study sessions",
      });
    }
  }
);

// =====================================================
// UPDATE FOCUS DATA
// PUT /api/study-sessions/:id/focus
// =====================================================

router.put(
  "/:id/focus",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const {
        focusScore,
        distractionCount,
        sleepyCount,
        phoneDetections,
        noiseDistractions,
        noiseLevel,
        emotion,
        bookDetected,
      } = req.body;

      // =================================================
      // IMPORTANT
      // Find session using BOTH:
      //
      // session ID
      // +
      // logged-in user's ID
      //
      // So another user cannot modify it.
      // =================================================

      const session =
        await StudySession.findOne({
          _id: req.params.id,
          user: userId,
        });

      if (!session) {
        return res.status(404).json({
          success: false,
          message:
            "Session not found",
        });
      }

      // =================================================
      // FOCUS
      // =================================================

      if (focusScore !== undefined) {
        session.focusScore =
          Math.max(
            0,
            Math.min(
              100,
              Number(focusScore) || 0
            )
          );
      }

      // =================================================
      // DISTRACTIONS
      // =================================================

      if (
        distractionCount !== undefined
      ) {
        session.distractionCount =
          Math.max(
            0,
            Number(distractionCount) || 0
          );
      }

      // =================================================
      // SLEEPY
      // =================================================

      if (sleepyCount !== undefined) {
        session.sleepyCount =
          Math.max(
            0,
            Number(sleepyCount) || 0
          );
      }

      // =================================================
      // PHONE
      // =================================================

      if (
        phoneDetections !== undefined
      ) {
        session.phoneDetections =
          Math.max(
            0,
            Number(phoneDetections) || 0
          );
      }

      // =================================================
      // NOISE DISTRACTIONS
      // =================================================

      if (
        noiseDistractions !== undefined
      ) {
        session.noiseDistractions =
          Math.max(
            0,
            Number(noiseDistractions) || 0
          );
      }

      // =================================================
      // NOISE LEVEL
      // =================================================

      if (noiseLevel !== undefined) {
        session.noiseLevel =
          Math.max(
            0,
            Math.min(
              100,
              Number(noiseLevel) || 0
            )
          );
      }

      // =================================================
      // EMOTION
      // =================================================

      const validEmotions = [
        "happy",
        "neutral",
        "sad",
        "angry",
        "surprised",
      ];

      if (
        emotion &&
        validEmotions.includes(
          String(emotion).toLowerCase()
        )
      ) {
        session.emotion =
          String(emotion).toLowerCase();
      }

      // =================================================
      // BOOK
      // =================================================

      if (bookDetected !== undefined) {
        session.bookDetected =
          Boolean(bookDetected);
      }

      // =================================================
      // SAVE
      // =================================================

      await session.save();

      return res.status(200).json({
        success: true,
        message:
          "Focus data updated",
        session,
      });
    } catch (error) {
      console.error(
        "UPDATE FOCUS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update focus data",
      });
    }
  }
);

module.exports = router;