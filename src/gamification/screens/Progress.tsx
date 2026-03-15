import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Flame, Target, Gamepad2, Trophy, TrendingUp, Share2 } from 'lucide-react'
import { TopBanner } from '../components/Banner'
import { RadarChart } from '../components/radar-chart'
import { RadarOverlay } from '../components/radar-chart/RadarOverlay'
import { ShareModal } from '../components/ShareModal'
import { useScanStore } from '../../store/scanStore'
import { useRequireScan } from '../hooks/useRequireScan'
import { useSessionStore } from '../../store/sessionStore'
import BADGES from '../../lib/badges'
import { BadgeIcon, TIER_LABEL } from '../components/BadgeIcon'
import type { BadgeTier } from '../../analysis/types'

const AXIS_NAMES = ['Clarity', 'Confidence', 'Pacing', 'Expression', 'Composure'] as const
const AXIS_KEYS = ['clarity', 'confidence', 'pacing', 'expression', 'composure'] as const

export default function Progress() {
  const hasScans = useRequireScan()
  const nav = useNavigate()
  const [showShare, setShowShare] = useState(false)
  const getLatestScores = useScanStore((s) => s.getLatestScores)
  const getPreviousScores = useScanStore((s) => s.getPreviousScores)
  const scans = useScanStore((s) => s.scans)
  const latestScores = getLatestScores()
  const previousScores = getPreviousScores()

  if (!hasScans) return null
  const totalScans = useSessionStore((s) => s.totalScans)
  const totalGames = useSessionStore((s) => s.totalGames)
  const streakDays = useSessionStore((s) => s.streakDays)
  const personalBests = useSessionStore((s) => s.personalBests)
  const earnedBadges = useSessionStore((s) => s.earnedBadges)

  const stats = [
    { label: 'Scans', value: totalScans, icon: Target },
    { label: 'Games', value: totalGames, icon: Gamepad2 },
    { label: 'Streak', value: `${streakDays || 0} days`, icon: Flame },
  ]

  const bests = [
    { label: 'Best Overall', value: personalBests.overallScore },
    { label: 'Best Clarity', value: personalBests.clarityScore },
    { label: 'Filler-Free', value: `${personalBests.longestFillerFreeStreak}s` },
    { label: 'Best Game', value: personalBests.highestGameScore },
  ]

  // Compute score deltas if previous scan exists
  const deltas = latestScores && previousScores ? AXIS_KEYS.map((key, i) => ({
    name: AXIS_NAMES[i],
    current: latestScores[key],
    prev: previousScores[key],
    delta: latestScores[key] - previousScores[key],
  })) : null

  // Overall trend from scan history
  const overallTrend = scans.length >= 2
    ? scans[scans.length - 1].scores.overall - scans[scans.length - 2].scores.overall
    : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <TopBanner backTo="/queue" title="Your Progress" right={<div style={{ display: 'flex', gap: 8 }}><button className="btn-secondary" style={{ height: 32, fontSize: 12, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => setShowShare(true)}><Share2 size={13} /> Share</button><button className="btn-secondary" style={{ height: 32, fontSize: 12, padding: '0 12px' }} onClick={() => nav('/queue')}>Games</button><button className="btn-primary" style={{ height: 32, fontSize: 12, padding: '0 12px' }} onClick={() => nav('/scan')}>Rescan</button></div>} />

      <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 24 }}>

          {/* LEFT — Radar + Score + Trend */}
          <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {latestScores ? (
                previousScores ? (
                  <RadarOverlay
                    scores={{ clarity: latestScores.clarity, confidence: latestScores.confidence, pacing: latestScores.pacing, expression: latestScores.expression, composure: latestScores.composure }}
                    previousScores={{ clarity: previousScores.clarity, confidence: previousScores.confidence, pacing: previousScores.pacing, expression: previousScores.expression, composure: previousScores.composure }}
                    size={260} animated={true} />
                ) : (
                  <RadarChart
                    scores={{ clarity: latestScores.clarity, confidence: latestScores.confidence, pacing: latestScores.pacing, expression: latestScores.expression, composure: latestScores.composure }}
                    size={260} animated={true} />
                )
              ) : (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No scans yet</div>
              )}
              {latestScores && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                  <span style={{ fontSize: 48, fontWeight: 800, background: 'linear-gradient(135deg, #C28FE7, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{Math.round(latestScores.overall)}</span>
                  {overallTrend !== 0 && (
                    <span style={{ fontSize: 14, fontWeight: 700, color: overallTrend > 0 ? '#58CC02' : '#FF4B4B', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <TrendingUp size={14} style={{ transform: overallTrend < 0 ? 'rotate(180deg)' : undefined }} />
                      {overallTrend > 0 ? '+' : ''}{overallTrend}
                    </span>
                  )}
                </div>
              )}
            </motion.div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 10 }}>
              {stats.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.08 }}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '12px 8px', textAlign: 'center' }}>
                  <s.icon size={16} color="var(--purple)" style={{ marginBottom: 4 }} />
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--purple)' }}>{s.value}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' }}>{s.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Axis deltas (if rescan) */}
            {deltas && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Since Last Scan</div>
                {deltas.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{d.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: d.delta > 0 ? '#58CC02' : d.delta < 0 ? '#FF4B4B' : 'var(--muted)' }}>
                      {d.delta > 0 ? '+' : ''}{d.delta}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          {/* RIGHT — Bests + Badges */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Personal Bests */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Trophy size={18} color="var(--purple)" />
                <span style={{ fontSize: 17, fontWeight: 700 }}>Personal Bests</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {bests.map((b) => (
                  <div key={b.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '14px 12px', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                    <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--purple)' }}>{b.value}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginTop: 4 }}>{b.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Badges */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 24, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ fontSize: 17, fontWeight: 700 }}>Badges</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>{earnedBadges.size}/{BADGES.length} earned</div>
              </div>
              {(['bronze', 'silver', 'gold', 'diamond'] as BadgeTier[]).map((tier) => {
                const tierBadges = BADGES.filter(b => b.tier === tier)
                if (tierBadges.length === 0) return null
                return (
                  <div key={tier} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted)', marginBottom: 8 }}>{TIER_LABEL[tier]}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 10 }}>
                      {tierBadges.map((badge) => {
                        const earned = earnedBadges.has(badge.id)
                        return (
                          <motion.div key={badge.id} whileHover={{ scale: 1.05 }}
                            title={badge.description}
                            style={{
                              display: 'flex', flexDirection: 'column', alignItems: 'center',
                              textAlign: 'center', padding: '12px 6px', borderRadius: 16,
                              background: earned ? 'rgba(255,255,255,0.03)' : 'transparent',
                              transition: 'all 0.2s', cursor: 'default',
                            }}>
                            <BadgeIcon iconName={badge.icon} tier={badge.tier} earned={earned} size={26} />
                            <div style={{ fontSize: 10, fontWeight: 700, marginTop: 8, color: earned ? 'var(--text)' : 'var(--muted)', opacity: earned ? 1 : 0.4 }}>{badge.name}</div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </motion.div>
          </div>

        </div>
      </div>
      <AnimatePresence>
        {showShare && latestScores && (
          <ShareModal
            scores={{ clarity: latestScores.clarity, confidence: latestScores.confidence, pacing: latestScores.pacing, expression: latestScores.expression, composure: latestScores.composure }}
            overall={latestScores.overall}
            title="My Speech Progress"
            onClose={() => setShowShare(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
