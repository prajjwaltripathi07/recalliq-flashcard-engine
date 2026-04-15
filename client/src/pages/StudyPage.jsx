import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/api";
import Flashcard from "../components/Flashcard";

export default function StudyPage() {
  const { deckId } = useParams();
  const navigate = useNavigate();

  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchDeck = async () => {
    try {
      const res = await API.get(`/decks/${deckId}`);
      const fetchedDeck = res.data;

      const allCards = Array.isArray(fetchedDeck?.cards) ? fetchedDeck.cards : [];

      const dueCards = allCards.filter((card) => {
        if (!card?.nextReview) return true;
        return new Date(card.nextReview) <= new Date();
      });

      const finalCards = dueCards.length > 0 ? dueCards : allCards;

      setDeck(fetchedDeck);
      setCards(finalCards);
      setIndex(0);
    } catch (error) {
      console.error("Failed to load study deck", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeck();
  }, [deckId]);

  const currentCard = cards[index];

  const progress = useMemo(() => {
    if (!cards.length) return 0;
    return ((index + 1) / cards.length) * 100;
  }, [index, cards.length]);

  const handleReview = async (difficulty) => {
    if (!currentCard?._id) return;

    try {
      await API.post(`/cards/${currentCard._id}/review`, { difficulty });

      if (index < cards.length - 1) {
        setIndex((prev) => prev + 1);
      } else {
        fetchDeck();
      }
    } catch (error) {
      console.error("Failed to review card", error);
      alert("Failed to save review.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-lg md:text-xl font-semibold text-slate-500">
        Loading study session...
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-xl md:text-2xl font-bold text-slate-800">Deck not found</p>
        <button
          onClick={() => navigate("/")}
          className="rounded-2xl bg-indigo-600 px-6 py-3 font-semibold text-white"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!cards.length) {
    return (
      <div className="min-h-screen bg-transparent">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 md:px-6 py-4 md:py-5">
            <h1 className="text-2xl md:text-4xl font-black text-indigo-600">RecallIQ</h1>
            <div className="text-right">
              <p className="text-base md:text-xl font-bold text-slate-800">Flashcard Engine</p>
              <p className="text-xs md:text-sm text-slate-400">PDF → AI → Spaced Repetition</p>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 md:px-6 py-8 md:py-10">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => navigate(`/deck/${deckId}`)}
              className="rounded-2xl border border-slate-200 bg-white px-4 md:px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              ← Back to Deck
            </button>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 md:px-5 py-3 text-sm font-semibold text-slate-600">
              Session complete
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 md:p-8 shadow-sm">
            <div className="mb-4 inline-flex rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600">
              Study Mode
            </div>

            <h2 className="text-2xl md:text-4xl font-black leading-snug text-slate-900 break-words whitespace-normal">
              {deck.title}
            </h2>

            <p className="mt-3 text-base md:text-lg text-slate-500">
              No due cards found or you finished all cards in this deck.
            </p>

            <div className="mt-8 rounded-3xl border border-emerald-100 bg-emerald-50 p-6 md:p-10 text-center">
              <div className="mb-4 text-4xl md:text-5xl">🎉</div>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900">
                Study session complete
              </h3>
              <p className="mt-3 text-sm md:text-base text-slate-600">
                Great work — you’re staying consistent.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => navigate(`/deck/${deckId}`)}
                  className="rounded-2xl border border-slate-200 bg-white px-5 md:px-6 py-3 font-semibold text-slate-700"
                >
                  View Deck
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="rounded-2xl bg-indigo-600 px-5 md:px-6 py-3 font-semibold text-white"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 md:px-6 py-4 md:py-5">
          <h1 className="text-2xl md:text-4xl font-black text-indigo-600">RecallIQ</h1>
          <div className="text-right">
            <p className="text-base md:text-xl font-bold text-slate-800">Flashcard Engine</p>
            <p className="text-xs md:text-sm text-slate-400">PDF → AI → Spaced Repetition</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 md:px-6 py-8 md:py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => navigate(`/deck/${deckId}`)}
            className="rounded-2xl border border-slate-200 bg-white px-4 md:px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            ← Back to Deck
          </button>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 md:px-5 py-3 text-sm font-semibold text-slate-600">
            Card {index + 1} of {cards.length}
          </div>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[28px] border border-slate-200 bg-white p-5 md:p-8 shadow-sm"
        >
          <div className="mb-4 inline-flex rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600">
            Study Mode
          </div>

          <h2 className="text-2xl md:text-4xl font-black leading-snug text-slate-900 break-words whitespace-normal">
            {deck.title}
          </h2>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-600">
              Studying due cards first
            </div>
            <div className="text-sm text-slate-500">
              Stay consistent for better retention
            </div>
          </div>

          <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35 }}
            />
          </div>
        </motion.section>

        <section className="mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard?._id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <Flashcard card={currentCard} />
            </motion.div>
          </AnimatePresence>
        </section>

        <section className="mt-8">
          <div className="grid gap-4 md:grid-cols-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => handleReview("hard")}
              className="rounded-3xl bg-red-500 px-6 py-4 md:py-5 text-base md:text-lg font-bold text-white shadow-sm hover:bg-red-600"
            >
              Hard
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => handleReview("medium")}
              className="rounded-3xl bg-amber-500 px-6 py-4 md:py-5 text-base md:text-lg font-bold text-white shadow-sm hover:bg-amber-600"
            >
              Medium
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => handleReview("easy")}
              className="rounded-3xl bg-emerald-500 px-6 py-4 md:py-5 text-base md:text-lg font-bold text-white shadow-sm hover:bg-emerald-600"
            >
              Easy
            </motion.button>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
          <h3 className="text-lg md:text-xl font-bold text-slate-900">Review logic</h3>
          <p className="mt-2 text-sm md:text-base text-slate-500">
            Hard = shorter interval • Medium = balanced review • Easy = longer spacing
          </p>
        </section>
      </main>
    </div>
  );
}