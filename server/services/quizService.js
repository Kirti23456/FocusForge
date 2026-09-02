import ai from "../config/gemini.js";

const QUIZ_SYSTEM_PROMPT = `
You are FocusForge AI Quiz Generator.

Your job is to generate a quiz based ONLY on the topic provided by the user.

Rules:
- Generate exactly 5 multiple-choice questions.
- Each question must have exactly 4 options.
- There must be exactly 1 correct answer.
- Questions should match the requested topic.
- Difficulty can be easy, medium, or hard.
- Do not include explanations unless requested.
- Return ONLY valid JSON.
- Do not wrap the JSON in markdown.
- Do not use code fences.
- The response must be directly parseable by JSON.parse().

Required JSON format:

{
  "topic": "topic name",
  "questions": [
    {
      "question": "Question text",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctAnswer": "Option A"
    }
  ]
}
`;

export const generateQuiz = async ({
  topic,
  difficulty = "medium",
}) => {
  try {
    if (!topic || typeof topic !== "string") {
      throw new Error("Quiz topic is required");
    }

    const cleanTopic = topic.trim();

    if (!cleanTopic) {
      throw new Error("Quiz topic cannot be empty");
    }

    const prompt = `
Generate a quiz on the following topic:

Topic: ${cleanTopic}

Difficulty: ${difficulty}

Generate exactly 5 questions.

Remember:
Return ONLY valid JSON.
No markdown.
No code fences.
`;

    console.log("===== QUIZ REQUEST =====");
    console.log("Topic:", cleanTopic);
    console.log("Difficulty:", difficulty);

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",

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

      config: {
        systemInstruction: QUIZ_SYSTEM_PROMPT,
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    const rawText =
      typeof response.text === "string"
        ? response.text.trim()
        : "";

    if (!rawText) {
      throw new Error("Gemini returned an empty quiz response");
    }

    console.log("===== RAW QUIZ RESPONSE =====");
    console.log(rawText);

    let cleanedText = rawText;

    // Safety: remove markdown code fences if Gemini
    // accidentally returns them.
    cleanedText = cleanedText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let quiz;

    try {
      quiz = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Quiz JSON parsing failed:", parseError);
      console.error("Gemini response:", cleanedText);

      throw new Error(
        "Gemini returned invalid quiz JSON"
      );
    }

    // Validate basic quiz structure
    if (
      !quiz ||
      typeof quiz !== "object" ||
      !Array.isArray(quiz.questions)
    ) {
      throw new Error(
        "Invalid quiz format returned by Gemini"
      );
    }

    if (quiz.questions.length !== 5) {
      throw new Error(
        "Quiz must contain exactly 5 questions"
      );
    }

    for (const question of quiz.questions) {
      if (
        !question ||
        typeof question.question !== "string" ||
        !Array.isArray(question.options) ||
        question.options.length !== 4 ||
        typeof question.correctAnswer !== "string"
      ) {
        throw new Error(
          "Invalid question format returned by Gemini"
        );
      }

      if (
        !question.options.includes(
          question.correctAnswer
        )
      ) {
        throw new Error(
          "Correct answer must be one of the options"
        );
      }
    }

    console.log("===== QUIZ RESPONSE SUCCESS =====");

    return {
      topic: quiz.topic || cleanTopic,
      questions: quiz.questions,
    };
  } catch (error) {
    console.error(
      "Quiz service error:",
      error?.message || error
    );

    throw new Error(
      error?.message ||
        "Failed to generate quiz"
    );
  }
};