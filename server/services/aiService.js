// =====================================================
// FOCUSFORGE AI SERVICE
// =====================================================

const Reminder = require("../models/Reminder");

// =====================================================
// GEMINI CONFIG
// =====================================================

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY;

// Primary model
const GEMINI_MODEL =
  process.env.GEMINI_MODEL ||
  "gemini-3.6-flash";

// Fallback model
const GEMINI_FALLBACK_MODEL =
  process.env.GEMINI_FALLBACK_MODEL ||
  "gemini-3.5-flash-lite";

// =====================================================
// CHECK API KEY
// =====================================================

const checkApiKey = () => {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is missing in server .env"
    );
  }
};

// =====================================================
// GET GEMINI URL
// =====================================================

const getGeminiUrl = (model) => {
  return (
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `${model}:generateContent?key=${GEMINI_API_KEY}`
  );
};

// =====================================================
// GEMINI REQUEST
// =====================================================

const callGemini = async ({
  prompt,
  json = false,
}) => {
  checkApiKey();

  const modelsToTry = [
    GEMINI_MODEL,
    GEMINI_FALLBACK_MODEL,
  ].filter(
    (model, index, array) =>
      model &&
      array.indexOf(model) === index
  );

  let lastError = null;

  // ===================================================
  // TRY PRIMARY + FALLBACK MODEL
  // ===================================================

  for (let i = 0; i < modelsToTry.length; i++) {
    const model = modelsToTry[i];

    try {
      console.log(
        `🤖 Trying Gemini model: ${model}`
      );

      const url = getGeminiUrl(model);

      const body = {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],

        generationConfig: {},
      };

      // =================================================
      // JSON RESPONSE
      // =================================================

      if (json) {
        body.generationConfig.responseMimeType =
          "application/json";
      }

      const response = await fetch(
        url,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(body),
        }
      );

      const data =
        await response.json();

      // =================================================
      // SUCCESS
      // =================================================

      if (response.ok) {
        const text =
          data?.candidates?.[0]
            ?.content?.parts
            ?.map(
              (part) =>
                part.text || ""
            )
            .join("")
            .trim();

        if (!text) {
          throw new Error(
            `Gemini (${model}) returned an empty response`
          );
        }

        console.log(
          `✅ Gemini response received from ${model}`
        );

        return text;
      }

      // =================================================
      // API ERROR
      // =================================================

      const errorMessage =
        data?.error?.message ||
        "Gemini API request failed";

      const errorStatus =
        data?.error?.status ||
        "";

      console.error(
        `❌ Gemini ${model} Error:`,
        {
          status:
            response.status,
          errorStatus,
          message:
            errorMessage,
        }
      );

      const error =
        new Error(
          errorMessage
        );

      error.status =
        response.status;

      error.geminiStatus =
        errorStatus;

      lastError = error;

      // =================================================
      // FALLBACK CONDITIONS
      // =================================================

      const shouldTryFallback =
        response.status === 429 ||
        response.status === 500 ||
        response.status === 502 ||
        response.status === 503 ||
        response.status === 504 ||
        /high demand/i.test(
          errorMessage
        ) ||
        /overloaded/i.test(
          errorMessage
        ) ||
        /temporarily unavailable/i.test(
          errorMessage
        );

      if (!shouldTryFallback) {
        throw error;
      }

      // If another model exists,
      // continue loop.
      if (
        i <
        modelsToTry.length - 1
      ) {
        console.log(
          `⚠️ ${model} unavailable. Trying fallback model...`
        );

        continue;
      }

      throw error;
    } catch (error) {
      lastError = error;

      console.error(
        `❌ Gemini request failed for ${model}:`,
        error?.message
      );

      // =================================================
      // TRY FALLBACK IF AVAILABLE
      // =================================================

      if (
        i <
        modelsToTry.length - 1
      ) {
        console.log(
          `🔄 Switching from ${model} to ${modelsToTry[i + 1]}...`
        );

        continue;
      }

      break;
    }
  }

  // =====================================================
  // ALL MODELS FAILED
  // =====================================================

  throw new Error(
    lastError?.message ||
      "All Gemini models are currently unavailable. Please try again."
  );
};

// =====================================================
// CLEAN JSON
// =====================================================

const parseJSON = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    const cleaned = String(text || "")
      .replace(
        /^```json\s*/i,
        ""
      )
      .replace(
        /^```\s*/i,
        ""
      )
      .replace(
        /\s*```$/i,
        ""
      )
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch {
      const start =
        cleaned.indexOf("{");

      const end =
        cleaned.lastIndexOf("}");

      if (
        start !== -1 &&
        end !== -1 &&
        end > start
      ) {
        return JSON.parse(
          cleaned.slice(
            start,
            end + 1
          )
        );
      }

      throw new Error(
        "AI returned invalid JSON"
      );
    }
  }
};

// =====================================================
// GET USER REMINDERS
// =====================================================

const getUserRemindersForAI = async (
  userId
) => {
  if (!userId) {
    return [];
  }

  const reminders =
    await Reminder.find({
      user: userId,
    })
      .sort({
        date: 1,
        time: 1,
      })
      .lean();

  return reminders;
};

// =====================================================
// FORMAT REMINDERS FOR AI
// =====================================================

const formatRemindersForAI = (
  reminders
) => {
  if (
    !Array.isArray(reminders) ||
    reminders.length === 0
  ) {
    return "The user currently has no reminders.";
  }

  return reminders
    .map((reminder, index) => {
      return `
Reminder ${index + 1}:
Title: ${reminder.title}
Description: ${
        reminder.description ||
        "No description"
      }
Date: ${reminder.date}
Time: ${reminder.time}
Repeat: ${reminder.repeat}
Status: ${
        reminder.completed
          ? "Completed"
          : "Pending"
      }
Notified: ${
        reminder.notified
          ? "Yes"
          : "No"
      }
`;
    })
    .join("\n");
};

// =====================================================
// CHAT
// =====================================================

const generateChatResponse = async (
  messages,
  userId
) => {
  // ===================================================
  // VALIDATE
  // ===================================================

  if (
    !Array.isArray(messages) ||
    messages.length === 0
  ) {
    throw new Error(
      "Messages are required"
    );
  }

  if (!userId) {
    throw new Error(
      "User ID is required"
    );
  }

  // ===================================================
  // GET USER REMINDERS
  // ===================================================

  let reminders = [];

  try {
    reminders =
      await getUserRemindersForAI(
        userId
      );
  } catch (error) {
    console.error(
      "Failed to fetch user reminders:",
      error
    );

    reminders = [];
  }

  // ===================================================
  // FORMAT REMINDERS
  // ===================================================

  const reminderContext =
    formatRemindersForAI(
      reminders
    );

  // ===================================================
  // CONVERSATION
  // ===================================================

  const conversation =
    messages
      .slice(-12)
      .map((message) => {
        const role =
          message.role ===
            "assistant" ||
          message.role === "ai"
            ? "Assistant"
            : "User";

        const content =
          message.content ||
          message.text ||
          "";

        return `${role}: ${content}`;
      })
      .join("\n\n");

  // ===================================================
  // PROMPT
  // ===================================================

  const prompt = `
You are FocusForge AI,
a helpful personal study
and productivity assistant.

You help the user with:

- studying
- focus
- concentration
- DSA
- JavaScript
- React
- Node.js
- Express
- programming
- study planning
- goals
- schedules
- productivity
- reminders

Give clear, practical
and encouraging answers.

==================================================
USER REMINDER DATA
==================================================

The following reminders belong ONLY
to the currently authenticated user.

${reminderContext}

==================================================
IMPORTANT REMINDER RULES
==================================================

1. Only use reminder data provided above.

2. Never invent reminders.

3. Never assume another user's reminders.

4. If there are no reminders,
   clearly say that the user currently
   has no reminders.

5. If the user asks for their next reminder,
   use the date and time from the data.

6. Completed reminder questions should
   only use Completed reminders.

7. Pending reminder questions should
   only use Pending reminders.

8. For unrelated questions,
   answer normally.

9. Never reveal internal database details,
   user IDs, MongoDB IDs or implementation
   details.

==================================================
CONVERSATION
==================================================

${conversation}

==================================================
RESPONSE
==================================================

Respond naturally to the user's latest message.
`;

  return await callGemini({
    prompt,
    json: false,
  });
};

// =====================================================
// GENERATE QUIZ
// =====================================================

const generateQuizWithAI = async ({
  topic,
  difficulty,
  questionCount,
  seed,
  randomize,
  avoidQuestions,
  revisionMode = false,
  revisionContext = [],
}) => {
  // ===================================================
  // PREVIOUS QUESTIONS
  // ===================================================

  const avoidText =
    Array.isArray(avoidQuestions) &&
    avoidQuestions.length > 0
      ? avoidQuestions
          .slice(0, 50)
          .map(
            (question, index) =>
              `${index + 1}. ${question}`
          )
          .join("\n")
      : "No previous questions available.";

  // ===================================================
  // REVISION CONTEXT
  // ===================================================

  let revisionText =
    "No revision context available.";

  if (
    revisionMode &&
    Array.isArray(revisionContext) &&
    revisionContext.length > 0
  ) {
    revisionText =
      revisionContext
        .slice(-20)
        .map(
          (item, index) => `
${index + 1}.

Question:
${item?.question || ""}

User Answer:
${item?.userAnswer || ""}

Correct Answer:
${item?.correctAnswer || ""}
`
        )
        .join("\n");
  }

  // ===================================================
  // PROMPT
  // ===================================================

  const prompt = `
You are FocusForge AI Quiz Generator.

Generate a completely fresh,
high-quality multiple-choice quiz.

==================================================
QUIZ CONFIGURATION
==================================================

Topic:
${topic}

Difficulty:
${difficulty}

Number of questions:
${questionCount}

Random seed:
${seed}

Randomization:
${randomize ? "YES" : "NO"}

Revision mode:
${revisionMode ? "YES" : "NO"}

==================================================
TOPIC RULE
==================================================

The user can enter ANY valid educational topic.

Examples:

- DSA
- Java
- JavaScript
- React
- Node.js
- Express
- HTML
- CSS
- history
- geography
- science
- biology
- physics
- chemistry
- mathematics
- economics
- business
- literature
- movies
- sports
- technology
- philosophy
- general knowledge

Never reject a valid topic because
it is not programming-related.

Questions must specifically relate
to the requested topic.

==================================================
PREVIOUS QUESTIONS TO AVOID
==================================================

${avoidText}

IMPORTANT:

Do NOT repeat any previous question.

Do NOT simply change the wording
of a previous question.

Use a different concept,
scenario, example or reasoning angle.

Questions inside this quiz must
also be different from each other.

==================================================
REVISION MODE
==================================================

${revisionText}

${
  revisionMode
    ? `
This is a revision quiz.

The student previously answered
some questions incorrectly.

Generate NEW questions that test
the SAME underlying concepts.

Do NOT repeat the original questions.

Focus on helping the student
understand weak areas.
`
    : `
This is a normal practice quiz.

Explore different concepts
from the requested topic.
`
}

==================================================
DIFFICULTY
==================================================

EASY:

- fundamental concepts
- basic definitions
- simple examples

MEDIUM:

- practical understanding
- application
- comparisons
- debugging
- reasoning

HARD:

- advanced concepts
- edge cases
- tricky scenarios
- deeper reasoning

==================================================
QUESTION RULES
==================================================

Generate EXACTLY ${questionCount} questions.

Every question MUST:

1. Be related to ${topic}.
2. Match ${difficulty} difficulty.
3. Have exactly 4 options.
4. Have exactly ONE correct answer.
5. correctAnswer must exactly match
   one of the options.
6. Have a short explanation.
7. Be factually accurate.
8. Be different from every other question.
9. Not repeat previous questions.
10. Not be a placeholder.
11. Do not include A/B/C/D inside
    correctAnswer.
12. correctAnswer must contain only
    the exact option text.

==================================================
OUTPUT FORMAT
==================================================

Return ONLY valid JSON.

Do not return markdown.

Do not return code fences.

Do not return explanations outside JSON.

Use EXACTLY this structure:

{
  "questions": [
    {
      "question": "Question text",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctAnswer": "Exact correct option text",
      "explanation": "Short explanation"
    }
  ]
}
`;

  // ===================================================
  // CALL GEMINI
  // ===================================================

  const raw =
    await callGemini({
      prompt,
      json: true,
    });

  // ===================================================
  // PARSE
  // ===================================================

  const parsed =
    parseJSON(raw);

  if (
    !parsed ||
    !Array.isArray(
      parsed.questions
    )
  ) {
    throw new Error(
      "AI did not return a valid question array."
    );
  }

  // ===================================================
  // NORMALIZE
  // ===================================================

  const questions =
    parsed.questions
      .map(
        (question, index) => {
          const options =
            Array.isArray(
              question?.options
            )
              ? question.options
                  .map((option) =>
                    String(option)
                      .trim()
                  )
                  .filter(Boolean)
              : [];

          const correctAnswer =
            String(
              question?.correctAnswer ||
                question?.answer ||
                ""
            ).trim();

          return {
            id:
              `ai-${Date.now()}-${index}-` +
              `${Math.random()
                .toString(36)
                .slice(2, 9)}`,

            topic,

            question:
              String(
                question?.question ||
                  ""
              ).trim(),

            options,

            correctAnswer,

            explanation:
              String(
                question?.explanation ||
                  ""
              ).trim(),
          };
        }
      )
      .filter(
        (question) => {
          if (
            !question.question
          ) {
            return false;
          }

          if (
            question.options.length !==
            4
          ) {
            return false;
          }

          if (
            !question.correctAnswer
          ) {
            return false;
          }

          const correctExists =
            question.options.some(
              (option) =>
                option.toLowerCase() ===
                question.correctAnswer
                  .toLowerCase()
            );

          return correctExists;
        }
      );

  // ===================================================
  // REMOVE DUPLICATES
  // ===================================================

  const seen =
    new Set();

  const uniqueQuestions =
    questions.filter(
      (question) => {
        const normalized =
          question.question
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

  // ===================================================
  // REMOVE PREVIOUS QUESTIONS
  // ===================================================

  const oldQuestionSet =
    new Set(
      (avoidQuestions || [])
        .map(
          (question) =>
            String(question)
              .toLowerCase()
              .replace(
                /\s+/g,
                " "
              )
              .trim()
        )
    );

  const freshQuestions =
    uniqueQuestions.filter(
      (question) => {
        const normalized =
          question.question
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
  // FINAL VALIDATION
  // ===================================================

  if (
    freshQuestions.length <
    questionCount
  ) {
    throw new Error(
      `AI generated only ${freshQuestions.length} valid fresh questions out of ${questionCount}. Please try again.`
    );
  }

  return freshQuestions.slice(
    0,
    questionCount
  );
};

// =====================================================
// WRONG ANSWER EXPLANATION
// =====================================================

const generateQuizExplanation = async ({
  topic,
  difficulty,
  question,
  options,
  userAnswer,
  correctAnswer,
}) => {
  const prompt = `
You are FocusForge AI,
an expert tutor.

A student answered a quiz
question incorrectly.

Topic:
${topic}

Difficulty:
${difficulty}

Question:
${question}

Options:
${options.join("\n")}

Student's answer:
${userAnswer}

Correct answer:
${correctAnswer}

Explain the answer in a simple
teaching style.

Your response should contain:

1. Why the correct answer is correct.
2. Why the student's answer is wrong.
3. The key concept the student should remember.
4. A small example if useful.

Do not be overly long.

Make the explanation easy
for a student to understand.
`;

  return await callGemini({
    prompt,
    json: false,
  });
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  generateChatResponse,
  generateQuizWithAI,
  generateQuizExplanation,
};