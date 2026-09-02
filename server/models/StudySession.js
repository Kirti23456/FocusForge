// const mongoose = require("mongoose");

// const studySessionSchema = new mongoose.Schema(
//   {
//     // User who started the session
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     // Session start time
//     startTime: {
//       type: Date,
//       required: true,
//     },

//     // Session end time
//     endTime: {
//       type: Date,
//       default: null,
//     },

//     // Duration in seconds
//     duration: {
//       type: Number,
//       default: 0,
//     },

//     // Session status
//     status: {
//       type: String,
//       enum: ["active", "completed"],
//       default: "active",
//     },

//     // Focus monitoring data
//     focusScore: {
//       type: Number,
//       default: 0,
//     },

//     // Number of distractions
//     distractionCount: {
//       type: Number,
//       default: 0,
//     },

//     // Number of sleepy detections
//     sleepyCount: {
//       type: Number,
//       default: 0,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const StudySession = mongoose.model(
//   "StudySession",
//   studySessionSchema
// );

// module.exports = StudySession;





const mongoose = require("mongoose");

const studySessionSchema = new mongoose.Schema(
  {
    // ==========================================
    // USER
    // ==========================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ==========================================
    // SESSION
    // ==========================================

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      default: null,
    },

    duration: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },

    // ==========================================
    // FOCUS
    // ==========================================

    focusScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },

    distractionCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    sleepyCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================
    // PHONE
    // ==========================================

    phoneDetections: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================
    // NOISE
    // ==========================================

    noiseDistractions: {
      type: Number,
      default: 0,
      min: 0,
    },

    noiseLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // ==========================================
    // EMOTION
    // ==========================================

    emotion: {
      type: String,
      enum: [
        "happy",
        "neutral",
        "sad",
        "angry",
        "surprised",
      ],
      default: "neutral",
    },

    // ==========================================
    // BOOK
    // ==========================================

    bookDetected: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const StudySession = mongoose.model(
  "StudySession",
  studySessionSchema
);

module.exports = StudySession;