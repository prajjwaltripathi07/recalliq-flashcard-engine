const mongoose = require("mongoose");

const deckSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    totalCards: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Deck", deckSchema);