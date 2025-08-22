export default function AnswerOptions({ options, selected, onSelect, disabled = false }) {
  const keys = Object.keys(options || {})
  return (
    <div className="mt-4 grid grid-cols-1 gap-4">
      {keys.map(key => (
        <button
          key={key}
          type="button"
          onClick={() => !disabled && onSelect(key)}
          disabled={disabled}
          className={`rounded-xl px-4 py-5 text-left transition ${
            disabled 
              ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed' 
              : selected === key 
                ? 'bg-purple-600 text-white' 
                : 'bg-slate-800/90 text-slate-200 hover:bg-slate-700'
          }`}
        >
          <span className={`mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
            disabled 
              ? 'bg-slate-600 text-slate-400' 
              : 'bg-slate-700 text-slate-200'
          }`}>
            {key}
          </span>
          <span>{options[key]}</span>
        </button>
      ))}
    </div>
  )
}


