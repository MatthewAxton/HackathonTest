import type { ScanResult, GameResult, RadarScores } from '../analysis/types'
import { filterByWeek } from './dateUtils'

const AXIS_KEYS = ['clarity', 'confidence', 'pacing', 'expression', 'composure'] as const
type AxisKey = typeof AXIS_KEYS[number]
const AXIS_NAMES: Record<AxisKey, string> = {
  clarity: 'Clarity', confidence: 'Confidence', pacing: 'Pacing',
  expression: 'Expression', composure: 'Composure',
}

function avgAxis(scans: ScanResult[], axis: keyof RadarScores): number {
  if (scans.length === 0) return 0
  const sum = scans.reduce((acc, s) => acc + s.scores[axis], 0)
  return sum / scans.length
}

export function generateInsights(scans: ScanResult[], games: GameResult[]): string[] {
  const insights: string[] = []

  const thisWeekScans = filterByWeek(scans, (s) => s.timestamp, 0)
  const lastWeekScans = filterByWeek(scans, (s) => s.timestamp, 1)
  const thisWeekGames = filterByWeek(games, (g) => g.timestamp, 0)

  const practiceCount = thisWeekScans.length + thisWeekGames.length
  insights.push(`You practiced ${practiceCount} time${practiceCount !== 1 ? 's' : ''} this week.`)

  if (thisWeekScans.length > 0 && lastWeekScans.length > 0) {
    let bestImprovement = -Infinity
    let bestAxis: AxisKey = 'clarity'
    let worstDrop = Infinity
    let worstAxis: AxisKey = 'clarity'

    for (const axis of AXIS_KEYS) {
      const thisAvg = avgAxis(thisWeekScans, axis)
      const lastAvg = avgAxis(lastWeekScans, axis)
      const delta = thisAvg - lastAvg

      if (delta > bestImprovement) {
        bestImprovement = delta
        bestAxis = axis
      }
      if (delta < worstDrop) {
        worstDrop = delta
        worstAxis = axis
      }
    }

    if (bestImprovement > 0) {
      insights.push(`Biggest improvement: ${AXIS_NAMES[bestAxis]} (+${Math.round(bestImprovement)} points).`)
    }
    if (worstDrop < 0) {
      insights.push(`Needs attention: ${AXIS_NAMES[worstAxis]} (${Math.round(worstDrop)} points).`)
    }
  } else if (thisWeekScans.length === 0 && lastWeekScans.length === 0) {
    insights.push('Complete more scans to see weekly comparisons.')
  }

  // Find weakest current axis
  if (scans.length > 0) {
    const latest = scans[scans.length - 1]
    let weakest: AxisKey = AXIS_KEYS[0]
    for (const axis of AXIS_KEYS) {
      if (latest.scores[axis] < latest.scores[weakest]) {
        weakest = axis
      }
    }
    insights.push(`Your weakest area is ${AXIS_NAMES[weakest]}. Focus your drills there!`)
  }

  return insights
}
