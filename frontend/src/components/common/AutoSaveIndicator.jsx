import { useEffect, useState } from 'react'

export default function AutoSaveIndicator({ status }) {
  const [show, setShow] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (status === 'saving' || status === 'saved' || status === 'error') {
      setShow(true)
      
      // Set appropriate message based on status
      switch (status) {
        case 'saving':
          setMessage('Saving progress...')
          break
        case 'saved':
          setMessage(`Auto-saved at ${new Date().toLocaleTimeString()}`)
          break
        case 'error':
          setMessage('Save failed')
          break
        default:
          setMessage('')
      }
      
      // Auto-hide after appropriate time
      const hideDelay = status === 'saved' ? 4000 : 3000
      const timer = setTimeout(() => setShow(false), hideDelay)
      return () => clearTimeout(timer)
    } else {
      setShow(false)
    }
  }, [status])

  if (!show) return null

  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: '⏳',
          className: 'text-yellow-400 border-yellow-500 bg-yellow-900/20'
        }
      case 'saved':
        return {
          icon: '✓',
          className: 'text-green-400 border-green-500 bg-green-900/20'
        }
      case 'error':
        return {
          icon: '⚠',
          className: 'text-red-400 border-red-500 bg-red-900/20'
        }
      default:
        return {
          icon: '',
          className: ''
        }
    }
  }

  const config = getStatusConfig()

  return (
    <div className={`fixed bottom-4 right-4 z-50 rounded-lg border px-3 py-2 text-sm font-medium shadow-lg transition-all duration-300 ${config.className}`}>
      <div className="flex items-center gap-2">
        <span>{config.icon}</span>
        <span>{message}</span>
      </div>
    </div>
  )
}
