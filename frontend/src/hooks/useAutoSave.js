import { useEffect, useRef } from 'react'

export function useAutoSave(enabled, saveFunction, dependencies, intervalMs = 30000) {
  const intervalRef = useRef(null)
  const lastSaveRef = useRef(Date.now())

  // Clear existing interval
  const clearInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  // Set up auto-save interval
  useEffect(() => {
    if (!enabled) {
      clearInterval()
      return
    }

    // Save immediately when dependencies change
    if (dependencies && dependencies.length > 0) {
      saveFunction()
      lastSaveRef.current = Date.now()
    }

    // Set up periodic auto-save
    intervalRef.current = setInterval(() => {
      saveFunction()
      lastSaveRef.current = Date.now()
    }, intervalMs)

    return clearInterval
  }, [enabled, saveFunction, intervalMs, ...(dependencies || [])])

  // Force save function
  const forceSave = () => {
    if (enabled) {
      saveFunction()
      lastSaveRef.current = Date.now()
    }
  }

  return {
    forceSave,
    lastSaveTime: lastSaveRef.current,
    isEnabled: enabled
  }
}
