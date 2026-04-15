const mongoose = require("mongoose");

const deckSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    originalFileName: {
      type: String,
      default: "",
    },
    topics: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Deck", deckSchema);