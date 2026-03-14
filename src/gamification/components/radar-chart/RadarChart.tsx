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

interface RadarChartProps {
  scores: RadarScores
  /** Pixel width and height (default 400) */
  size?: number
  /** Trigger staggered draw animation on mount (default true) */
  animated?: boolean
  /** Show axis name labels (default true) */
  showLabels?: boolean
  /** Show score values beside labels (default true) */
  showValues?: boolean
  /** Accent color (default #C28FE7) */
  color?: string
}

export function RadarChart({
  scores,
  size = 400,
  animated = true,
  showLabels = true,
  showValues = true,
  color = '#C28FE7',
}: RadarChartProps) {
  const animatedScores = useRadarAnimation(scores, animated)

  const padding = 48
  const cx = size / 2
  const cy = size / 2
  const radius = (size - padding * 2) / 2

  // Grid rings at 33%, 66%, 100%
  const gridRings = [0.33, 0.66, 1.0]

  // Score polygon vertices
  const dataPoints = scorePoints(cx, cy, radius, animatedScores)
  const dataPointsString = toPointsString(dataPoints)

  // Outer vertices (for axis lines + data point dots)
  const outerVertices = pentagonPoints(cx, cy, radius, 1)

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="radarFillGrad" cx="50%" cy="50%" r="50%">
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

      {/* Axis lines from center to each outer vertex */}
      {outerVertices.map(([vx, vy], i) => (
        <line
          key={`axis-${i}`}
          x1={cx}
          y1={cy}
          x2={vx}
          y2={vy}
          stroke="var(--border, #E5D5F7)"
          strokeWidth={1}
          opacity={0.4}
        />
      ))}

      {/* Score polygon — filled area */}
      <motion.polygon
        points={dataPointsString}
        fill="url(#radarFillGrad)"
        stroke={color}
        strokeWidth={2.5}
        strokeLinejoin="round"
        initial={animated ? { opacity: 0 } : { opacity: 1 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />

      {/* Data point dots */}
      {dataPoints.map(([px, py], i) => (
        <g key={`dot-${i}`}>
          <circle cx={px} cy={py} r={8} fill={color} opacity={0.15} />
          <circle cx={px} cy={py} r={4} fill={color} />
        </g>
      ))}

      {/* Axis labels */}
      {showLabels &&
        AXIS_LABELS.map((key, i) => {
          const pos = labelPosition(cx, cy, radius, i, 28)
          const displayName = AXIS_DISPLAY[key]
          const scoreVal = Math.round(scores[key])
          const label = showValues ? `${displayName} (${scoreVal})` : displayName
          return (
            <text
              key={`label-${i}`}
              x={pos.x}
              y={pos.y}
              textAnchor={pos.anchor}
              fontFamily="JetBrains Mono, monospace"
              fontSize={11}
              fontWeight={600}
              fill="var(--muted, #777)"
              dominantBaseline="central"
            >
              {label}
            </text>
          )
        })}
    </svg>
  )
}

export type { RadarScores }
