const mongoose = require("mongoose");

const quizQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },

    options: {
      type: [String],
      required: true,
    },

    answer: {
      type: String,
      required: true,
    },

    explanation: {
      type: String,
      default: "",
    },

    userAnswer: {
      type: String,
      default: "",
    },

    isCorrect: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    // IMPORTANT:
    // Quiz kis user ka hai
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    topic: {
      type: String,
      required: true,
      trim: true,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },

    questionCount: {
      type: Number,
      required: true,
    },

    score: {
      type: Number,
      default: 0,
    },

    total: {
      type: Number,
      required: true,
    },

    percentage: {
      type: Number,
      default: 0,
    },

    revisionMode: {
      type: Boolean,
      default: false,
    },

    questions: {
      type: [quizQuestionSchema],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Quiz", quizSchema);