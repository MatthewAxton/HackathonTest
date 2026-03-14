import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Shield, ArrowLeft, Flame } from 'lucide-react'
import GameIntro from '../components/GameIntro'
import { CameraFeed } from '../components/CameraFeed'
import { initPoseTracker, startPoseTracking, stopPoseTracking, onPoseFrame, type PoseFrame } from '../../analysis/mediapipe/poseTracker'
import { computeSimpleGameScore } from '../../analysis/scoring/gameScorer'
import { useGameStore } from '../../store/gameStore'
import { useSessionStore } from '../../store/sessionStore'
import { useRequireScan } from '../hooks/useRequireScan'
import { playGameComplete, playBadgeEarned } from '../../lib/sounds'

const glass: React.CSSProperties = {
  background: 'rgba(0,0,0,0.5)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  borderRadius: 14,
  padding: '10px 16px',
  border: '1px solid rgba(255,255,255,0.1)',
}

interface Callout {
  id: number
  text: string
  positive: boolean
}

let calloutId = 0

export default function StagePresence() {
  const hasScans = useRequireScan()
  const nav = useNavigate()
  const [prompt] = useState(() => useSessionStore.getState().getUnusedPrompt('professional'))
  const [difficulty] = useState(() => useGameStore.getState().getDifficultyFor('statue-mode'))
  const gameDuration = difficulty === 'hard' ? 60 : 45
  const [time, setTime] = useState(gameDuration)
  const [ready, setReady] = useState(false)
  const [presenceScore, setPresenceScore] = useState(75)
  const [presenceStreak, setPresenceStreak] = useState(0)
  const [callouts, setCallouts] = useState<Callout[]>([])
  const [phase, setPhase] = useState<'intro' | 'playing'>('intro')
  const [modelLoading, setModelLoading] = useState(true)
  const [bodyLandmarks, setBodyLandmarks] = useState<PoseFrame['bodyLandmarks']>(null)
  const [subScores, setSubScores] = useState({ posture: 0, openness: 0, gesture: 0, stability: 0 })

  const presenceRef = useRef(75)
  const streakRef = useRef(0)
  const bestStreakRef = useRef(0)
  const badHabitCountRef = useRef(0)
  const presenceAccum = useRef<number[]>([])
  const finished = useRef(false)
  const lastCalloutTime = useRef(0)

  const addCallout = useCallback((text: string, positive: boolean) => {
    const now = Date.now()
    if (now - lastCalloutTime.current < 2000) return
    lastCalloutTime.current = now
    const id = ++calloutId
    setCallouts(prev => [...prev.slice(-2), { id, text, positive }])
    setTimeout(() => setCallouts(prev => prev.filter(c => c.id !== id)), 2000)
  }, [])

  // Auto-start when playing
  useEffect(() => {
    if (phase !== 'playing') return
    let cancelled = false
    ;(async () => {
      try { await initPoseTracker() } catch { /* MediaPipe may fail */ }
      if (!cancelled) { setModelLoading(false); setReady(true) }
    })()
    return () => { cancelled = true }
  }, [phase])

  // Start tracking when video is ready
  useEffect(() => {
    if (!ready || modelLoading) return
    const t = setTimeout(() => {
      const video = document.querySelector('video') as HTMLVideoElement | null
      if (video) startPoseTracking(video)
    }, 500)
    return () => clearTimeout(t)
  }, [ready, modelLoading])

  // Listen for pose data
  useEffect(() => {
    if (!ready) return
    const unsub = onPoseFrame((frame) => {
      const score = frame.presenceScore ?? Math.round(frame.postureScore * 0.4 + frame.headStability * 60)
      presenceRef.current = score
      presenceAccum.current.push(score)
      setPresenceScore(score)
      setSubScores({
        posture: Math.round((frame.uprightAlignment ?? 0) * 100),
        openness: Math.round((frame.openness ?? 1) * 100),
        gesture: Math.round((frame.gestureQuality ?? 0) * 100),
        stability: Math.round((frame.stability ?? 1) * 100),
      })
      if (frame.bodyLandmarks) setBodyLandmarks(frame.bodyLandmarks)

      // Presence streak tracking
      if (score >= 70) {
        streakRef.current += 0.5 // ~2 frames per second
        if (streakRef.current > bestStreakRef.current) bestStreakRef.current = streakRef.current
        setPresenceStreak(Math.floor(streakRef.current))
      } else {
        streakRef.current = 0
        setPresenceStreak(0)
      }

      // Callouts for bad habits
      if (frame.armsCrossed) { badHabitCountRef.current++; addCallout('Arms crossed!', false) }
      else if (frame.faceTouching) { badHabitCountRef.current++; addCallout('Hands away from face!', false) }
      else if (frame.figLeaf) { badHabitCountRef.current++; addCallout('Open your stance!', false) }
      else if (frame.handsInPockets) { badHabitCountRef.current++; addCallout('Hands out of pockets!', false) }
      else if (frame.handsBehindBack) { badHabitCountRef.current++; addCallout('Bring hands forward!', false) }
      // Positive callouts
      else if ((frame.openness ?? 0) > 0.8 && score >= 80) { addCallout('Open stance!', true) }
      else if ((frame.gestureQuality ?? 0) > 0.7) { addCallout('Power zone!', true) }
      else if (streakRef.current > 10 && streakRef.current % 10 < 0.5) { addCallout('Great presence!', true) }
    })
    return unsub
  }, [ready, addCallout])

  const finishGame = useCallback(() => {
    if (finished.current) return
    finished.current = true
    stopPoseTracking()
    const avg = presenceAccum.current.length > 0
      ? presenceAccum.current.reduce((a, b) => a + b) / presenceAccum.current.length : presenceRef.current
    const metrics = {
      stillnessPercent: presenceRef.current,
      movementAlerts: badHabitCountRef.current,
      avgPresenceScore: Math.round(avg),
      presenceStreakSeconds: Math.round(bestStreakRef.current),
      badHabitCount: badHabitCountRef.current,
    }
    const score = computeSimpleGameScore('statue-mode', metrics)
    useGameStore.getState().addGameResult({ gameType: 'statue-mode', score, metrics, timestamp: Date.now() })
    useSessionStore.getState().markPromptUsed(prompt)
    useSessionStore.getState().recordGame('statue-mode')
    const badges = useSessionStore.getState().checkBadges()
    playGameComplete()
    if (badges && badges.length > 0) playBadgeEarned()
    nav('/score/statue')
  }, [nav, prompt])

  // Timer
  useEffect(() => {
    if (!ready) return
    const t = setInterval(() => setTime(p => {
      if (p <= 1) {
        clearInterval(t)
        finishGame()
        return 0
      }
      return p - 1
    }), 1000)
    return () => clearInterval(t)
  }, [nav, ready, finishGame])

  if (!hasScans) return null

  if (phase === 'intro') return (
    <GameIntro
      title="Stage Presence"
      axis="Composure"
      duration={`${gameDuration}s`}
      icon={Shield}
      steps={[
        'Speak on the prompt with confident body language',
        'Keep an open stance — no crossed arms or fidgeting',
        'Use gestures in the power zone (between shoulders and hips)',
      ]}
      goal="Deliver your speech with commanding stage presence"
      tip="Stand tall, open your arms, and gesture with purpose."
      prompt={prompt}
      promptLabel="Stage Presence Challenge"
      heroContent={
        <svg width="120" height="160" viewBox="0 0 120 160" style={{ opacity: 0.6 }}>
          <ellipse cx={60} cy={25} rx={18} ry={20} fill="none" stroke="#c28fe7" strokeWidth={2} />
          <rect x={40} y={50} width={40} height={55} rx={8} fill="none" stroke="#c28fe7" strokeWidth={2} />
          <line x1={40} y1={55} x2={10} y2={75} stroke="#c28fe7" strokeWidth={2} strokeLinecap="round" />
          <line x1={80} y1={55} x2={110} y2={75} stroke="#c28fe7" strokeWidth={2} strokeLinecap="round" />
          <line x1={48} y1={105} x2={40} y2={150} stroke="#c28fe7" strokeWidth={2} strokeLinecap="round" />
          <line x1={72} y1={105} x2={80} y2={150} stroke="#c28fe7" strokeWidth={2} strokeLinecap="round" />
          {/* Power zone indicator */}
          <rect x={30} y={50} width={60} height={55} rx={4} fill="rgba(194,143,231,0.1)" stroke="rgba(194,143,231,0.3)" strokeWidth={1} strokeDasharray="4 2" />
        </svg>
      }
      onReady={() => setPhase('playing')}
    />
  )

  const scoreColor = presenceScore >= 80 ? '#58CC02' : presenceScore >= 60 ? '#FCD34D' : '#FF4B4B'
  const difficultyColor = difficulty === 'hard' ? '#FF4B4B' : difficulty === 'medium' ? '#FCD34D' : '#58CC02'

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', background: '#000' }}>
      {/* Fullscreen camera */}
      <CameraFeed
        style={{ width: '100%', height: '100%', maxWidth: 'none', maxHeight: 'none', border: 'none', borderRadius: 0 }}
        overlay={
          bodyLandmarks ? (() => {
            const b = bodyLandmarks
            const px = (p: { x: number; y: number }) => `${(1 - p.x) * 100}%`
            const py = (p: { x: number; y: number }) => `${p.y * 100}%`

            // Power zone rectangle (shoulder-to-hip box)
            const pzLeft = `${(1 - Math.max(b.leftShoulder.x, b.rightShoulder.x)) * 100 - 3}%`
            const pzTop = `${Math.min(b.leftShoulder.y, b.rightShoulder.y) * 100}%`
            const pzWidth = `${(Math.abs(b.leftShoulder.x - b.rightShoulder.x) + 0.06) * 100}%`
            const pzHeight = `${(Math.abs((b.leftHip.y + b.rightHip.y) / 2 - (b.leftShoulder.y + b.rightShoulder.y) / 2)) * 100}%`

            const Joint = ({ pos, color }: { pos: { x: number; y: number }; color: string }) => (
              <div
                style={{
                  position: 'absolute', left: px(pos), top: py(pos),
                  width: 12, height: 12, marginLeft: -6, marginTop: -6,
                  borderRadius: '50%', background: color, border: '2px solid rgba(255,255,255,0.6)',
                  boxShadow: `0 0 8px ${color}80`,
                  transition: 'background 0.3s',
                }}
              />
            )

            const Bone = ({ from, to, color }: { from: { x: number; y: number }; to: { x: number; y: number }; color: string }) => (
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                <line
                  x1={`${(1 - from.x) * 100}%`} y1={`${from.y * 100}%`}
                  x2={`${(1 - to.x) * 100}%`} y2={`${to.y * 100}%`}
                  stroke={color} strokeWidth={3} strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 4px ${color}60)`, transition: 'stroke 0.3s' }}
                />
              </svg>
            )

            const boneColor = scoreColor

            return (
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                {/* Power Zone overlay */}
                <div style={{
                  position: 'absolute',
                  left: pzLeft, top: pzTop,
                  width: pzWidth, height: pzHeight,
                  background: 'rgba(194,143,231,0.08)',
                  border: '1px solid rgba(194,143,231,0.25)',
                  borderRadius: 8,
                  transition: 'all 0.3s',
                }} />
                {/* Bones */}
                <Bone from={b.leftShoulder} to={b.rightShoulder} color={boneColor} />
                <Bone from={b.leftShoulder} to={b.leftElbow} color={boneColor} />
                <Bone from={b.leftElbow} to={b.leftWrist} color={boneColor} />
                <Bone from={b.rightShoulder} to={b.rightElbow} color={boneColor} />
                <Bone from={b.rightElbow} to={b.rightWrist} color={boneColor} />
                <Bone from={b.leftShoulder} to={b.leftHip} color={boneColor} />
                <Bone from={b.rightShoulder} to={b.rightHip} color={boneColor} />
                <Bone from={b.leftHip} to={b.rightHip} color={boneColor} />
                {/* Joints */}
                <Joint pos={b.nose} color={boneColor} />
                <Joint pos={b.leftShoulder} color={boneColor} />
                <Joint pos={b.rightShoulder} color={boneColor} />
                <Joint pos={b.leftElbow} color={boneColor} />
                <Joint pos={b.rightElbow} color={boneColor} />
                <Joint pos={b.leftWrist} color={boneColor} />
                <Joint pos={b.rightWrist} color={boneColor} />
                <Joint pos={b.leftHip} color={boneColor} />
                <Joint pos={b.rightHip} color={boneColor} />
              </div>
            )
          })() : undefined
        }
      />

      {/* Model loading overlay */}
      {modelLoading && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'rgba(5,5,8,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, pointerEvents: 'none' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }} style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(194,143,231,0.2)', borderTopColor: '#C28FE7' }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Loading pose tracking model...</div>
        </div>
      )}

      {/* Top-left: Back + Title */}
      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          onClick={() => nav('/queue')}
          style={{ ...glass, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 600 }}
        >
          <ArrowLeft size={16} />
          Back
        </div>
        <div style={{ ...glass, display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.9)', fontSize: 15, fontWeight: 700 }}>
          <Shield size={16} style={{ color: '#c28fe7' }} />
          Stage Presence
        </div>
      </div>

      {/* Top-center: Timer */}
      <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}>
        <div style={{ ...glass, fontSize: 28, fontWeight: 800, color: time <= 10 ? '#FF4B4B' : 'rgba(255,255,255,0.95)', fontVariantNumeric: 'tabular-nums', padding: '8px 24px', letterSpacing: 1 }}>
          0:{time.toString().padStart(2, '0')}
        </div>
      </div>

      {/* Top-right: Presence score + streak + difficulty */}
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ ...glass, display: 'flex', alignItems: 'center', gap: 6, color: scoreColor, fontSize: 15, fontWeight: 700 }}>
          <Zap size={15} style={{ color: '#c28fe7' }} />
          {presenceScore}
        </div>
        {presenceStreak > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{ ...glass, display: 'flex', alignItems: 'center', gap: 5, color: '#FCD34D', fontSize: 14, fontWeight: 700, background: 'rgba(252,211,77,0.1)', border: '1px solid rgba(252,211,77,0.2)' }}
          >
            <Flame size={14} />
            {presenceStreak}s
          </motion.div>
        )}
        <div style={{
          ...glass,
          background: `${difficultyColor}20`,
          color: difficultyColor,
          fontSize: 12,
          fontWeight: 700,
          textTransform: 'uppercase' as const,
          letterSpacing: 0.5,
          padding: '8px 14px',
        }}>
          {difficulty}
        </div>
      </div>

      {/* Callouts */}
      <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', zIndex: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <AnimatePresence>
          {callouts.map(c => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              style={{
                ...glass,
                padding: '8px 20px',
                fontSize: 16,
                fontWeight: 800,
                color: c.positive ? '#58CC02' : '#FF4B4B',
                background: c.positive ? 'rgba(88,204,2,0.15)' : 'rgba(255,75,75,0.15)',
                border: `1px solid ${c.positive ? 'rgba(88,204,2,0.3)' : 'rgba(255,75,75,0.3)'}`,
                textShadow: `0 0 12px ${c.positive ? 'rgba(88,204,2,0.5)' : 'rgba(255,75,75,0.5)'}`,
              }}
            >
              {c.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Bottom-center: Sub-scores + Prompt */}
      <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 20, width: '90%', maxWidth: 600, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Sub-score bars */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 10, width: '100%', maxWidth: 400 }}>
          {[
            { label: 'Posture', value: subScores.posture },
            { label: 'Openness', value: subScores.openness },
            { label: 'Gestures', value: subScores.gesture },
            { label: 'Stability', value: subScores.stability },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{s.label}</div>
              <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                <motion.div
                  animate={{ width: `${s.value}%` }}
                  transition={{ duration: 0.3 }}
                  style={{ height: '100%', borderRadius: 2, background: s.value >= 70 ? '#58CC02' : s.value >= 40 ? '#FCD34D' : '#FF4B4B' }}
                />
              </div>
            </div>
          ))}
        </div>
        {/* Prompt card */}
        <div style={{ ...glass, width: '100%', textAlign: 'center', padding: '14px 28px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 0.5, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Stage Presence Challenge</div>
          <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.4, color: 'rgba(255,255,255,0.9)' }}>{prompt}</div>
        </div>
      </div>

      {/* Bottom-right: Finish Early */}
      {time < gameDuration - 10 && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={finishGame}
          style={{
            position: 'absolute',
            bottom: 20,
            right: 16,
            zIndex: 20,
            ...glass,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.5)',
            background: 'rgba(0,0,0,0.6)',
          }}
        >
          Finish Early
        </motion.button>
      )}
    </div>
  )
}
