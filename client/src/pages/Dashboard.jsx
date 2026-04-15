import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE = "http://localhost:5000/api";

export default function Dashboard() {
  const [decks, setDecks] = useState([]);
  const [stats, setStats] = useState({
    totalDecks: 0,
    totalCards: 0,
    dueToday: 0,
    mastered: 0,
  });
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);

  const fetchDecks = async () => {
    try {
      const res = await axios.get(`${API_BASE}/decks`, {
        params: { search },
      });
      setDecks(res.data || []);
    } catch (error) {
      console.error("Error fetching decks:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/decks/stats/overview`);
      setStats(
        res.data || {
          totalDecks: 0,
          totalCards: 0,
          dueToday: 0,
          mastered: 0,
        }
      );
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchDecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a PDF file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    if (title.trim()) {
      formData.append("title", title.trim());
    }

    try {
      setUploading(true);

      const res = await axios.post(`${API_BASE}/decks/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.success) {
        alert(`Deck created successfully! ${res.data.flashcardsCreated} flashcards generated.`);
      } else {
        alert("Deck uploaded successfully.");
      }

      setTitle("");
      setFile(null);

      // reset file input manually
      const fileInput = document.getElementById("pdf-upload-input");
      if (fileInput) fileInput.value = "";

      fetchDecks();
      fetchStats();
    } catch (error) {
      console.error("Upload error:", error);

      const serverMessage =
        error?.response?.data?.error || "Upload failed. Please try again.";

      alert(serverMessage);
    } finally {
      setUploading(false);
    }
  };

  const filteredDecks = useMemo(() => decks || [], [decks]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">RecallIQ Dashboard</h1>
            <p className="mt-2 text-sm text-slate-400">
              Upload PDFs, generate flashcards, and study smarter.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Decks" value={stats.totalDecks} />
          <StatCard label="Total Cards" value={stats.totalCards} />
          <StatCard label="Due Today" value={stats.dueToday} />
          <StatCard label="Mastered" value={stats.mastered} />
        </div>

        {/* Upload + Search */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Upload Form */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg lg:col-span-2">
            <h2 className="mb-4 text-xl font-semibold">Create New Deck</h2>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Deck Title (optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter deck title"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Upload PDF
                </label>
                <input
                  id="pdf-upload-input"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-500"
                />
                {file && (
                  <p className="mt-2 text-xs text-slate-400">
                    Selected: <span className="text-slate-200">{file.name}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading ? "Generating Flashcards..." : "Upload & Generate"}
              </button>
            </form>
          </div>

          {/* Search */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">Search Decks</h2>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
            />
            <p className="mt-3 text-sm text-slate-400">
              Instantly filter decks by name or uploaded PDF.
            </p>
          </div>
        </div>

        {/* Decks List */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Decks</h2>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
              {filteredDecks.length} deck{filteredDecks.length !== 1 ? "s" : ""}
            </span>
          </div>

          {filteredDecks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950 p-8 text-center">
              <p className="text-lg font-medium text-slate-300">No decks found</p>
              <p className="mt-2 text-sm text-slate-500">
                Upload a PDF above to create your first flashcard deck.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredDecks.map((deck) => (
                <div
                  key={deck._id}
                  className="flex min-h-[220px] flex-col rounded-2xl border border-slate-800 bg-slate-950 p-5 transition hover:border-slate-700"
                >
                  <div className="mb-3">
                    <h3 className="line-clamp-2 break-words text-lg font-semibold text-white">
                      {deck.title || "Untitled Deck"}
                    </h3>

                    {deck.originalFileName && (
                      <p className="mt-2 line-clamp-2 break-words text-sm text-slate-400">
                        {deck.originalFileName}
                      </p>
                    )}
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-900 p-3">
                      <p className="text-xs text-slate-400">Cards</p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {deck.cardCount || 0}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-900 p-3">
                      <p className="text-xs text-slate-400">Due</p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {deck.dueCount || 0}
                      </p>
                    </div>
                  </div>

                  {Array.isArray(deck.topics) && deck.topics.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {deck.topics.slice(0, 3).map((topic, index) => (
                        <span
                          key={`${deck._id}-topic-${index}`}
                          className="max-w-full truncate rounded-full bg-blue-600/15 px-3 py-1 text-xs text-blue-300"
                          title={topic}
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto flex gap-3">
                    <Link
                      to={`/study/${deck._id}`}
                      className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-blue-500"
                    >
                      Study
                    </Link>

                    <Link
                      to={`/deck/${deck._id}`}
                      className="flex-1 rounded-xl border border-slate-700 px-4 py-2.5 text-center text-sm font-medium text-slate-200 transition hover:bg-slate-800"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value ?? 0}</p>
    </div>
  );
}