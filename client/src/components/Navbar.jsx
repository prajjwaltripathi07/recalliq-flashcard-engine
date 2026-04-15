import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white/90 backdrop-blur border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-extrabold text-indigo-600 tracking-tight">
          RecallIQ
        </Link>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-700">Flashcard Engine</p>
          <p className="text-xs text-slate-400">PDF → AI → Spaced Repetition</p>
        </div>
      </div>
    </nav>
  );
}