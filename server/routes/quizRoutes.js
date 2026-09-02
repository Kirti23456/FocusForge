const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  generateQuiz,
  saveQuiz,
  getQuizHistory,
  deleteQuiz,
} = require("../controllers/quizController");

const router = express.Router();

/* =========================================================
   GENERATE AI QUIZ
   POST /api/quiz/generate
========================================================= */

router.post(
  "/generate",
  authMiddleware,
  generateQuiz
);

/* =========================================================
   SAVE QUIZ
   POST /api/quiz/save
========================================================= */

router.post(
  "/save",
  authMiddleware,
  saveQuiz
);

/* =========================================================
   GET USER HISTORY
   GET /api/quiz/history
========================================================= */

router.get(
  "/history",
  authMiddleware,
  getQuizHistory
);

/* =========================================================
   DELETE USER QUIZ
   DELETE /api/quiz/:id
========================================================= */

router.delete(
  "/:id",
  authMiddleware,
  deleteQuiz
);

module.exports = router;