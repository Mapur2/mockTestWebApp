export default function QuestionPalette({ questions = [], currentQuestionId, answers = {}, onJump, disabled = false }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {questions.map((q, idx) => {
        const isAnswered = Boolean(answers[q.question_id])
        const isCurrent = currentQuestionId && q.question_id === currentQuestionId
        return (
          <button 
            key={q.question_id} 
            type="button" 
            onClick={() => !disabled && onJump(idx)}
            disabled={disabled}
            className={`h-12 rounded-lg text-base font-semibold transition ${
              disabled
                ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed'
                : isCurrent 
                  ? 'bg-purple-600 text-white' 
                  : isAnswered 
                    ? 'bg-purple-700/70 text-white' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {idx + 1}
          </button>
        )
      })}
    </div>
  )
}


