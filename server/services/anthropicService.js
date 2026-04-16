const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function stripMarkdownFences(text) {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function extractJSONArray(text) {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start !== -1 && end !== -1 && end > start) {
    return text.slice(start, end + 1);
  }
  return text;
}

function safeParseFlashcards(rawText) {
  let cleaned = stripMarkdownFences(rawText);
  cleaned = extractJSONArray(cleaned);

  const parsed = JSON.parse(cleaned);

  if (!Array.isArray(parsed)) {
    throw new Error("Gemini response is not an array.");
  }

  const normalized = parsed
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      question: String(item.question || "").trim(),
      answer: String(item.answer || "").trim(),
      topic: String(item.topic || "General").trim(),
    }))
    .filter((item) => item.question && item.answer);

  if (normalized.length === 0) {
    throw new Error("No valid flashcards after normalization.");
  }

  return normalized;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithModel(modelName, prompt) {
  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
  });

  return response.text || "";
}

async function callGemini(prompt) {
  const models = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
  ];

  let lastError;

  for (const modelName of models) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Trying Gemini model: ${modelName} (attempt ${attempt})`);
        const text = await generateWithModel(modelName, prompt);

        if (!text || !text.trim()) {
          throw new Error(`Empty response from ${modelName}`);
        }

        return text;
      } catch (error) {
        lastError = error;
        console.warn(
          `Gemini failed with ${modelName} on attempt ${attempt}:`,
          error.message || error
        );

        const status = error?.status;

        // Retry only on temporary errors
        if (status === 503 || status === 429 || status === 500) {
          await sleep(1500 * attempt);
          continue;
        }

        // If model not found / unsupported, break and try next model
        if (status === 404) {
          break;
        }

        // For other errors, try next model
        break;
      }
    }
  }

  throw lastError || new Error("All Gemini attempts failed.");
}

async function generateFlashcardsFromText(text) {
  const truncatedText = text.slice(0, 12000);

  const basePrompt = `
You are an expert teacher and learning designer.

Convert the following educational material into high-quality flashcards for active recall and long-term retention.

Rules:
- Generate 8 to 12 flashcards
- Cover important concepts, definitions, formulas, and examples
- Avoid repetition
- Questions should be clear and useful
- Answers should be concise but complete
- Assign a short topic label
- Return ONLY a valid JSON array
- No markdown
- No explanation

Return exactly in this format:
[
  {
    "question": "What is ...?",
    "answer": "...",
    "topic": "..."
  }
]

PDF content:
${truncatedText}
`;

  try {
    const firstResponse = await callGemini(basePrompt);
    return safeParseFlashcards(firstResponse);
  } catch (firstError) {
    console.warn("First Gemini parse failed. Retrying with repair prompt...");

    const repairPrompt = `
Return ONLY a valid JSON array of flashcards from the content below.

Rules:
- Only JSON
- No markdown
- No explanation
- Generate 8 to 12 flashcards
- Each object must contain:
  - "question"
  - "answer"
  - "topic"

PDF content:
${truncatedText}
`;

    const secondResponse = await callGemini(repairPrompt);
    return safeParseFlashcards(secondResponse);
  }
}

module.exports = { generateFlashcardsFromText };