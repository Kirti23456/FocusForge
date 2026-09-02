const {
  generateChatResponse,
  generateQuizWithAI,
  generateQuizExplanation,
} = require("../services/aiService");

// =====================================================
// AI CHAT
// =====================================================

const chatWithAI = async (req, res) => {
  try {
    const { messages } = req.body;

    // =================================================
    // VALIDATION
    // =================================================

    if (!Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        message: "Messages must be an array",
      });
    }

    if (messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Messages cannot be empty",
      });
    }

    // =================================================
    // USER ID
    // =================================================

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    // =================================================
    // GENERATE AI RESPONSE
    // =================================================

    const reply = await generateChatResponse(
      messages,
      req.user.id
    );

    // =================================================
    // SUCCESS
    // =================================================

    return res.status(200).json({
      success: true,
      reply,
    });

  } catch (error) {
    console.error(
      "AI chat controller error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "AI chat request failed",
    });
  }
};

// =====================================================
// GENERATE QUIZ
// =====================================================

const generateQuiz = async (req, res) => {
  try {
    const {
      topic,
      difficulty,
      questionCount,
      seed,
      randomize,
      avoidQuestions,
    } = req.body;

    // =================================================
    // VALIDATION
    // =================================================

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: "Topic is required",
      });
    }

    if (!difficulty) {
      return res.status(400).json({
        success: false,
        message: "Difficulty is required",
      });
    }

    const count = Number(questionCount);

    if (![5, 10, 15].includes(count)) {
      return res.status(400).json({
        success: false,
        message:
          "Question count must be 5, 10 or 15",
      });
    }

    // =================================================
    // GENERATE QUIZ
    // =================================================

    const questions =
      await generateQuizWithAI({
        topic,
        difficulty,
        questionCount: count,

        seed:
          seed ||
          `${Date.now()}-${Math.random()}`,

        randomize: randomize !== false,

        avoidQuestions:
          Array.isArray(avoidQuestions)
            ? avoidQuestions
            : [],

        userId: req.user.id,
      });

    return res.status(200).json({
      success: true,
      questions,
    });

  } catch (error) {
    console.error(
      "Quiz generation controller error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Failed to generate AI quiz",
    });
  }
};

// =====================================================
// EXPLAIN WRONG ANSWER
// =====================================================

const explainQuizAnswer = async (req, res) => {
  try {
    const {
      topic,
      difficulty,
      question,
      options,
      userAnswer,
      correctAnswer,
    } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    if (!correctAnswer) {
      return res.status(400).json({
        success: false,
        message: "Correct answer is required",
      });
    }

    const explanation =
      await generateQuizExplanation({
        topic,
        difficulty,
        question,

        options:
          Array.isArray(options)
            ? options
            : [],

        userAnswer:
          userAnswer || "Not answered",

        correctAnswer,
      });

    return res.status(200).json({
      success: true,
      explanation,
    });

  } catch (error) {
    console.error(
      "Quiz explanation controller error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Failed to generate explanation",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  chatWithAI,
  generateQuiz,
  explainQuizAnswer,
};