const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");

const Deck = require("../models/Deck");
const Card = require("../models/Card");
const { generateFlashcardsFromText } = require("../services/anthropicService");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// GET all decks (supports search query)
router.get("/", async (req, res) => {
  try {
    const search = req.query.search?.trim();

    const query = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { originalFileName: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const decks = await Deck.find(query).sort({ createdAt: -1 });

    const decksWithCounts = await Promise.all(
      decks.map(async (deck) => {
        const cardCount = await Card.countDocuments({ deckId: deck._id });
        const dueCount = await Card.countDocuments({
          deckId: deck._id,
          nextReview: { $lte: new Date() },
        });

        return {
          ...deck.toObject(),
          cardCount,
          dueCount,
        };
      })
    );

    res.json(decksWithCounts);
  } catch (error) {
    console.error("❌ GET /api/decks error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET dashboard stats overview
router.get("/stats/overview", async (req, res) => {
  try {
    const totalDecks = await Deck.countDocuments();
    const totalCards = await Card.countDocuments();

    const now = new Date();

    const dueToday = await Card.countDocuments({
      nextReview: { $lte: now },
    });

    const mastered = await Card.countDocuments({
      repetitions: { $gte: 5 },
    });

    res.json({
      totalDecks,
      totalCards,
      dueToday,
      mastered,
    });
  } catch (error) {
    console.error("❌ GET /api/decks/stats/overview error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET single deck by ID
router.get("/:id", async (req, res) => {
  try {
    const deck = await Deck.findById(req.params.id);
    if (!deck) {
      return res.status(404).json({ error: "Deck not found" });
    }

    const cards = await Card.find({ deckId: deck._id }).sort({ createdAt: 1 });

    res.json({
      ...deck.toObject(),
      cards,
      cardCount: cards.length,
    });
  } catch (error) {
    console.error("❌ GET /api/decks/:id error:", error);
    res.status(500).json({ error: error.message });
  }
});

// UPLOAD PDF + generate deck
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    console.log("📥 Upload route hit");

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("📄 File received:", req.file.originalname);

    const pdfData = await pdfParse(req.file.buffer);
    const extractedText = (pdfData.text || "").trim();

    console.log("📝 Extracted text length:", extractedText.length);

    if (!extractedText || extractedText.length < 50) {
      return res.status(400).json({
        error: "Could not extract enough text from PDF",
      });
    }

    const generated = await generateFlashcardsFromText(extractedText);

    console.log("🤖 Generated flashcards:", generated?.flashcards?.length || 0);

    if (
      !generated ||
      !Array.isArray(generated.flashcards) ||
      generated.flashcards.length === 0
    ) {
      return res.status(500).json({
        error: "Flashcard generation failed or returned empty data",
      });
    }

    const deckTitle =
      req.body.title?.trim() ||
      req.file.originalname.replace(/\.pdf$/i, "") ||
      "Untitled Deck";

    const deck = await Deck.create({
      title: deckTitle,
      originalFileName: req.file.originalname,
      topics: Array.isArray(generated.topics) ? generated.topics : [],
    });

    const cardsToInsert = generated.flashcards.map((card) => ({
      deckId: deck._id,
      question: card.question || "Untitled Question",
      answer: card.answer || "No answer provided",
      topic: card.topic || "General",
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
      nextReview: new Date(),
    }));

    const insertedCards = await Card.insertMany(cardsToInsert);

    res.status(201).json({
      success: true,
      deck: {
        ...deck.toObject(),
        cardCount: insertedCards.length,
        dueCount: insertedCards.length,
      },
      flashcardsCreated: insertedCards.length,
      topics: generated.topics || [],
    });
  } catch (error) {
    console.error("❌ POST /api/decks/upload error:", error);

    if (error.message === "CLAUDE_RATE_LIMIT") {
      return res.status(429).json({
        error: "Claude API rate limit reached. Please try again in a moment.",
      });
    }

    if (error.message === "CLAUDE_AUTH_ERROR") {
      return res.status(401).json({
        error: "Invalid Anthropic API key. Check ANTHROPIC_API_KEY in server/.env",
      });
    }

    if (error.message === "CLAUDE_INVALID_JSON") {
      return res.status(502).json({
        error: "Claude returned invalid JSON format. Please try again.",
      });
    }

    if (error.message === "CLAUDE_EMPTY_FLASHCARDS") {
      return res.status(502).json({
        error: "Claude returned no usable flashcards. Try another PDF.",
      });
    }

    return res.status(500).json({
      error: error.message || "Upload failed",
    });
  }
});

module.exports = router;