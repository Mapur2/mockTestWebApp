export default function QuestionDisplay({ question, index, total }) {
  if (!question) return null
  return (
    <div>
      <div className="mb-2 text-xs text-slate-400">Question {index + 1} of {total}</div>
      <div className="rounded-md border border-slate-700 bg-slate-900 p-4 text-slate-100">
        <div className="mb-2 text-[10px] uppercase tracking-wider text-slate-400">{question.subject}</div>
        {question.text}
      </div>
    </div>
  )
}


