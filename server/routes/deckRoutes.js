const express = require("express");
const multer = require("multer");
const fs = require("fs");
const Deck = require("../models/Deck");
const Card = require("../models/Card");
const { extractTextFromPDFSmart } = require("../services/pdfService");
const { generateFlashcardsFromText } = require("../services/anthropicService");

const router = express.Router();

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed."));
    }
    cb(null, true);
  },
});

router.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "PDF file is required." });
    }

    const filePath = req.file.path;
    const originalFileName = req.file.originalname;
    const title =
      req.body.title?.trim() || originalFileName.replace(/\.[^/.]+$/, "");

    // Smart extraction: text PDF first, OCR fallback for scanned PDFs
    const extraction = await extractTextFromPDFSmart(filePath);
    const extractedText = extraction.text;

    console.log("PDF extraction method used:", extraction.method);

    if (!extractedText || extractedText.trim().length < 100) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({
        message:
          "Could not extract enough readable text from this PDF. Please try another file.",
      });
    }

    const flashcards = await generateFlashcardsFromText(extractedText);

    if (!Array.isArray(flashcards) || flashcards.length === 0) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(500).json({ message: "No flashcards generated." });
    }

    const deck = await Deck.create({
      title,
      originalFileName,
      totalCards: flashcards.length,
    });

    const cardsToInsert = flashcards.map((card) => ({
      deckId: deck._id,
      question: card.question,
      answer: card.answer,
      topic: card.topic || "General",
    }));

    await Card.insertMany(cardsToInsert);

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    const uniqueTopics = [...new Set(flashcards.map((c) => c.topic || "General"))];

    res.status(201).json({
      message: "Deck created successfully",
      deck,
      summary: {
        flashcardsCount: flashcards.length,
        topics: uniqueTopics,
        extractionMethod: extraction.method, // optional but useful for debugging
      },
    });
  } catch (error) {
    console.error(error);

    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: error.message || "Failed to process PDF and generate flashcards.",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const { search = "" } = req.query;

    const query = search
      ? { title: { $regex: search, $options: "i" } }
      : {};

    const decks = await Deck.find(query).sort({ createdAt: -1 });

    res.json(decks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch decks" });
  }
});

router.get("/stats/overview", async (req, res) => {
  try {
    const now = new Date();

    const [totalDecks, totalCards, dueToday, masteredCards] =
      await Promise.all([
        Deck.countDocuments(),
        Card.countDocuments(),
        Card.countDocuments({ nextReviewDate: { $lte: now } }),
        Card.countDocuments({ status: "mastered" }),
      ]);

    res.json({
      totalDecks,
      totalCards,
      dueToday,
      masteredCards,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const deck = await Deck.findById(req.params.id);
    if (!deck) {
      return res.status(404).json({ message: "Deck not found" });
    }

    const cards = await Card.find({ deckId: deck._id }).sort({ createdAt: 1 });

    const topics = [...new Set(cards.map((c) => c.topic || "General"))];

    res.json({
      deck,
      cards,
      meta: {
        topics,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch deck" });
  }
});

router.get("/:id/due", async (req, res) => {
  try {
    const now = new Date();

    const cards = await Card.find({
      deckId: req.params.id,
      nextReviewDate: { $lte: now },
    }).sort({ nextReviewDate: 1 });

    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch due cards" });
  }
});

module.exports = router;