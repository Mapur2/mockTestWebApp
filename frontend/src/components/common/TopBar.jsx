import Timer from '../MockTestQuestion/Timer'
import ProgressBar from './ProgressBar'

export default function TopBar({ 
  minutes = 30, 
  onExpire, 
  onTick, 
  username = 'Rupam',
  progress = null,
  showProgress = false 
}) {
  return (
    <div className="mb-4 space-y-3">
      <div className="flex items-center justify-between rounded-lg bg-slate-800/80 px-4 py-3 text-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-lg">🙂</div>
          <div className="text-sm font-mono">
            <Timer minutes={minutes} onExpire={onExpire} onTick={onTick} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold tracking-wide">{username}</div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-lg">🎓</div>
        </div>
      </div>
      
      {showProgress && progress && (
        <div className="rounded-lg bg-slate-800/80 px-4 py-3">
          <ProgressBar progress={progress} />
        </div>
      )}
    </div>
  )
}


