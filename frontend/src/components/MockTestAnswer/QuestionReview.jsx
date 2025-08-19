export default function QuestionReview({ questions = [], answers = {} }) {
  return (
    <div className="space-y-4">
      {questions.map((q, idx) => {
        const selected = answers[q.question_id]
        const correct = q.correct_answer
        const isCorrect = selected && correct && selected === correct
        return (
          <div key={q.question_id} className="rounded-lg border border-slate-700 bg-slate-900 p-4">
            <div className="mb-2 text-xs text-slate-400">Question {idx + 1}</div>
            <div className="text-slate-100">{q.text}</div>
            <div className="mt-2 text-sm">
              <div className="text-slate-300">Your answer: <span className={isCorrect ? 'text-emerald-400' : 'text-rose-400'}>{selected || '—'}</span></div>
              {correct && (
                <div className="text-slate-300">Correct answer: <span className="text-emerald-400">{correct}</span></div>
              )}
            </div>
            {q.explanation && (
              <div className="mt-2 text-sm text-slate-300 opacity-90">Explanation: {q.explanation}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}


