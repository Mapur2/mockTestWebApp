export default function AnswerOptions({ options, selected, onSelect }) {
  const keys = Object.keys(options || {})
  return (
    <div className="mt-4 grid grid-cols-1 gap-4">
      {keys.map(key => (
        <button
          key={key}
          type="button"
          onClick={() => onSelect(key)}
          className={`rounded-xl px-4 py-5 text-left transition ${selected === key ? 'bg-purple-600 text-white' : 'bg-slate-800/90 text-slate-200 hover:bg-slate-700'}`}
        >
          <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-700 text-sm font-bold">{key}</span>
          <span>{options[key]}</span>
        </button>
      ))}
    </div>
  )
}


