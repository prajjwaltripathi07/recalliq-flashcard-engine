import { useState } from "react";

export default function Flashcard({ card }) {
  const [flipped, setFlipped] = useState(false);

  if (!card) return null;

  return (
    <div
      onClick={() => setFlipped((prev) => !prev)}
      className="w-full cursor-pointer rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm transition-all duration-200 hover:shadow-md"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex max-w-full rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-indigo-600 break-words">
          {card.topic || "General"}
        </span>

        <span className="text-sm font-medium text-slate-400">
          {flipped ? "Back side" : "Front side"}
        </span>
      </div>

      {!flipped ? (
        <div>
          <p className="mb-3 text-xs md:text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">
            Question
          </p>

          <div className="min-h-[180px] md:min-h-[220px]">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold leading-relaxed text-slate-900 break-words whitespace-pre-wrap">
              {card.question}
            </h2>
          </div>

          <p className="mt-6 text-sm md:text-base text-slate-400">
            Tap the card to reveal the answer
          </p>
        </div>
      ) : (
        <div>
          <p className="mb-3 text-xs md:text-sm font-semibold uppercase tracking-[0.14em] text-emerald-500">
            Answer
          </p>

          <div className="min-h-[180px] md:min-h-[220px] rounded-2xl bg-emerald-50 p-4 md:p-6">
            <p className="text-base md:text-lg lg:text-xl leading-relaxed text-slate-800 break-words whitespace-pre-wrap">
              {card.answer}
            </p>
          </div>

          <p className="mt-6 text-sm md:text-base text-slate-400">
            Tap again to go back to the question
          </p>
        </div>
      )}
    </div>
  );
}