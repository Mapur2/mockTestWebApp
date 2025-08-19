export default function PaletteLegend() {
	return (
		<div className="rounded-lg bg-slate-800/60 p-4 text-slate-200">
			<div className="mb-3 flex items-center gap-3">
				<span className="inline-block h-6 w-6 rounded bg-slate-600"></span>
				<span className="text-sm">Unanswered</span>
			</div>
			<div className="flex items-center gap-3">
				<span className="inline-block h-6 w-6 rounded bg-purple-600"></span>
				<span className="text-sm">Answered</span>
			</div>
		</div>
	)
}


