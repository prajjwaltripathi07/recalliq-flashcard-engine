function getNextReview(card, rating) {
  const now = new Date();
  let days = 1;
  let easyStreak = card.easyStreak || 0;
  let status = "learning";

  if (rating === "hard") {
    days = 1;
    easyStreak = 0;
    status = "learning";
  } else if (rating === "medium") {
    days = 3;
    easyStreak = 0;
    status = "learning";
  } else if (rating === "easy") {
    easyStreak += 1;

    if (easyStreak === 1) days = 7;
    else if (easyStreak === 2) days = 14;
    else days = 30;

    status = easyStreak >= 3 ? "mastered" : "learning";
  }

  const nextReviewDate = new Date(now);
  nextReviewDate.setDate(now.getDate() + days);

  return {
    nextReviewDate,
    easyStreak,
    status,
  };
}

module.exports = { getNextReview };