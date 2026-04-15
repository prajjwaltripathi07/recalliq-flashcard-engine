export default function LoadingOverlay({ open, message }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-12 h-12 mx-auto border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <h3 className="text-xl font-bold mt-5">Generating Flashcards</h3>
        <p className="text-slate-500 mt-2">{message}</p>
      </div>
    </div>
  );
}