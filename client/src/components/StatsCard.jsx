export default function StatsCard({ title, value, hint }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition">
      <p className="text-sm text-slate-500">{title}</p>
      <h3 className="text-3xl font-extrabold mt-2">{value}</h3>
      {hint && <p className="text-xs text-slate-400 mt-2">{hint}</p>}
    </div>
  );
}