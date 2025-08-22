import { useEffect, useState } from 'react'

export default function AutoSaveStatus({ progress, hasUnsavedChanges, lastSaved }) {
  const [showSaved, setShowSaved] = useState(false)

  useEffect(() => {
    if (lastSaved) {
      setShowSaved(true)
      const timer = setTimeout(() => setShowSaved(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [lastSaved])

  return (
    <div className="flex items-center gap-4 text-sm text-slate-400">
      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        <div className="h-2 w-16 rounded-full bg-slate-700">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        <span>{progress.answered}/{progress.total}</span>
      </div>

      {/* Auto-save status */}
      <div className="flex items-center gap-2">
        {showSaved ? (
          <span className="text-green-400">✓ Saved</span>
        ) : hasUnsavedChanges ? (
          <span className="text-yellow-400">● Saving...</span>
        ) : (
          <span className="text-slate-500">○ No changes</span>
        )}
      </div>

      {/* Progress percentage */}
      <span className="font-mono">{progress.percentage}%</span>
    </div>
  )
}
