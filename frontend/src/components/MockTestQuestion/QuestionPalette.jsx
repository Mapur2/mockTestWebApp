export default function QuestionPalette({ questions = [], currentIndex, answers = {}, onJump }) {
  return (
    <div className="grid grid-cols-10 gap-2">
      {questions.map((q, idx) => {
        const isAnswered = Boolean(answers[q.question_id])
        const isCurrent = currentIndex === idx
        return (
          <button key={q.question_id} type="button" onClick={() => onJump(idx)}
            className={`h-8 rounded text-xs font-semibold ${
              isCurrent ? 'bg-indigo-500 text-white' : isAnswered ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}>
            {idx + 1}
          </button>
        )
      })}
    </div>
  )
}


