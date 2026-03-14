import { motion } from 'framer-motion'
import { Target } from 'lucide-react'
import { useSessionStore } from '../../store/sessionStore'
import { useScanStore } from '../../store/scanStore'
import GOAL_CONFIGS from '../../lib/goalConfig'

export function GoalTrackerCard() {
  const userGoal = useSessionStore((s) => s.userGoal)
  const totalGames = useSessionStore((s) => s.totalGames)
  const getLatestScores = useScanStore((s) => s.getLatestScores)

  if (!userGoal) return null

  const config = GOAL_CONFIGS[userGoal]
  const latestScores = getLatestScores()
  const tipIdx = totalGames % config.tips.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        background: 'rgba(194,143,231,0.06)',
        border: '1px solid rgba(194,143,231,0.2)',
        borderRadius: 20, padding: '16px 20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Target size={16} color="var(--purple)" />
        <span style={{ fontSize: 14, fontWeight: 700 }}>Goal: {config.label}</span>
        <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>
          {totalGames}/{config.recommendedDrillCount} drills
        </span>
      </div>

      {config.focusAxes.map((axis) => {
        const score = latestScores ? latestScores[axis] : 0
        return (
          <div key={axis} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
              <span style={{ textTransform: 'capitalize' }}>{axis}</span>
              <span style={{ color: 'var(--purple)' }}>{Math.round(score)}</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }}>
              <div style={{ height: '100%', borderRadius: 3, background: 'var(--purple)', width: `${Math.min(100, score)}%`, transition: 'width 0.3s' }} />
            </div>
          </div>
        )
      })}

      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginTop: 8, lineHeight: 1.5 }}>
        {config.tips[tipIdx]}
      </div>
    </motion.div>
  )
}
