export default function NavigationPanel({ index, total, onPrev, onNext, onSubmit, canSubmit }) {
  return (
    <div className="mt-6 flex items-center justify-between">
      <div className="flex gap-2">
        <button type="button" onClick={onPrev} disabled={index <= 0}
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-200 disabled:opacity-40">
          ← Previous
        </button>
        <button type="button" onClick={onNext} disabled={index >= total - 1}
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-200 disabled:opacity-40">
          Next →
        </button>
      </div>
      <button type="button" onClick={onSubmit} disabled={!canSubmit}
        className="rounded-md bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 font-medium text-white disabled:opacity-40">
        Submit Test
      </button>
    </div>
  )
}


