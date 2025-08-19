import { useCallback, useEffect, useRef, useState } from 'react'

export function useTimer(initialSeconds, { onExpire } = {}) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(true)
  const intervalRef = useRef(null)

  const tick = useCallback(() => {
    setSecondsLeft(prev => {
      if (prev <= 1) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
        setIsRunning(false)
        onExpire && onExpire()
        return 0
      }
      return prev - 1
    })
  }, [onExpire])

  useEffect(() => {
    if (isRunning && intervalRef.current == null) {
      intervalRef.current = setInterval(tick, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, tick])

  const pause = useCallback(() => setIsRunning(false), [])
  const resume = useCallback(() => setIsRunning(true), [])
  const reset = useCallback((newSeconds) => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
    setSecondsLeft(newSeconds)
    setIsRunning(true)
  }, [])

  return { secondsLeft, isRunning, pause, resume, reset }
}


