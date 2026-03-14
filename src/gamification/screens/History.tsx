import { motion } from 'framer-motion'
import { Radar, Gamepad2 } from 'lucide-react'
import { TopBanner } from '../components/Banner'
import { Sparkline } from '../components/Sparkline'
import { useScanStore } from '../../store/scanStore'
import { useGameStore } from '../../store/gameStore'
import { formatRelativeTime } from '../../lib/dateUtils'

const GAME_NAMES: Record<string, string> = {
  'filler-ninja': 'Filler Ninja', 'eye-lock': 'Eye Lock',
  'pace-racer': 'Pace Racer', 'pitch-surfer': 'Pitch Surfer', 'statue-mode': 'Stage Presence',
}

type HistoryEntry = { type: 'scan'; timestamp: number; score: number; label: string }
  | { type: 'game'; timestamp: number; score: number; label: string }

export default function History() {
  const scans = useScanStore((s) => s.scans)
  const gameHistory = useGameStore((s) => s.gameHistory)

  const entries: HistoryEntry[] = [
    ...scans.map((s) => ({ type: 'scan' as const, timestamp: s.timestamp, score: Math.round(s.scores.overall), label: 'Radar Scan' })),
    ...gameHistory.map((g) => ({ type: 'game' as const, timestamp: g.timestamp, score: g.score, label: GAME_NAMES[g.gameType] || g.gameType })),
  ].sort((a, b) => b.timestamp - a.timestamp)

  const overallTrend = scans.map((s) => Math.round(s.scores.overall))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <TopBanner backTo="/queue" title="History" />
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          {overallTrend.length >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 20, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6 }}>Score Trend</div>
                <Sparkline data={overallTrend} width={200} height={48} />
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--purple)' }}>{overallTrend[overallTrend.length - 1]}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)' }}>Latest</div>
              </div>
            </motion.div>
          )}

          {entries.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)', fontSize: 15, fontWeight: 600 }}>
              No history yet. Complete a scan or game to see your timeline.
            </div>
          )}

          {entries.map((entry, i) => (
            <motion.div
              key={`${entry.type}-${entry.timestamp}`}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16, padding: '14px 18px', marginBottom: 8,
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: entry.type === 'scan' ? 'rgba(194,143,231,0.12)' : 'rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {entry.type === 'scan' ? <Radar size={18} color="var(--purple)" /> : <Gamepad2 size={18} color="var(--muted)" />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{entry.label}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>{formatRelativeTime(entry.timestamp)}</div>
              </div>
              <div style={{
                fontSize: 22, fontWeight: 800,
                color: entry.score >= 70 ? '#58CC02' : entry.score >= 40 ? '#FCD34D' : '#FF4B4B',
              }}>
                {entry.score}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
