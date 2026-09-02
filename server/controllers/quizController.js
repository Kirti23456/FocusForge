const {
  generateQuizWithAI,
} = require("../services/aiService");

const Quiz = require("../models/Quiz");

/* =========================================================
   GET USER ID
========================================================= */

const getUserId = (req) => {
  return req.user?._id || req.user?.id;
};

/* =========================================================
   NORMALIZE QUESTIONS
========================================================= */

const normalizeQuestions = (
  questions
) => {
  if (
    !Array.isArray(
      questions
    )
  ) {
    return [];
  }

  return questions
    .map((item) => {
      const questionText =
        String(
          item?.question || ""
        ).trim();

      const options =
        Array.isArray(
          item?.options
        )
          ? item.options
              .map((option) =>
                String(
                  option
                ).trim()
              )
              .filter(Boolean)
          : [];

      const answer =
        String(
          item?.answer ??
            item?.correctAnswer ??
            item?.correct_option ??
            ""
        ).trim();

      const explanation =
        String(
          item?.explanation ||
            "No explanation available."
        ).trim();

      return {
        question:
          questionText,

        options,

        answer,

        explanation,
      };
    })
    .filter(
      (item) => {
        if (
          !item.question
        ) {
          return false;
        }

        if (
          item.options.length !==
          4
        ) {
          return false;
        }

        if (
          !item.answer
        ) {
          return false;
        }

        const correctExists =
          item.options.some(
            (option) =>
              option.toLowerCase() ===
              item.answer.toLowerCase()
          );

        return correctExists;
      }
    );
};

/* =========================================================
   REMOVE DUPLICATES
========================================================= */

const removeDuplicateQuestions = (
  questions
) => {
  const seen =
    new Set();

  return questions.filter(
    (item) => {
      const normalized =
        item.question
          .toLowerCase()
          .replace(
            /\s+/g,
            " "
          )
          .trim();

      if (
        seen.has(
          normalized
        )
      ) {
        return false;
      }

      seen.add(
        normalized
      );

      return true;
    }
  );
};

/* =========================================================
   GENERATE QUIZ
========================================================= */

const generateQuiz = async (
  req,
  res
) => {
  try {
    // ===================================================
    // USER
    // ===================================================

    const userId =
      getUserId(req);

    if (!userId) {
      return res
        .status(401)
        .json({
          success: false,
          message:
            "User authentication required.",
        });
    }

    // ===================================================
    // BODY
    // ===================================================

    const {
      topic,
      difficulty,
      numberOfQuestions,
      revisionMode = false,
      revisionContext = [],
      freshnessSeed = "",
    } = req.body;

    // ===================================================
    // TOPIC
    // ===================================================

    if (
      !topic ||
      !String(topic).trim()
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Topic is required.",
        });
    }

    const cleanTopic =
      String(topic).trim();

    // ===================================================
    // QUESTION COUNT
    // ===================================================

    const count =
      Number(
        numberOfQuestions
      ) || 5;

    if (
      ![5, 10, 15].includes(
        count
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Number of questions must be 5, 10 or 15.",
        });
    }

    // ===================================================
    // DIFFICULTY
    // ===================================================

    const selectedDifficulty =
      String(
        difficulty || "medium"
      ).toLowerCase();

    const allowedDifficulty = [
      "easy",
      "medium",
      "hard",
    ];

    const finalDifficulty =
      allowedDifficulty.includes(
        selectedDifficulty
      )
        ? selectedDifficulty
        : "medium";

    // ===================================================
    // FETCH PREVIOUS USER QUIZZES
    // ===================================================

    const previousQuizzes =
      await Quiz.find({
        user: userId,

        topic: {
          $regex:
            `^${cleanTopic.replace(
              /[.*+?^${}()|[\]\\]/g,
              "\\$&"
            )}$`,

          $options: "i",
        },

        difficulty:
          finalDifficulty,
      })
        .sort({
          createdAt: -1,
        })
        .limit(20)
        .lean();

    // ===================================================
    // PREVIOUS QUESTIONS
    // ===================================================

    const previousList =
      previousQuizzes.flatMap(
        (quiz) =>
          Array.isArray(
            quiz.questions
          )
            ? quiz.questions
                .map(
                  (question) =>
                    question.question
                )
                .filter(Boolean)
            : []
      );

    // ===================================================
    // UNIQUE PREVIOUS QUESTIONS
    // ===================================================

    const uniquePreviousQuestions =
      [
        ...new Set(
          previousList
        ),
      ];

    // ===================================================
    // FRESHNESS SEED
    // ===================================================

    const uniqueSeed =
      freshnessSeed ||
      `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 10)}`;

    // ===================================================
    // GENERATE WITH GEMINI
    // ===================================================

    console.log(
      "======================================"
    );

    console.log(
      "🧠 Generating FocusForge Quiz"
    );

    console.log(
      "Topic:",
      cleanTopic
    );

    console.log(
      "Difficulty:",
      finalDifficulty
    );

    console.log(
      "Questions:",
      count
    );

    console.log(
      "Revision:",
      Boolean(
        revisionMode
      )
    );

    console.log(
      "======================================"
    );

    const generatedQuestions =
      await generateQuizWithAI({
        topic:
          cleanTopic,

        difficulty:
          finalDifficulty,

        questionCount:
          count,

        seed:
          uniqueSeed,

        randomize:
          true,

        avoidQuestions:
          uniquePreviousQuestions,

        revisionMode:
          Boolean(
            revisionMode
          ),

        revisionContext:
          Array.isArray(
            revisionContext
          )
            ? revisionContext
            : [],
      });

    // ===================================================
    // NORMALIZE
    // ===================================================

    let questions =
      normalizeQuestions(
        generatedQuestions
      );

    // ===================================================
    // REMOVE DUPLICATES
    // ===================================================

    questions =
      removeDuplicateQuestions(
        questions
      );

    // ===================================================
    // OLD QUESTION SET
    // ===================================================

    const oldQuestionSet =
      new Set(
        uniquePreviousQuestions.map(
          (question) =>
            String(
              question
            )
              .toLowerCase()
              .replace(
                /\s+/g,
                " "
              )
              .trim()
        )
      );

    // ===================================================
    // REMOVE OLD QUESTIONS AGAIN
    // ===================================================

    questions =
      questions.filter(
        (item) => {
          const normalized =
            item.question
              .toLowerCase()
              .replace(
                /\s+/g,
                " "
              )
              .trim();

          return !oldQuestionSet.has(
            normalized
          );
        }
      );

    // ===================================================
    // FINAL CHECK
    // ===================================================

    if (
      questions.length <
      count
    ) {
      return res
        .status(500)
        .json({
          success: false,
          message:
            "Gemini could not generate enough fresh questions. Please try again.",
        });
    }

    // ===================================================
    // FINAL QUESTIONS
    // ===================================================

    questions =
      questions.slice(
        0,
        count
      );

    // ===================================================
    // RESPONSE
    // ===================================================

    return res
      .status(200)
      .json({
        success: true,

        topic:
          cleanTopic,

        difficulty:
          finalDifficulty,

        numberOfQuestions:
          questions.length,

        revisionMode:
          Boolean(
            revisionMode
          ),

        questions,
      });
  } catch (error) {
    console.error(
      "======================================"
    );

    console.error(
      "❌ Generate Quiz Error"
    );

    console.error(
      error
    );

    console.error(
      "======================================"
    );

    // ===================================================
    // GEMINI HIGH DEMAND
    // ===================================================

    const message =
      String(
        error?.message || ""
      );

    if (
      /high demand/i.test(
        message
      ) ||
      /overloaded/i.test(
        message
      ) ||
      /temporarily unavailable/i.test(
        message
      ) ||
      error?.status ===
        429 ||
      error?.status ===
        503
    ) {
      return res
        .status(503)
        .json({
          success: false,

          message:
            "Gemini is temporarily busy. The backup Gemini model was also unavailable. Please try again in a few seconds.",
        });
    }

    // ===================================================
    // NORMAL ERROR
    // ===================================================

    return res
      .status(500)
      .json({
        success: false,

        message:
          message ||
          "Failed to generate AI quiz.",
      });
  }
};

/* =========================================================
   SAVE QUIZ
========================================================= */

const saveQuiz = async (
  req,
  res
) => {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return res
        .status(401)
        .json({
          success: false,
          message:
            "User authentication required.",
        });
    }

    const {
      topic,
      difficulty,
      questionCount,
      score,
      total,
      percentage,
      revisionMode,
      questions,
    } = req.body;

    if (
      !topic ||
      !Array.isArray(
        questions
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Invalid quiz data.",
        });
    }

    // ===================================================
    // PROCESS QUESTIONS
    // ===================================================

    const processedQuestions =
      questions.map(
        (question) => {
          const userAnswer =
            String(
              question?.userAnswer ||
                ""
            ).trim();

          const correctAnswer =
            String(
              question?.answer ||
                question?.correctAnswer ||
                ""
            ).trim();

          return {
            question:
              question?.question ||
              "",

            options:
              Array.isArray(
                question?.options
              )
                ? question.options
                : [],

            answer:
              correctAnswer,

            explanation:
              question?.explanation ||
              "",

            userAnswer,

            isCorrect:
              Boolean(
                userAnswer &&
                correctAnswer &&
                userAnswer ===
                  correctAnswer
              ),
          };
        }
      );

    // ===================================================
    // CREATE QUIZ
    // ===================================================

    const quiz =
      await Quiz.create({
        user:
          userId,

        topic:
          String(
            topic
          ).trim(),

        difficulty:
          difficulty ||
          "medium",

        questionCount:
          Number(
            questionCount
          ) ||
          questions.length,

        score:
          Number(
            score
          ) || 0,

        total:
          Number(
            total
          ) ||
          questions.length,

        percentage:
          Number(
            percentage
          ) || 0,

        revisionMode:
          Boolean(
            revisionMode
          ),

        questions:
          processedQuestions,
      });

    return res
      .status(201)
      .json({
        success: true,

        message:
          "Quiz saved successfully.",

        quiz,
      });
  } catch (error) {
    console.error(
      "Save Quiz Error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,

        message:
          error?.message ||
          "Failed to save quiz.",
      });
  }
};

/* =========================================================
   GET USER QUIZ HISTORY
========================================================= */

const getQuizHistory = async (
  req,
  res
) => {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return res
        .status(401)
        .json({
          success: false,
          message:
            "User authentication required.",
        });
    }

    const quizzes =
      await Quiz.find({
        user: userId,
      })
        .sort({
          createdAt: -1,
        })
        .limit(50)
        .lean();

    return res
      .status(200)
      .json({
        success: true,

        quizzes,
      });
  } catch (error) {
    console.error(
      "Get Quiz History Error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,

        message:
          error?.message ||
          "Failed to fetch quiz history.",
      });
  }
};

/* =========================================================
   DELETE QUIZ
========================================================= */

const deleteQuiz = async (
  req,
  res
) => {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return res
        .status(401)
        .json({
          success: false,
          message:
            "User authentication required.",
        });
    }

    const { id } =
      req.params;

    const deletedQuiz =
      await Quiz.findOneAndDelete({
        _id: id,

        user: userId,
      });

    if (!deletedQuiz) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Quiz not found.",
        });
    }

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Quiz deleted successfully.",
      });
  } catch (error) {
    console.error(
      "Delete Quiz Error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,

        message:
          error?.message ||
          "Failed to delete quiz.",
      });
  }
};

/* =========================================================
   EXPORT
========================================================= */

module.exports = {
  generateQuiz,
  saveQuiz,
  getQuizHistory,
  deleteQuiz,
};