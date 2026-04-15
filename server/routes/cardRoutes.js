const express = require("express");
const Card = require("../models/Card");
const { getNextReview } = require("../utils/spacedRepetition");

const router = express.Router();

router.post("/:id/review", async (req, res) => {
  try {
    const { rating } = req.body;

    if (!["easy", "medium", "hard"].includes(rating)) {
      return res.status(400).json({ message: "Invalid rating" });
    }

    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    const { nextReviewDate, easyStreak, status } = getNextReview(card, rating);

    card.reviewCount += 1;
    card.lastReviewedAt = new Date();
    card.nextReviewDate = nextReviewDate;
    card.easyStreak = easyStreak;
    card.status = status;

    await card.save();

    res.json({
      message: "Card reviewed successfully",
      card,
      reviewMeta: {
        rating,
        nextReviewDate,
        status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to review card" });
  }
});

module.exports = router;