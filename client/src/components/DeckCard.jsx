import { useNavigate } from "react-router-dom";

export default function DeckCard({ deck }) {
  const navigate = useNavigate();

  const cardCount = deck?.cards?.length || 0;
  const deckId = deck?._id;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3
            className="text-xl font-bold text-slate-900 leading-snug break-words whitespace-normal"
            style={{
              overflowWrap: "anywhere",
              wordBreak: "break-word"
            }}
          >
            {deck?.title || "Untitled Deck"}
          </h3>

          <p
            className="mt-2 text-sm text-slate-500 leading-relaxed break-words whitespace-normal"
            style={{
              overflowWrap: "anywhere",
              wordBreak: "break-word"
            }}
          >
            {deck?.originalFileName || "Uploaded study material"}
          </p>
        </div>

        <div className="shrink-0 rounded-2xl bg-indigo-50 px-3 py-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
            {cardCount}
          </p>
          <p className="text-xs text-indigo-600">cards</p>
        </div>
      </div>

      <p className="mb-5 text-sm text-slate-400 leading-relaxed">
        Created:{" "}
        {deck?.createdAt
          ? new Date(deck.createdAt).toLocaleString()
          : "Recently"}
      </p>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => navigate(`/deck/${deckId}`)}
          className="rounded-2xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          View Deck
        </button>

        <button
          onClick={() => navigate(`/study/${deckId}`)}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100"
        >
          Study Now
        </button>
      </div>
    </div>
  );
}