import { Outlet, NavLink } from "react-router-dom";
import { Brain, LayoutDashboard, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function AppLayout() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl"
          animate={{ scale: [1, 1.08, 1], x: [0, -12, 0], y: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 -left-16 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl"
          animate={{ scale: [1, 1.06, 1], x: [0, 14, 0], y: [0, -8, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/75 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Brain size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
                RecallIQ
              </h1>
              <p className="text-xs text-slate-500 -mt-1">
                AI Flashcard Engine
              </p>
            </div>
          </motion.div>

          <nav className="flex items-center gap-2">
            <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 relative z-10">
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink to={to}>
      {({ isActive }) => (
        <motion.div
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition ${
            isActive
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
              : "bg-white/70 text-slate-600 border border-slate-200 hover:bg-white"
          }`}
        >
          <Icon size={16} />
          <span className="hidden sm:inline">{label}</span>
          {isActive && <Sparkles size={14} />}
        </motion.div>
      )}
    </NavLink>
  );
}