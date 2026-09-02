// const express = require("express");

// const authMiddleware = require("../middleware/authMiddleware");

// const { chatWithAI } = require("../controllers/aiController");

// const router = express.Router();

// /*
// ==========================================
// AI CHAT
// POST /api/ai/chat
// ==========================================
// */

// router.post(
//   "/chat",
//   authMiddleware,
//   chatWithAI
// );

// module.exports = router;


const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  chatWithAI,
  generateQuiz,
  explainQuizAnswer,
} = require("../controllers/aiController");

const router = express.Router();

// =====================================================
// AI CHAT
// POST /api/ai/chat
// =====================================================

router.post(
  "/chat",
  authMiddleware,
  chatWithAI
);

// =====================================================
// AI QUIZ GENERATION
// POST /api/ai/quiz
// =====================================================

router.post(
  "/quiz",
  authMiddleware,
  generateQuiz
);

// =====================================================
// AI WRONG ANSWER EXPLANATION
// POST /api/ai/explain
// =====================================================

router.post(
  "/explain",
  authMiddleware,
  explainQuizAnswer
);

module.exports = router;