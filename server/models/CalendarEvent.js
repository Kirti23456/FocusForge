// const mongoose = require("mongoose");

// const calendarEventSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     title: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     description: {
//       type: String,
//       default: "",
//       trim: true,
//     },

//     date: {
//       type: Date,
//       required: true,
//     },

//     duration: {
//       type: Number,
//       default: 60,
//       min: 1,
//     },

//     type: {
//       type: String,
//       enum: [
//         "study",
//         "revision",
//         "exam",
//         "meeting",
//         "other",
//       ],
//       default: "study",
//     },

//     completed: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const CalendarEvent = mongoose.model(
//   "CalendarEvent",
//   calendarEventSchema
// );

// module.exports = CalendarEvent;



const mongoose = require("mongoose");

const calendarEventSchema = new mongoose.Schema(
  {
    // =====================================================
    // USER
    // =====================================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =====================================================
    // TITLE
    // =====================================================

    title: {
      type: String,
      required: true,
      trim: true,
    },

    // =====================================================
    // DESCRIPTION
    // =====================================================

    description: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================================
    // DATE & TIME
    // =====================================================

    date: {
      type: Date,
      required: true,
    },

    // =====================================================
    // DURATION
    // =====================================================

    duration: {
      type: Number,
      default: 60,
      min: 1,
    },

    // =====================================================
    // EVENT TYPE
    // =====================================================

    type: {
      type: String,
      enum: [
        "study",
        "revision",
        "exam",
        "meeting",
        "other",
      ],
      default: "study",
    },

    // =====================================================
    // PRIORITY
    // =====================================================

    priority: {
      type: String,
      enum: [
        "low",
        "medium",
        "high",
      ],
      default: "medium",
    },

    // =====================================================
    // COMPLETED
    // =====================================================

    completed: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
  }
);

const CalendarEvent = mongoose.model(
  "CalendarEvent",
  calendarEventSchema
);

module.exports = CalendarEvent;