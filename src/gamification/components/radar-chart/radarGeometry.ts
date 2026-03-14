/**
 * Pure geometry functions for the 5-axis radar chart.
 * No external deps — just trigonometry.
 *
 * Axes at 72° intervals, starting from top (–90°):
 *   Clarity (top), Confidence (top-right), Pacing (bottom-right),
 *   Expression (bottom-left), Composure (top-left)
 */

export interface RadarScores {
  clarity: number
  confidence: number
  pacing: number
  expression: number
  composure: number
}

export const AXIS_LABELS: (keyof RadarScores)[] = [
  'clarity',
  'confidence',
  'pacing',
  'expression',
  'composure',
]

export const AXIS_DISPLAY: Record<keyof RadarScores, string> = {
  clarity: 'Clarity',
  confidence: 'Confidence',
  pacing: 'Pacing',
  expression: 'Expression',
  composure: 'Composure',
}

/** Returns the (x, y) of a point on the radar at a given axis index and normalized radius (0–1). */
export function radarPoint(
  cx: number,
  cy: number,
  radius: number,
  axisIndex: number,
  value: number, // 0–1
): [number, number] {
  // Start from top (–90°), go clockwise
  const angle = (Math.PI * 2 * axisIndex) / 5 - Math.PI / 2
  const r = radius * Math.max(0, Math.min(1, value))
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)]
}

/** Returns all 5 vertices of a regular pentagon at the given scale (0–1). */
export function pentagonPoints(cx: number, cy: number, radius: number, scale: number = 1): [number, number][] {
  return Array.from({ length: 5 }, (_, i) => radarPoint(cx, cy, radius, i, scale))
}

/** Converts an array of [x,y] pairs to an SVG polygon points string. */
export function toPointsString(points: [number, number][]): string {
  return points.map(([x, y]) => `${x},${y}`).join(' ')
}

/** Returns the 5 vertices for a given RadarScores object (scores 0–100 mapped to 0–1). */
export function scorePoints(cx: number, cy: number, radius: number, scores: RadarScores): [number, number][] {
  return AXIS_LABELS.map((key, i) => radarPoint(cx, cy, radius, i, scores[key] / 100))
}

/** Label anchor position — offset outward from the vertex for text placement. */
export function labelPosition(
  cx: number,
  cy: number,
  radius: number,
  axisIndex: number,
  offset: number = 22,
): { x: number; y: number; anchor: 'start' | 'middle' | 'end' } {
  const [px, py] = radarPoint(cx, cy, radius + offset, axisIndex, 1)
  // Determine text-anchor based on horizontal position
  let anchor: 'start' | 'middle' | 'end' = 'middle'
  if (px < cx - 5) anchor = 'end'
  else if (px > cx + 5) anchor = 'start'
  return { x: px, y: py, anchor }
}
