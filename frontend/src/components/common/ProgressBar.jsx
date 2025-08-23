export default function ProgressBar({ progress, className = '' }) {
  const { answered, total, percentage } = progress

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-slate-300">Progress</span>
        <span className="text-slate-400">
          {answered} of {total} questions ({percentage}%)
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
