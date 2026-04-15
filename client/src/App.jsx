import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import DeckDetail from "./pages/DeckDetail";
import StudyPage from "./pages/StudyPage";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/deck/:id" element={<DeckDetail />} />
          <Route path="/study/:id" element={<StudyPage />} />
        </Routes>
      </div>
    </div>
  );
}