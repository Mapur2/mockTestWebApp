import { useEffect, useState } from 'react'

export default function TimeWarning({ warning, onClose }) {
  const [isVisible, setIsVisible] = useState(false)
  const [message, setMessage] = useState('')
  const [type, setType] = useState('')

  useEffect(() => {
    if (warning) {
      setType(warning.type)
      setMessage(warning.message)
      setIsVisible(true)
      
      // Auto-hide warnings after a certain time
      let timeout
      if (warning.type === 'expired') {
        // Don't auto-hide expired warnings
        timeout = null
      } else if (warning.type === 'danger') {
        // Hide danger warnings after 5 seconds
        timeout = setTimeout(() => setIsVisible(false), 5000)
      } else {
        // Hide regular warnings after 3 seconds
        timeout = setTimeout(() => setIsVisible(false), 3000)
      }
      
      return () => {
        if (timeout) clearTimeout(timeout)
      }
    }
  }, [warning])

  if (!isVisible) return null

  const getWarningStyle = () => {
    switch (type) {
      case 'expired':
        return 'border-red-600 bg-red-900/40 text-red-200 animate-pulse'
      case 'danger':
        return 'border-red-500 bg-red-900/30 text-red-200'
      case 'warning':
        return 'border-yellow-500 bg-yellow-900/30 text-yellow-200'
      default:
        return 'border-slate-600 bg-slate-900/30 text-slate-200'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'expired':
        return '⏰'
      case 'danger':
        return '⚠️'
      case 'warning':
        return '⏳'
      default:
        return 'ℹ️'
    }
  }

  return (
    <div className={`fixed top-4 right-4 z-50 rounded-lg border p-4 shadow-lg ${getWarningStyle()}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{getIcon()}</span>
        <div>
          <div className="font-semibold">{message}</div>
          {type === 'expired' && (
            <div className="text-sm opacity-80">Test will be submitted automatically</div>
          )}
        </div>
        {type !== 'expired' && (
          <button
            onClick={() => setIsVisible(false)}
            className="ml-2 rounded-full p-1 hover:bg-white/10"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
