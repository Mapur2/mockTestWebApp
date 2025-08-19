export default function QuestionCard({ index, total, children }) {
	return (
		<div className="rounded-2xl bg-slate-800/80 p-6 shadow-inner">
			<div className="mb-4 text-2xl font-extrabold tracking-wide text-slate-100 font-mono">
				Q{index + 1}. This is the question
			</div>
			{children}
		</div>
	)
}


