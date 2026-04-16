import { Link } from "react-router-dom";

export default function DeckCard({ deck }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition flex flex-col justify-between min-h-[240px]">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3
              className="text-xl font-bold text-slate-900 leading-tight break-words overflow-hidden"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                minHeight: "56px",
              }}
            >
              {deck.title}
            </h3>

            <p
              className="text-sm text-slate-500 mt-1 break-words overflow-hidden"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                minHeight: "40px",
              }}
            >
              {deck.originalFileName}
            </p>
          </div>

          <span className="text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 font-semibold shrink-0">
            {deck.totalCards} cards
          </span>
        </div>

        <p className="text-xs text-slate-400 mt-4">
          Created: {new Date(deck.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="mt-5 flex gap-3">
        <Link
          to={`/deck/${deck._id}`}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold"
        >
          View Deck
        </Link>
        <Link
          to={`/study/${deck._id}`}
          className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 text-sm font-semibold"
        >
          Study Now
        </Link>
      </div>
    </div>
  );
}