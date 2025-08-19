import { useEffect } from 'react'
import { useTimer } from '../../hooks/useTimer'
import { formatTime } from '../../utils/formatters'

export default function Timer({ minutes, onExpire, onTick }) {
  const { secondsLeft } = useTimer(minutes * 60, { onExpire })

  useEffect(() => {
    onTick && onTick(secondsLeft)
  }, [secondsLeft, onTick])

  const danger = secondsLeft <= 60

  return (
    <div className={`rounded-md border px-3 py-1 text-sm ${danger ? 'border-rose-500 text-rose-300' : 'border-slate-700 text-slate-300'}`}>
      ⏱ {formatTime(secondsLeft)}
    </div>
  )
}


