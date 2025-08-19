export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-6 text-slate-200">
      <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"></span>
      <span className="text-sm">{label}</span>
    </div>
  )
}


