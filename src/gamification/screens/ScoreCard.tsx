import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { TrendingUp, AlertCircle, CheckCircle, Clock, Eye, Lock, EyeOff, Waves, Minus, Activity, Shield, Share2 } from 'lucide-react'
import { TopBanner } from '../components/Banner'
import { ShareModal } from '../components/ShareModal'
import { useGameStore } from '../../store/gameStore'
import { useScanStore } from '../../store/scanStore'
import type { GameType } from '../../analysis/types'
import { useRequireScan } from '../hooks/useRequireScan'

const GAME_KEY_MAP: Record<string, GameType> = {
  filler: 'filler-ninja', eyelock: 'eye-lock', pace: 'pace-racer', pitch: 'pitch-surfer', statue: 'statue-mode',
}

const GAME_PATH_MAP: Record<GameType, string> = {
  'filler-ninja': '/filler-ninja', 'eye-lock': '/eye-lock', 'pace-racer': '/pace-racer', 'pitch-surfer': '/pitch-surfer', 'statue-mode': '/statue-mode',
}

interface GameConfig {
  title: string
  axis: string
  icon: typeof AlertCircle
  replay: string
}

const gameConfigs: Record<string, GameConfig> = {
  filler: { title: 'Filler Ninja', axis: 'Clarity', icon: AlertCircle, replay: '/filler-ninja' },
  eyelock: { title: 'Eye Lock', axis: 'Confidence', icon: Eye, replay: '/eye-lock' },
  pitch: { title: 'Pitch Surfer', axis: 'Expression', icon: Waves, replay: '/pitch-surfer' },
  pace: { title: 'Pace Racer', axis: 'Pacing', icon: Activity, replay: '/pace-racer' },
  statue: { title: 'Stage Presence', axis: 'Composure', icon: Shield, replay: '/statue-mode' },
}

function getMessage(score: number, axis: string): string {
  if (score >= 85) return `Outstanding ${axis.toLowerCase()}! You're a natural.`
  if (score >= 70) return `Great ${axis.toLowerCase()}! Real progress showing.`
  if (score >= 50) return `Good effort! Your ${axis.toLowerCase()} is improving.`
  return `Keep practicing — your ${axis.toLowerCase()} will improve!`
}

function getCoachingTip(game: string, metrics: Record<string, number>): string {
  switch (game) {
    case 'filler': {
      const count = metrics.fillerCount ?? 0
      const streak = metrics.longestStreakSeconds ?? 0
      if (count === 0) return 'Perfect! Zero filler words. You spoke with complete clarity.'
      if (count <= 2) return 'Nearly perfect! Try replacing those last fillers with a brief pause — silence sounds confident.'
      if (streak > 15) return `You had a great ${streak}s clean streak! Focus on maintaining that rhythm throughout.`
      return 'When you feel an "um" coming, pause and take a breath instead. Silence is powerful.'
    }
    case 'eyelock': {
      const pct = metrics.gazeLockedPercent ?? 0
      const best = metrics.longestGazeSeconds ?? 0
      if (pct >= 85) return 'Excellent sustained eye contact! You naturally hold attention.'
      if (best > 10) return `Your best streak was ${best}s — try to sustain that focus throughout. Pick a spot near the camera lens.`
      return 'Try looking at a point right next to the camera lens. Relax your face and breathe — tension causes eyes to dart.'
    }
    case 'pace': {
      const wpm = metrics.avgWpm ?? 0
      const inZone = metrics.timeInZoneSeconds ?? 0
      const total = metrics.totalSeconds ?? 60
      if (inZone / total > 0.7) return 'Great pacing! You stayed in the zone most of the time.'
      if (wpm > 160) return 'You\'re speaking too fast. Try pausing between sentences and breathing deeply.'
      if (wpm < 100) return 'You\'re speaking too slowly. Try to maintain energy and momentum in your delivery.'
      return 'Your pace fluctuated. Focus on steady breathing and consistent energy between sentences.'
    }
    case 'pitch': {
      const variation = metrics.pitchVariation ?? 0
      const monotone = metrics.monotoneSeconds ?? 0
      if (variation > 30) return 'Great vocal variety! Your delivery sounds engaging and dynamic.'
      if (monotone > 10) return `You had ${monotone}s of monotone speech. Try emphasising key words by going higher or lower in pitch.`
      return 'Add more vocal variety. Try going higher on important words and lower on serious points.'
    }
    case 'statue': {
      const presence = metrics.avgPresenceScore ?? metrics.stillnessPercent ?? 0
      const habits = metrics.badHabitCount ?? metrics.movementAlerts ?? 0
      if (presence > 85) return 'Commanding presence! Open stance, purposeful gestures, and confident posture throughout.'
      if (habits > 5) return `${habits} bad habits detected. Keep an open stance — no crossed arms, hands in pockets, or face touching.`
      if (presence > 60) return 'Good body language! Try gesturing more in the power zone (between shoulders and hips) for extra impact.'
      return 'Focus on standing tall with an open stance. Use deliberate hand gestures in front of your torso.'
    }
    default:
      return ''
  }
}

function getStats(game: string, metrics: Record<string, number>) {
  switch (game) {
    case 'filler':
      return [
        { icon: AlertCircle, label: 'Filler words detected', value: String(metrics.fillerCount ?? 0) },
        { icon: CheckCircle, label: 'Best filler-free streak', value: `${metrics.longestStreakSeconds ?? 0}s`, green: true },
        { icon: Clock, label: 'Duration', value: `${metrics.durationSeconds ?? 90}s` },
      ]
    case 'eyelock':
      return [
        { icon: Eye, label: 'Eye contact %', value: `${Math.round(metrics.gazeLockedPercent ?? 0)}%` },
        { icon: Lock, label: 'Longest gaze streak', value: `${metrics.longestGazeSeconds ?? 0}s`, green: true },
        { icon: EyeOff, label: 'Look-aways', value: `${100 - Math.round(metrics.gazeLockedPercent ?? 0)}%` },
      ]
    case 'pace':
      return [
        { icon: Activity, label: 'Average WPM', value: String(Math.round(metrics.avgWpm ?? 0)) },
        { icon: CheckCircle, label: 'Time in zone', value: `${metrics.timeInZoneSeconds ?? 0}s`, green: true },
        { icon: Clock, label: 'Time outside zone', value: `${(metrics.totalSeconds ?? 60) - (metrics.timeInZoneSeconds ?? 0)}s` },
      ]
    case 'pitch':
      return [
        { icon: Waves, label: 'Pitch variation', value: `${Math.round(metrics.pitchVariation ?? 0)} Hz` },
        { icon: TrendingUp, label: 'Variation quality', value: (metrics.pitchVariation ?? 0) > 30 ? 'High' : (metrics.pitchVariation ?? 0) > 15 ? 'Good' : 'Low', green: (metrics.pitchVariation ?? 0) > 15 },
        { icon: Minus, label: 'Monotone time', value: `${metrics.monotoneSeconds ?? 0}s` },
      ]
    case 'statue':
      return [
        { icon: Shield, label: 'Presence score', value: `${Math.round(metrics.avgPresenceScore ?? metrics.stillnessPercent ?? 0)}` },
        { icon: TrendingUp, label: 'Posture', value: `${Math.round((metrics.avgPresenceScore ?? metrics.stillnessPercent ?? 0))}%`, green: (metrics.avgPresenceScore ?? metrics.stillnessPercent ?? 0) >= 70 },
        { icon: Eye, label: 'Openness', value: (metrics.badHabitCount ?? metrics.movementAlerts ?? 0) <= 3 ? 'Open' : 'Closed', green: (metrics.badHabitCount ?? metrics.movementAlerts ?? 0) <= 3 },
        { icon: Activity, label: 'Gesture quality', value: (metrics.avgPresenceScore ?? 0) >= 70 ? 'Good' : 'Work on it', green: (metrics.avgPresenceScore ?? 0) >= 70 },
        { icon: AlertCircle, label: 'Bad habits', value: String(Math.round(metrics.badHabitCount ?? metrics.movementAlerts ?? 0)) },
        { icon: CheckCircle, label: 'Best streak', value: `${Math.round(metrics.presenceStreakSeconds ?? 0)}s`, green: true },
      ]
    default:
      return []
  }
}

export default function ScoreCard() {
  const hasScans = useRequireScan()
  const { game } = useParams<{ game: string }>()
  const nav = useNavigate()
  const config = gameConfigs[game || 'filler']
  const gameType = GAME_KEY_MAP[game || 'filler']

  if (!hasScans) return null
  const gameHistory = useGameStore((s) => s.gameHistory)
  const getRecommendedGameOrder = useGameStore((s) => s.getRecommendedGameOrder)

  // Get results for this game type
  const gameResults = gameHistory.filter((r) => r.gameType === gameType)
  const lastResult = gameResults.length > 0 ? gameResults[gameResults.length - 1] : undefined
  const prevResult = gameResults.length > 1 ? gameResults[gameResults.length - 2] : undefined

  const currentScore = lastResult?.score ?? 0
  const prevScore = prevResult?.score ?? 0
  const improvement = currentScore - prevScore
  const metrics = lastResult?.metrics ?? {}
  const stats = getStats(game || 'filler', metrics)
  void getMessage(currentScore, config.axis)
  const coachingTip = getCoachingTip(game || 'filler', metrics)

  // Compute next game from recommended order
  const recommendedOrder = getRecommendedGameOrder()
  const currentIdx = recommendedOrder.indexOf(gameType)
  const nextGameType = currentIdx >= 0 && currentIdx < recommendedOrder.length - 1
    ? recommendedOrder[currentIdx + 1]
    : null
  const nextPath = nextGameType
    ? GAME_PATH_MAP[nextGameType]
    : '/progress'

  const [showShare, setShowShare] = useState(false)
  const [showConfetti, setShowConfetti] = useState(true)

  const [confettiParticles] = useState(() =>
    Array.from({ length: 30 }, () => ({
      x: (Math.random() - 0.5) * 600,
      y: -(200 + Math.random() * 300),
      rotation: Math.random() * 360,
      size: 6 + Math.random() * 8,
      color: ['#C28FE7', '#8B5CF6', '#A855F7', '#58CC02', '#FCD34D', '#FB923C'][Math.floor(Math.random() * 6)],
      delay: Math.random() * 0.3,
    }))
  )

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 2500)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <AnimatePresence>
        {showConfetti && confettiParticles.map((p, i) => (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
            animate={{ x: p.x, y: p.y, rotate: p.rotation, opacity: 0 }}
            transition={{ duration: 1.8, delay: p.delay, ease: 'easeOut' }}
            style={{
              position: 'fixed', top: '30%', left: '50%',
              width: p.size, height: p.size,
              borderRadius: p.size > 10 ? 2 : '50%',
              background: p.color,
              zIndex: 200, pointerEvents: 'none',
            }}
          />
        ))}
      </AnimatePresence>
      <TopBanner backTo="/queue" title="Session Complete" right={<span style={{ fontSize: 13, opacity: 0.8 }}>{config.title} · {config.axis}</span>} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ width: '100%', maxWidth: 960, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 40px' }}>
          <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', damping: 8, stiffness: 150, delay: 0.5 }} style={{ fontSize: 64, fontWeight: 900, lineHeight: 1, background: 'linear-gradient(135deg, #C28FE7, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{currentScore}</motion.div>
          <div style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 600, margin: '4px 0 6px' }}>
            {prevResult ? `was ${prevScore} → now ${currentScore}` : `Score: ${currentScore}`}
          </div>
          {improvement !== 0 && prevResult && (
            <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.7 }} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: improvement > 0 ? 'rgba(74,222,128,0.15)' : 'rgba(255,75,75,0.1)', color: improvement > 0 ? 'var(--green)' : 'var(--red)', fontSize: 13, fontWeight: 700, padding: '4px 12px', borderRadius: 10, marginBottom: 16 }}><TrendingUp size={13} /> {improvement > 0 ? '+' : ''}{improvement} {improvement > 0 ? 'improvement' : 'change'}</motion.div>
          )}
          {!prevResult && <div style={{ marginBottom: 16 }} />}
          <div style={{ width: '100%', maxWidth: 480, marginBottom: 16 }}>
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 + i*0.15 }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: i < stats.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <s.icon size={16} color={s.green ? 'var(--green)' : 'var(--muted)'} />
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{s.label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: s.green ? 'var(--green)' : 'var(--text)' }}>{s.value}</span>
              </motion.div>
            ))}
          </div>
          {coachingTip && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              style={{ width: '100%', maxWidth: 480, marginBottom: 16, background: 'rgba(194,143,231,0.08)', border: '1px solid rgba(194,143,231,0.2)', borderRadius: 14, padding: '14px 18px' }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--purple)', marginBottom: 6 }}>Coach's Tip</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.5 }}>{coachingTip}</div>
            </motion.div>
          )}
          <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 480 }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={() => nav(nextPath)}>{nextGameType ? 'Next Game' : 'View Progress'}</button>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => nav(config.replay)}>Play Again</button>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <button className="btn-secondary" style={{ height: 36, fontSize: 13, padding: '0 20px' }} onClick={() => nav('/queue')}>Back to Dashboard</button>
            <button className="btn-secondary" style={{ height: 36, fontSize: 13, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setShowShare(true)}>
              <Share2 size={14} /> Share
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {showShare && (() => {
          const latestScores = useScanStore.getState().getLatestScores()
          const shareScores = latestScores ? { clarity: latestScores.clarity, confidence: latestScores.confidence, pacing: latestScores.pacing, expression: latestScores.expression, composure: latestScores.composure } : { clarity: 50, confidence: 50, pacing: 50, expression: 50, composure: 50 }
          return <ShareModal scores={shareScores} overall={currentScore} title={`${config.title} — ${currentScore}`} onClose={() => setShowShare(false)} />
        })()}
      </AnimatePresence>
    </div>
  )
}
