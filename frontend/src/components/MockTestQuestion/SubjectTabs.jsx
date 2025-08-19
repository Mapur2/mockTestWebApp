export default function SubjectTabs({ subjects = ['Physics','Chemistry','Mathematics'], active = 'Physics', onChange }) {
	return (
		<div className="mb-4 flex gap-2">
			{subjects.map(s => (
				<button
					key={s}
					type="button"
					onClick={() => onChange && onChange(s)}
					className={`rounded-t-lg px-4 py-2 font-semibold transition ${
						s === active ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
					}`}
				>
					{s}
				</button>
			))}
		</div>
	)
}


