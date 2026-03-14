import { AXIS_LABELS, AXIS_DISPLAY, pentagonPoints, scorePoints } from '../gamification/components/radar-chart/radarGeometry'
import type { RadarScores } from '../gamification/components/radar-chart/radarGeometry'

/**
 * Renders a 1200x630 share card onto a canvas element.
 */
export function renderShareCard(
  canvas: HTMLCanvasElement,
  scores: RadarScores,
  overall: number,
  title: string,
): void {
  const W = 1200
  const H = 630
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Background
  ctx.fillStyle = '#050508'
  ctx.fillRect(0, 0, W, H)

  // Subtle gradient overlay
  const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 400)
  grad.addColorStop(0, 'rgba(194,143,231,0.08)')
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // Radar chart — centered left
  const cx = 340
  const cy = H / 2
  const radius = 180

  // Grid rings
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.lineWidth = 1
  for (const scale of [0.33, 0.66, 1.0]) {
    const pts = pentagonPoints(cx, cy, radius, scale)
    ctx.beginPath()
    pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
    ctx.closePath()
    ctx.stroke()
  }

  // Axis lines
  const outer = pentagonPoints(cx, cy, radius, 1)
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  for (const [x, y] of outer) {
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  // Score polygon fill
  const dataPts = scorePoints(cx, cy, radius, scores)
  ctx.beginPath()
  dataPts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
  ctx.closePath()
  ctx.fillStyle = 'rgba(194,143,231,0.2)'
  ctx.fill()
  ctx.strokeStyle = '#C28FE7'
  ctx.lineWidth = 2.5
  ctx.stroke()

  // Data point dots
  for (const [x, y] of dataPts) {
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fillStyle = '#C28FE7'
    ctx.fill()
  }

  // Axis labels
  ctx.font = '600 13px "JetBrains Mono", monospace'
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2
    const lx = cx + (radius + 28) * Math.cos(angle)
    const ly = cy + (radius + 28) * Math.sin(angle)
    const key = AXIS_LABELS[i]
    const label = `${AXIS_DISPLAY[key]} (${Math.round(scores[key])})`
    ctx.textAlign = lx < cx - 5 ? 'right' : lx > cx + 5 ? 'left' : 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, lx, ly)
  }

  // Right side — title + overall score
  const rightX = 660

  ctx.font = '800 42px "Nunito", sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText(title, rightX, 160)

  // Overall score
  ctx.font = '800 96px "Nunito", sans-serif'
  const scoreGrad = ctx.createLinearGradient(rightX, 230, rightX + 120, 330)
  scoreGrad.addColorStop(0, '#C28FE7')
  scoreGrad.addColorStop(1, '#8B5CF6')
  ctx.fillStyle = scoreGrad
  ctx.fillText(String(Math.round(overall)), rightX, 230)

  ctx.font = '600 18px "Nunito", sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.fillText('Overall Score', rightX, 340)

  // Branding
  ctx.font = '800 20px "Nunito", sans-serif'
  ctx.textBaseline = 'bottom'
  const maxW = ctx.measureText('MAX').width
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.textAlign = 'right'
  ctx.fillText('Speech', W - 40 - maxW - 4, H - 30)
  ctx.fillStyle = '#C28FE7'
  ctx.fillText('MAX', W - 40, H - 30)
}
