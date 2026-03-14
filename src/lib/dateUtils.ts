/** Date utility helpers for History + Insights */

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  return `${weeks}w ago`
}

export function getWeekBounds(weeksAgo = 0): { start: number; end: number } {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0 = Sunday
  const startOfThisWeek = new Date(now)
  startOfThisWeek.setHours(0, 0, 0, 0)
  startOfThisWeek.setDate(now.getDate() - dayOfWeek)

  const start = new Date(startOfThisWeek)
  start.setDate(start.getDate() - weeksAgo * 7)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)

  return { start: start.getTime(), end: end.getTime() }
}

export function filterByWeek<T>(
  items: T[],
  getTimestamp: (item: T) => number,
  weeksAgo = 0,
): T[] {
  const { start, end } = getWeekBounds(weeksAgo)
  return items.filter((item) => {
    const ts = getTimestamp(item)
    return ts >= start && ts < end
  })
}
