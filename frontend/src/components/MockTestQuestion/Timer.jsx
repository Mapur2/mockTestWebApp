import { useEffect, useMemo } from 'react'
import { useTimer } from '../../hooks/useTimer'
import { formatTime } from '../../utils/formatters'

export default function Timer({ minutes, onExpire, onTick, onWarning }) {
  const totalSeconds = useMemo(() => Math.max(0, Math.floor(minutes * 60)), [minutes])
  const { secondsLeft } = useTimer(totalSeconds, { onExpire })

  useEffect(() => {
    onTick && onTick(secondsLeft)
  }, [secondsLeft, onTick])

  // Time warning system
  useEffect(() => {
    if (onWarning) {
      if (secondsLeft <= 300 && secondsLeft > 240) { // 5 minutes remaining
        onWarning('warning', '5 minutes remaining!')
      } else if (secondsLeft <= 240 && secondsLeft > 180) { // 4 minutes remaining
        onWarning('warning', '4 minutes remaining!')
      } else if (secondsLeft <= 180 && secondsLeft > 120) { // 3 minutes remaining
        onWarning('warning', '3 minutes remaining!')
      } else if (secondsLeft <= 120 && secondsLeft > 60) { // 2 minutes remaining
        onWarning('warning', '2 minutes remaining!')
      } else if (secondsLeft <= 60 && secondsLeft > 30) { // 1 minute remaining
        onWarning('warning', '1 minute remaining!')
      } else if (secondsLeft <= 30 && secondsLeft > 0) { // 30 seconds remaining
        onWarning('danger', '30 seconds remaining!')
      } else if (secondsLeft === 0) { // Time expired
        onWarning('expired', 'Time expired!')
      }
    }
  }, [secondsLeft, onWarning])

  // Determine timer styling based on time remaining
  const getTimerStyle = () => {
    if (secondsLeft === 0) {
      return 'border-red-600 bg-red-900/20 text-red-300 animate-pulse'
    } else if (secondsLeft <= 30) {
      return 'border-red-500 bg-red-900/20 text-red-300 animate-pulse'
    } else if (secondsLeft <= 60) {
      return 'border-orange-500 bg-orange-900/20 text-orange-300'
    } else if (secondsLeft <= 300) {
      return 'border-yellow-500 bg-yellow-900/20 text-yellow-300'
    } else {
      return 'border-slate-700 bg-slate-800/20 text-slate-300'
    }
  }

  return (
    <div className={`rounded-md border px-3 py-1 text-sm font-mono ${getTimerStyle()}`}>
      ⏱ {formatTime(secondsLeft)}
    </div>
  )
}


