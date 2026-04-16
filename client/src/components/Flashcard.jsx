import { useState } from "react";

export default function Flashcard({ card }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      onClick={() => setFlipped(!flipped)}
      className="bg-white rounded-[28px] shadow-md border border-slate-200 p-8 min-h-[320px] cursor-pointer flex flex-col justify-center transition hover:shadow-lg"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <span className="text-xs uppercase tracking-wide text-indigo-600 font-semibold bg-indigo-50 px-3 py-1 rounded-full">
          {card.topic}
        </span>
        <span className="text-xs text-slate-400">
          {flipped ? "Back side" : "Front side"}
        </span>
      </div>

      <h2 className="text-2xl md:text-3xl font-extrabold mb-5">
        {flipped ? "Answer" : "Question"}
      </h2>

      <p className="text-lg leading-relaxed whitespace-pre-wrap text-slate-700">
        {flipped ? card.answer : card.question}
      </p>

      <p className="text-sm text-slate-400 mt-8">Tap the card to flip</p>
    </div>
  );
}