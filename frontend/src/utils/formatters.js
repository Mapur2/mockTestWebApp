export function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function percentage(numerator, denominator) {
  if (denominator === 0) return 0
  return Math.round((numerator / denominator) * 100)
}


