// Placeholder simple chart bar without external libs (can be swapped to Chart.js)
export default function PerformanceChart({ correct = 0, total = 0 }) {
  const pct = total ? Math.round((correct / total) * 100) : 0
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
      <div className="text-slate-100 text-sm font-medium">Performance</div>
      <div className="mt-3 h-4 w-full overflow-hidden rounded bg-slate-800">
        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-600" style={{ width: `${pct}%` }}></div>
      </div>
      <div className="mt-2 text-right text-xs text-slate-400">{pct}%</div>
    </div>
  )
}


