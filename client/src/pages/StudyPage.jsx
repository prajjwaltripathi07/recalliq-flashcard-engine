import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/api";
import Flashcard from "../components/Flashcard";

export default function StudyPage() {
  const { id } = useParams();

  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [deckTitle, setDeckTitle] = useState("");
  const [dueMode, setDueMode] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const deckRes = await API.get(`/decks/${id}`);
        setDeckTitle(deckRes.data.deck.title);

        const dueRes = await API.get(`/decks/${id}/due`);

        if (dueRes.data.length > 0) {
          setCards(dueRes.data);
          setDueMode(true);
        } else {
          setCards(deckRes.data.cards);
          setDueMode(false);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [id]);

  const currentCard = useMemo(() => cards[currentIndex], [cards, currentIndex]);

  const handleReview = async (rating) => {
    if (!currentCard || reviewing) return;

    try {
      setReviewing(true);

      await API.post(`/cards/${currentCard._id}/review`, { rating });

      if (currentIndex < cards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setCompleted(true);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to review card");
    } finally {
      setReviewing(false);
    }
  };

  if (!cards.length && !completed) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8">
        <h1 className="text-2xl font-bold">No cards available</h1>
        <p className="text-slate-500 mt-2">Try uploading a deck first.</p>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-[28px] border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 mx-auto flex items-center justify-center text-2xl font-bold">
          ✓
        </div>
        <h1 className="text-3xl font-extrabold mt-5">Session Completed</h1>
        <p className="text-slate-500 mt-3">
          Great job — you reviewed all cards in this study session.
        </p>

        <div className="mt-6 flex gap-3 justify-center flex-wrap">
          <Link
            to={`/deck/${id}`}
            className="px-5 py-3 rounded-2xl bg-slate-100 text-slate-800 font-semibold"
          >
            Back to Deck
          </Link>
          <Link
            to="/"
            className="px-5 py-3 rounded-2xl bg-indigo-600 text-white font-semibold"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
  <div className="min-w-0 flex-1">
    <h1 className="text-2xl md:text-3xl font-extrabold break-words leading-tight">
      {deckTitle}
    </h1>
    <p className="text-slate-500 mt-1">
      Card {currentIndex + 1} of {cards.length}
    </p>
  </div>

          {dueMode ? (
            <span className="text-xs px-3 py-2 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-100">
              Studying due cards first
            </span>
          ) : (
            <span className="text-xs px-3 py-2 rounded-full bg-slate-100 text-slate-700 font-semibold">
              Full deck mode
            </span>
          )}
        </div>

        <div className="w-full bg-slate-100 rounded-full h-3 mt-5">
          <div
            className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Flashcard key={currentCard?._id} card={currentCard} />
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => handleReview("hard")}
          disabled={reviewing}
          className="px-4 py-4 rounded-2xl bg-red-500 text-white font-bold disabled:opacity-60 hover:scale-[1.01] transition"
        >
          Hard
        </button>
        <button
          onClick={() => handleReview("medium")}
          disabled={reviewing}
          className="px-4 py-4 rounded-2xl bg-amber-500 text-white font-bold disabled:opacity-60 hover:scale-[1.01] transition"
        >
          Medium
        </button>
        <button
          onClick={() => handleReview("easy")}
          disabled={reviewing}
          className="px-4 py-4 rounded-2xl bg-green-600 text-white font-bold disabled:opacity-60 hover:scale-[1.01] transition"
        >
          Easy
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-5">
        <h3 className="font-bold text-lg">Review logic</h3>
        <p className="text-sm text-slate-500 mt-2">
          Hard → 1 day • Medium → 3 days • Easy → 7 / 14 / 30 days based on retention streak.
        </p>
      </div>
    </div>
  );
}