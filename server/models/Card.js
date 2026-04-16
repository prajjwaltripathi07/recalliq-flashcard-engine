const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema(
  {
    deckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deck",
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      default: "General",
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    easyStreak: {
      type: Number,
      default: 0,
    },
    lastReviewedAt: {
      type: Date,
      default: null,
    },
    nextReviewDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["new", "learning", "mastered"],
      default: "new",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Card", cardSchema);