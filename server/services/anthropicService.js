const Anthropic = require("@anthropic-ai/sdk");

function getAnthropicClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is missing in .env");
  }

  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

function safeParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractJSONBlock(text) {
  if (!text) return null;

  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  if (fenced && fenced[1]) return fenced[1].trim();

  const genericFenced = text.match(/```\s*([\s\S]*?)```/i);
  if (genericFenced && genericFenced[1]) return genericFenced[1].trim();

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return text.slice(start, end + 1);
  }

  return text.trim();
}

async function callClaude(prompt) {
  try {
    const anthropic = getAnthropicClient();

    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-latest",
      max_tokens: 1200,
      temperature: 0.3,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text =
      response?.content
        ?.filter((item) => item.type === "text")
        ?.map((item) => item.text)
        ?.join("\n")
        ?.trim() || "";

    return text;
  } catch (error) {
    console.error("❌ Claude API Error:", error);

    const status = error?.status;
    const message =
      error?.error?.message ||
      error?.message ||
      "Claude request failed";

    if (status === 429 || message.toLowerCase().includes("rate")) {
      throw new Error("CLAUDE_RATE_LIMIT");
    }

    if (
      status === 401 ||
      message.toLowerCase().includes("authentication") ||
      message.toLowerCase().includes("api key")
    ) {
      throw new Error("CLAUDE_AUTH_ERROR");
    }

    throw new Error(`CLAUDE_ERROR: ${message}`);
  }
}

async function generateFlashcardsFromText(text) {
  const trimmedText = text.slice(0, 1800); // keep cost low

  const prompt = `
You are an expert educational flashcard generator.

From the following study material, generate high-quality flashcards.

Return ONLY valid JSON in this exact format:
{
  "topics": ["Topic 1", "Topic 2"],
  "flashcards": [
    {
      "question": "What is ...?",
      "answer": "It is ...",
      "topic": "Topic 1"
    }
  ]
}

Rules:
- Generate between 5 and 7 flashcards.
- Make flashcards concise and useful.
- Questions should be clear and exam-oriented.
- Answers should be direct and grounded in the text.
- Topic should be a short relevant category.
- Do NOT include any explanation before or after the JSON.
- Return JSON only.

Study material:
${trimmedText}
`;

  const raw = await callClaude(prompt);

  const jsonText = extractJSONBlock(raw);
  const parsed = safeParseJSON(jsonText);

  if (!parsed || !Array.isArray(parsed.flashcards)) {
    throw new Error("CLAUDE_INVALID_JSON");
  }

  const normalizedFlashcards = parsed.flashcards
    .filter((card) => card && card.question && card.answer)
    .map((card) => ({
      question: card.question,
      answer: card.answer,
      topic: card.topic || "General",
    }));

  if (!normalizedFlashcards.length) {
    throw new Error("CLAUDE_EMPTY_FLASHCARDS");
  }

  const topics = Array.isArray(parsed.topics)
    ? parsed.topics.filter(Boolean)
    : [...new Set(normalizedFlashcards.map((c) => c.topic))];

  return {
    topics,
    flashcards: normalizedFlashcards,
  };
}

module.exports = {
  generateFlashcardsFromText,
};