export default function AnswerOptions({ options, selected, onSelect }) {
  const keys = Object.keys(options || {})
  return (
    <div className="mt-4 grid grid-cols-1 gap-3">
      {keys.map(key => (
        <button
          key={key}
          type="button"
          onClick={() => onSelect(key)}
          className={`rounded-md border p-3 text-left transition ${selected === key ? 'border-indigo-400 bg-slate-800' : 'border-slate-700 hover:border-slate-500'}`}
        >
          <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-sm font-semibold text-slate-200">{key}</span>
          <span className="text-slate-100">{options[key]}</span>
        </button>
      ))}
    </div>
  )
}


