import { SUBJECTS } from '../../utils/constants'

export default function SubjectSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {SUBJECTS.map(s => (
        <button
          key={s.key}
          type="button"
          onClick={() => onChange(s.key)}
          className={
            `relative overflow-hidden rounded-xl border border-slate-700 p-4 text-left transition hover:border-slate-500 ` +
            `${value === s.key ? 'ring-2 ring-purple-500' : ''}`
          }
        >
          <div className={`absolute inset-0 -z-10 bg-gradient-to-br opacity-20 ${s.color}`}></div>
          <div className="text-slate-100 font-medium">{s.label}</div>
          <div className="mt-1 text-xs text-slate-300 opacity-80">Click to select</div>
        </button>
      ))}
    </div>
  )
}


