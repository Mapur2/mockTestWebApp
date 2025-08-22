import { useCallback, useEffect, useRef, useState } from 'react'

export function useTimer(initialSeconds, { onExpire, autoStart = true } = {}) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(Boolean(autoStart))
  const intervalRef = useRef(null)
  const onExpireRef = useRef(onExpire)

  // Keep latest onExpire without recreating interval
  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  // Reset timer when initialSeconds changes
  useEffect(() => {
    clearTimer()
    setSecondsLeft(initialSeconds)
    if (autoStart) {
      setIsRunning(true)
    }
  }, [initialSeconds, autoStart])

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    if (intervalRef.current != null) return
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearTimer()
          setIsRunning(false)
          if (onExpireRef.current) onExpireRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [clearTimer])

  useEffect(() => {
    if (isRunning) startTimer()
    return () => {
      clearTimer()
    }
  }, [isRunning, startTimer, clearTimer])

  const pause = useCallback(() => setIsRunning(false), [])
  const resume = useCallback(() => setIsRunning(true), [])
  const reset = useCallback((newSeconds) => {
    clearTimer()
    setSecondsLeft(newSeconds)
    setIsRunning(true)
  }, [clearTimer])

  return { secondsLeft, isRunning, pause, resume, reset }
}


