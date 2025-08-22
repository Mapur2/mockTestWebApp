import Timer from '../MockTestQuestion/Timer'

export default function TopBar({ minutes = 30, onExpire, onTick, onWarning, username = 'Rupam' }) {
	return (
		<div className="mb-4 flex items-center justify-between rounded-lg bg-slate-800/80 px-4 py-3 text-slate-200">
			<div className="flex items-center gap-3">
				<div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-lg">🙂</div>
				<div className="text-sm font-mono">
					<Timer minutes={minutes} onExpire={onExpire} onTick={onTick} onWarning={onWarning} />
				</div>
			</div>
			<div className="flex items-center gap-3">
				<div className="text-sm font-semibold tracking-wide">{username}</div>
				<div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-lg">🎓</div>
			</div>
		</div>
	)
}


