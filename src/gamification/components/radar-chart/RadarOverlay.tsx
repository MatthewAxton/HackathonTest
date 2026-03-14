import { motion } from 'framer-motion'
import {
  type RadarScores,
  AXIS_LABELS,
  AXIS_DISPLAY,
  pentagonPoints,
  toPointsString,
  scorePoints,
  labelPosition,
} from './radarGeometry'
import { useRadarAnimation } from './useRadarAnimation'

interface RadarOverlayProps {
  scores: RadarScores
  previousScores?: RadarScores
  size?: number
  animated?: boolean
  showLabels?: boolean
  color?: string
}

/**
 * Radar chart with before/after overlay comparison.
 * Previous scores render as grey dashed polygon.
 * Current scores render as colored solid polygon on top.
 * Delta labels show improvement/decline per axis.
 */
export function RadarOverlay({
  scores,
  previousScores,
  size = 400,
  animated = true,
  showLabels = true,
  color = '#C28FE7',
}: RadarOverlayProps) {
  const animatedScores = useRadarAnimation(scores, animated, 800, 150)

  const padding = 48
  const cx = size / 2
  const cy = size / 2
  const radius = (size - padding * 2) / 2

  const gridRings = [0.33, 0.66, 1.0]
  const outerVertices = pentagonPoints(cx, cy, radius, 1)
  const currentPoints = scorePoints(cx, cy, radius, animatedScores)

  const prevPoints = previousScores
    ? scorePoints(cx, cy, radius, previousScores)
    : null

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="overlayFillGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0.08} />
        </radialGradient>
      </defs>

      {/* Grid rings */}
      {gridRings.map((scale, i) => (
        <polygon
          key={`grid-${i}`}
          points={toPointsString(pentagonPoints(cx, cy, radius, scale))}
          fill="none"
          stroke="var(--border, #E5D5F7)"
          strokeWidth={1}
          strokeDasharray="3,3"
          opacity={0.6}
        />
      ))}

      {/* Axis lines */}
      {outerVertices.map(([vx, vy], i) => (
        <line key={`axis-${i}`} x1={cx} y1={cy} x2={vx} y2={vy}
          stroke="var(--border, #E5D5F7)" strokeWidth={1} opacity={0.4} />
      ))}

      {/* Previous scores — grey dashed */}
      {prevPoints && (
        <motion.polygon
          points={toPointsString(prevPoints)}
          fill="rgba(150,150,150,0.08)"
          stroke="#999"
          strokeWidth={1.5}
          strokeDasharray="6,4"
          strokeLinejoin="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* Current scores — colored solid */}
      <motion.polygon
        points={toPointsString(currentPoints)}
        fill="url(#overlayFillGrad)"
        stroke={color}
        strokeWidth={2.5}
        strokeLinejoin="round"
        initial={animated ? { opacity: 0 } : { opacity: 1 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: previousScores ? 0.6 : 0.2 }}
      />

      {/* Data point dots */}
      {currentPoints.map(([px, py], i) => (
        <g key={`dot-${i}`}>
          <circle cx={px} cy={py} r={8} fill={color} opacity={0.15} />
          <circle cx={px} cy={py} r={4} fill={color} />
        </g>
      ))}

      {/* Labels + delta badges */}
      {showLabels &&
        AXIS_LABELS.map((key, i) => {
          const pos = labelPosition(cx, cy, radius, i, 28)
          const currentVal = Math.round(scores[key])
          const prevVal = previousScores ? Math.round(previousScores[key]) : null
          const delta = prevVal !== null ? currentVal - prevVal : null

          return (
            <g key={`label-${i}`}>
              <text
                x={pos.x}
                y={pos.y - (delta !== null ? 8 : 0)}
                textAnchor={pos.anchor}
                fontFamily="JetBrains Mono, monospace"
                fontSize={11}
                fontWeight={600}
                fill="var(--muted, #777)"
                dominantBaseline="central"
              >
                {AXIS_DISPLAY[key]} ({currentVal})
              </text>

              {/* Delta label */}
              {delta !== null && (
                <motion.text
                  x={pos.x}
                  y={pos.y + 10}
                  textAnchor={pos.anchor}
                  fontFamily="JetBrains Mono, monospace"
                  fontSize={11}
                  fontWeight={700}
                  fill={delta >= 0 ? 'var(--green, #58CC02)' : 'var(--red, #FF4B4B)'}
                  dominantBaseline="central"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 + i * 0.15, duration: 0.4 }}
                >
                  {delta >= 0 ? `+${delta}` : `${delta}`}
                </motion.text>
              )}
            </g>
          )
        })}
    </svg>
  )
}
