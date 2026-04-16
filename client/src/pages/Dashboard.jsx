import { useEffect, useState } from "react";
import API from "../api/api";
import StatsCard from "../components/StatsCard";
import DeckCard from "../components/DeckCard";
import LoadingOverlay from "../components/LoadingOverlay";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalDecks: 0,
    totalCards: 0,
    dueToday: 0,
    masteredCards: 0,
  });

  const [decks, setDecks] = useState([]);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [pdf, setPdf] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Extracting PDF content...");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchStats = async () => {
    try {
      const res = await API.get("/decks/stats/overview");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDecks = async (searchTerm = "") => {
    try {
      const res = await API.get(`/decks?search=${encodeURIComponent(searchTerm)}`);
      setDecks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchDecks();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!pdf) {
      setErrorMessage("Please select a PDF file first.");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", pdf);
    formData.append("title", title);

    try {
      setLoading(true);
      setLoadingMessage("Extracting PDF content...");

      const loadingTimer = setTimeout(() => {
        setLoadingMessage("Generating high-quality flashcards with Claude...");
      }, 1500);

      const res = await API.post("/decks/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      clearTimeout(loadingTimer);

      setTitle("");
      setPdf(null);

      fetchStats();
      fetchDecks(search);

      const flashcardsCount = res.data?.summary?.flashcardsCount || 0;
      const topics = res.data?.summary?.topics || [];

      setSuccessMessage(
        `Deck created successfully with ${flashcardsCount} flashcards${
          topics.length ? ` across ${topics.length} topic(s)` : ""
        }.`
      );
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error.response?.data?.message || "Upload failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearch(value);
    fetchDecks(value);
  };

  return (
    <div className="space-y-8">
      <LoadingOverlay open={loading} message={loadingMessage} />

      <section className="bg-white rounded-[28px] shadow-sm border border-slate-200 p-6 md:p-8">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            Turn any PDF into smart, practice-ready flashcards
          </h1>
          <p className="text-slate-500 mb-6">
            Upload a chapter, class note, or concept sheet. RecallIQ extracts the content,
            generates AI-powered flashcards, and schedules review using spaced repetition.
          </p>
        </div>

        <form onSubmit={handleUpload} className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Deck title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-slate-300 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200"
          />

          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setPdf(e.target.files[0])}
            className="border border-slate-300 rounded-2xl px-4 py-3 bg-white"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-indigo-600 text-white px-4 py-3 font-semibold disabled:opacity-60 hover:bg-indigo-700 transition"
          >
            {loading ? "Processing..." : "Upload & Generate"}
          </button>
        </form>

        {successMessage && (
          <div className="mt-4 rounded-2xl bg-green-50 text-green-700 px-4 py-3 text-sm font-medium border border-green-100">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 rounded-2xl bg-red-50 text-red-700 px-4 py-3 text-sm font-medium border border-red-100">
            {errorMessage}
          </div>
        )}
      </section>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Decks" value={stats.totalDecks} hint="All uploaded study decks" />
        <StatsCard title="Total Cards" value={stats.totalCards} hint="AI-generated flashcards" />
        <StatsCard title="Due Today" value={stats.dueToday} hint="Cards ready for review" />
        <StatsCard title="Mastered" value={stats.masteredCards} hint="Cards with strong retention" />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-extrabold">Your Decks</h2>
            <p className="text-sm text-slate-500 mt-1">
              Search, revisit, and continue where you left off.
            </p>
          </div>

          <input
            type="text"
            placeholder="Search decks..."
            value={search}
            onChange={handleSearch}
            className="border border-slate-300 rounded-2xl px-4 py-3 w-full max-w-sm focus:ring-2 focus:ring-indigo-200 outline-none"
          />
        </div>

        {decks.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-slate-500">
            No decks yet. Upload your first PDF to generate a flashcard deck.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {decks.map((deck) => (
              <DeckCard key={deck._id} deck={deck} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}