export function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function percentage(numerator, denominator) {
  if (denominator === 0) return 0
  return Math.round((numerator / denominator) * 100)
}

export function getTimeWarningLevel(secondsLeft, totalSeconds) {
  const percentageLeft = (secondsLeft / totalSeconds) * 100
  
  if (secondsLeft === 0) return 'expired'
  if (percentageLeft <= 5) return 'danger' // Last 5%
  if (percentageLeft <= 10) return 'warning' // Last 10%
  if (percentageLeft <= 25) return 'info' // Last 25%
  return 'normal'
}

export function formatTimeRemaining(seconds) {
  if (seconds <= 0) return 'Time expired'
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s remaining`
  } else {
    return `${remainingSeconds}s remaining`
  }
}


