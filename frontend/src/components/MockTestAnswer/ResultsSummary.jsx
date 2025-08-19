import { percentage } from '../../utils/formatters'

export default function ResultsSummary({ results }) {
  if (!results) return null
  const pct = results.percentage ?? percentage(results.correct_answers, results.total_questions)
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
      <div className="text-slate-100 text-lg font-semibold">Results</div>
      <div className="mt-2 grid grid-cols-2 gap-4 text-slate-200">
        <div>
          <div className="text-slate-400 text-xs">Score</div>
          <div className="text-base">{results.correct_answers} / {results.total_questions}</div>
        </div>
        <div>
          <div className="text-slate-400 text-xs">Percentage</div>
          <div className="text-base">{pct}%</div>
        </div>
      </div>
      <div className="mt-4 h-3 w-full overflow-hidden rounded bg-slate-800">
        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600" style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  )
}


