import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../api/api";
import TopicChip from "../components/TopicChip";

export default function DeckDetail() {
  const { id } = useParams();
  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    const fetchDeck = async () => {
      try {
        const res = await API.get(`/decks/${id}`);
        setDeck(res.data.deck);
        setCards(res.data.cards);
        setTopics(res.data.meta?.topics || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDeck();
  }, [id]);

  if (!deck) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8">
        <p className="text-slate-500">Loading deck...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[28px] border border-slate-200 p-6 md:p-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-extrabold">{deck.title}</h1>
            <p className="text-slate-500 mt-2">{deck.originalFileName}</p>
            <p className="mt-4 text-sm text-slate-600">
              {deck.totalCards} flashcards generated
            </p>
          </div>

          <Link
            to={`/study/${deck._id}`}
            className="inline-flex items-center px-5 py-3 rounded-2xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
          >
            Start Study Session
          </Link>
        </div>

        {topics.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-700 mb-3">Topics covered</p>
            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => (
                <TopicChip key={topic} label={topic} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-extrabold">Flashcards Preview</h2>

        {cards.map((card, index) => (
          <div
            key={card._id}
            className="bg-white rounded-3xl border border-slate-200 p-5"
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-xs uppercase tracking-wide text-indigo-600 font-semibold bg-indigo-50 px-3 py-1 rounded-full">
                {card.topic}
              </span>
              <div className="text-xs text-slate-400 flex gap-3 flex-wrap">
                <span>Status: {card.status}</span>
                <span>Reviews: {card.reviewCount}</span>
                <span>
                  Next Review: {new Date(card.nextReviewDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <h3 className="font-bold text-lg mt-4">
              {index + 1}. {card.question}
            </h3>

            <p className="text-slate-600 mt-3 leading-relaxed">{card.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}