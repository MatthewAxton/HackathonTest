import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Zap, Lock, ArrowLeft, AlertTriangle } from 'lucide-react'
import GameIntro from '../components/GameIntro'
import { CameraFeed } from '../components/CameraFeed'
import { EyeContactIndicator } from '../components/EyeContactIndicator'
import { useEyeContact } from '../../analysis/hooks/useEyeContact'
import { computeSimpleGameScore } from '../../analysis/scoring/gameScorer'
import { useGameStore } from '../../store/gameStore'
import { useSessionStore } from '../../store/sessionStore'
import { useRequireScan } from '../hooks/useRequireScan'
import { playGameComplete, playBadgeEarned, playCountdownBeep } from '../../lib/sounds'
import { getPromptCategory, getPromptLabel } from '../../lib/goalPromptMap'
import type { Difficulty } from '../../analysis/types'

const QUALITY_COLORS = { good: '#58CC02', weak: '#F5A623', lost: '#FF4B4B' }

const DIFFICULTY_CONFIG: Record<Difficulty, { duration: number; chargeRate: number; drainRate: number; tip: string }> = {
  easy:   { duration: 45, chargeRate: 6, drainRate: 5,  tip: 'Relax your shoulders and breathe.' },
  medium: { duration: 45, chargeRate: 5, drainRate: 8,  tip: 'The ring drains faster — stay locked in!' },
  hard:   { duration: 60, chargeRate: 4, drainRate: 12, tip: 'Strict mode — looking away costs you fast!' },
}

const glassCard: React.CSSProperties = {
  background: 'rgba(0,0,0,0.5)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  borderRadius: 14,
  padding: '10px 16px',
  border: '1px solid rgba(255,255,255,0.1)',
}

export default function EyeLock() {
  const hasScans = useRequireScan()
  const nav = useNavigate()
  const [difficulty] = useState(() => useGameStore.getState().getDifficultyFor('eye-lock'))
  const config = DIFFICULTY_CONFIG[difficulty]
  const [promptCategory] = useState(() => getPromptCategory(useSessionStore.getState().userGoal, 'interview'))
  const [prompt] = useState(() => useSessionStore.getState().getUnusedPrompt(promptCategory))
  const promptLabel = getPromptLabel(promptCategory)
  const gameDuration = config.duration
  const [time, setTime] = useState(gameDuration)
  const [ready, setReady] = useState(false)
  const [charge, setCharge] = useState(0)
  const [burstCount, setBurstCount] = useState(0)
  const [phase, setPhase] = useState<'intro' | 'playing'>('intro')
  const [lostWarning, setLostWarning] = useState(false)
  const [streakFlash, setStreakFlash] = useState(0)
  const finished = useRef(false)
  const lastQualityRef = useRef<string>('lost')
  const lostSoundCooldown = useRef(0)

  const eye = useEyeContact()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const trackingStarted = useRef(false)

  // Try to start tracking (guarded against double-start)
  const tryStartTracking = useCallback(() => {
    if (trackingStarted.current || !eye.modelReady || !videoRef.current) return
    trackingStarted.current = true
    eye.startTracking(videoRef.current)
  }, [eye.modelReady, eye.startTracking])

  // Auto-start when playing
  useEffect(() => {
    if (phase !== 'playing') return
    let cancelled = false
    trackingStarted.current = false
    eye.init().then(() => { if (!cancelled) setReady(true) })
    return () => { cancelled = true }
  }, [phase, eye.init])

  // Store video element when CameraFeed provides it
  const handleVideoRef = useCallback((el: HTMLVideoElement) => {
    videoRef.current = el
    tryStartTracking()
  }, [tryStartTracking])

  // Start tracking when model loads (if video already available)
  useEffect(() => {
    if (!ready) return
    tryStartTracking()
  }, [ready, eye.modelReady, tryStartTracking])

  // Sound + visual feedback when quality changes
  useEffect(() => {
    if (!ready) return
    const prev = lastQualityRef.current
    const curr = eye.quality
    lastQualityRef.current = curr

    // Gaze lost — show warning + play alert sound
    if (curr === 'lost' && prev !== 'lost') {
      setLostWarning(true)
      const now = Date.now()
      if (now - lostSoundCooldown.current > 1500) {
        playCountdownBeep()
        lostSoundCooldown.current = now
      }
    }
    // Gaze recovered — hide warning, flash green
    if (curr === 'good' && prev !== 'good') {
      setLostWarning(false)
      setStreakFlash(Date.now())
    }
    if (curr === 'weak') {
      setLostWarning(false)
    }
  }, [ready, eye.quality])

  // Power ring: charges while maintaining eye contact
  useEffect(() => {
    if (!ready) return
    const t = setInterval(() => {
      if (eye.quality === 'good') {
        setCharge(c => {
          if (c >= 100) {
            setBurstCount(b => b + 1)
            return 0 // reset after burst
          }
          return Math.min(100, c + config.chargeRate)
        })
      } else {
        setCharge(c => Math.max(0, c - config.drainRate))
      }
    }, 200)
    return () => clearInterval(t)
  }, [ready, eye.quality])

  const finishGame = useCallback(() => {
    if (finished.current) return
    finished.current = true
    eye.stopTracking()
    const metrics = { gazeLockedPercent: eye.sessionPercent, longestGazeSeconds: eye.longestStreak }
    const score = computeSimpleGameScore('eye-lock', metrics)
    useGameStore.getState().addGameResult({ gameType: 'eye-lock', score, metrics, timestamp: Date.now() })
    useSessionStore.getState().markPromptUsed(prompt)
    useSessionStore.getState().recordGame('eye-lock')
    const badges = useSessionStore.getState().checkBadges()
    playGameComplete()
    if (badges && badges.length > 0) playBadgeEarned()
    nav('/score/eyelock')
  }, [eye, nav, prompt])

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
      title="Eye Lock"
      axis="Confidence"
      duration={`${gameDuration}s`}
      icon={Eye}
      steps={[
        'Look directly at the camera while answering the question',
        'The screen goes dark when you look away — stay locked!',
        'Maintain eye contact to charge the power ring and earn bursts',
      ]}
      goal="Keep your gaze locked for as much of the session as possible"
      tip={config.tip}
      prompt={prompt}
      promptLabel={promptLabel}
      heroContent={
        <div style={{ position: 'relative', width: 100, height: 100 }}>
          <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 2, repeat: Infinity }} style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(88,204,2,0.3)' }} />
          <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} style={{ position: 'absolute', inset: 15, borderRadius: '50%', border: '2px solid rgba(88,204,2,0.4)' }} />
          <div style={{ position: 'absolute', inset: 35, borderRadius: '50%', background: '#58CC02', boxShadow: '0 0 20px rgba(88,204,2,0.5)' }} />
        </div>
      }
      onReady={() => setPhase('playing')}
    />
  )
  const color = QUALITY_COLORS[eye.quality]
  const mins = Math.floor(time / 60)
  const secs = time % 60

  // Compute dim level based on quality
  const dimOpacity = eye.quality === 'good' ? 0 : eye.quality === 'weak' ? 0.4 : 0.7

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', background: '#000' }}>
      {/* Fullscreen camera */}
      <CameraFeed
        style={{ width: '100%', height: '100%', maxWidth: 'none', maxHeight: 'none', border: 'none', borderRadius: 0 }}
        withAudio={true}
        onVideoRef={handleVideoRef}
        overlay={
          <EyeContactIndicator
            quality={eye.quality}
            confidence={eye.confidence}
            sessionPercent={eye.sessionPercent}
            currentStreak={eye.currentStreak}
            headYaw={eye.headYaw}
            headPitch={eye.headPitch}
            signals={eye.signals}
            leftEyePos={eye.leftEyePos}
            rightEyePos={eye.rightEyePos}
          />
        }
      />

      {/* Strong dim overlay — progressive darkening when not looking */}
      <motion.div
        animate={{ opacity: ready ? dimOpacity : 0 }}
        transition={{ duration: 0.4 }}
        style={{ position: 'absolute', inset: 0, background: '#000', pointerEvents: 'none', zIndex: 5 }}
      />

      {/* Green glow when looking — subtle edge glow */}
      <AnimatePresence>
        {ready && eye.quality === 'good' && (
          <motion.div
            key="glow-good"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5,
              boxShadow: 'inset 0 0 80px rgba(88,204,2,0.15), inset 0 0 200px rgba(88,204,2,0.05)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Red vignette when lost */}
      <AnimatePresence>
        {ready && eye.quality === 'lost' && (
          <motion.div
            key="vignette-lost"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 6,
              boxShadow: 'inset 0 0 120px rgba(255,75,75,0.3), inset 0 0 300px rgba(255,75,75,0.15)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Recovery flash — green flash when re-locking */}
      <AnimatePresence>
        {streakFlash > 0 && (
          <motion.div
            key={streakFlash}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 6,
              background: 'rgba(88,204,2,0.1)',
            }}
          />
        )}
      </AnimatePresence>

      {/* "LOOK AT THE CAMERA" warning */}
      <AnimatePresence>
        {lostWarning && ready && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              zIndex: 30, pointerEvents: 'none', textAlign: 'center',
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{
                ...glassCard,
                background: 'rgba(255,75,75,0.2)',
                border: '2px solid rgba(255,75,75,0.4)',
                padding: '20px 40px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              }}
            >
              <AlertTriangle size={28} color="#FF4B4B" />
              <div style={{ fontSize: 20, fontWeight: 800, color: '#FF4B4B', letterSpacing: 1, textTransform: 'uppercase' }}>
                Look at the camera!
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>
                Your score is dropping
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Model loading overlay */}
      {!eye.modelReady && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'rgba(5,5,8,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, pointerEvents: 'none' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }} style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(194,143,231,0.2)', borderTopColor: '#C28FE7' }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Loading eye tracking model...</div>
        </div>
      )}

      {/* Top-left: Back + Title */}
      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 20, display: 'flex', gap: 8, alignItems: 'center' }}>
        <div
          onClick={() => nav('/queue')}
          style={{ ...glassCard, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}
        >
          <ArrowLeft size={16} /> Back
        </div>
        <div style={{ ...glassCard, fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Eye size={16} /> Eye Lock
        </div>
        <div style={{
          ...glassCard,
          fontSize: 11,
          fontWeight: 700,
          padding: '6px 12px',
          color: difficulty === 'hard' ? '#FF4B4B' : difficulty === 'medium' ? '#FCD34D' : '#58CC02',
          background: `${difficulty === 'hard' ? 'rgba(255,75,75,0.15)' : difficulty === 'medium' ? 'rgba(252,211,77,0.15)' : 'rgba(88,204,2,0.15)'}`,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}>
          {difficulty}
        </div>
      </div>

      {/* Top-center: Timer */}
      <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}>
        <div style={{ ...glassCard, fontSize: 22, fontWeight: 800, color: 'rgba(255,255,255,0.95)', padding: '10px 24px', fontVariantNumeric: 'tabular-nums' }}>
          {mins}:{secs.toString().padStart(2, '0')}
        </div>
      </div>

      {/* Top-right: Stats */}
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 20, display: 'flex', gap: 8, alignItems: 'center' }}>
        {/* Session percentage — large and prominent */}
        <div style={{
          ...glassCard,
          fontSize: 22, fontWeight: 800, padding: '8px 18px',
          color: eye.sessionPercent >= 70 ? '#58CC02' : eye.sessionPercent >= 40 ? '#FCD34D' : '#FF4B4B',
          transition: 'color 0.4s',
          borderColor: eye.quality === 'good' ? 'rgba(88,204,2,0.3)' : 'rgba(255,255,255,0.1)',
        }}>
          {eye.sessionPercent}%
          <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginLeft: 6, textTransform: 'uppercase' }}>score</span>
        </div>
        <div style={{ ...glassCard, fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Zap size={14} /> Best: {eye.longestStreak}s
        </div>
        <div style={{
          ...glassCard, fontSize: 13, fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 6,
          color,
          borderColor: eye.quality === 'good' ? 'rgba(88,204,2,0.3)' : eye.quality === 'lost' ? 'rgba(255,75,75,0.3)' : 'rgba(255,255,255,0.1)',
          transition: 'color 0.3s, border-color 0.3s',
        }}>
          <Lock size={14} /> {eye.quality === 'good' ? 'LOCKED' : eye.quality === 'weak' ? 'Drifting...' : 'LOST!'}
        </div>
      </div>

      {/* Bottom-center: Prompt card */}
      <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 20, width: '90%', maxWidth: 600 }}>
        <div style={{ ...glassCard, textAlign: 'center', padding: '16px 24px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{promptLabel}</div>
          <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.4, color: 'rgba(255,255,255,0.9)' }}>{prompt}</div>
        </div>
      </div>

      {/* Bottom-right: Finish Early */}
      {time < gameDuration - 10 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ position: 'absolute', bottom: 20, right: 16, zIndex: 20 }}
        >
          <button
            onClick={finishGame}
            style={{ ...glassCard, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.5)', background: 'rgba(0,0,0,0.5)' }}
          >
            Finish Early
          </button>
        </motion.div>
      )}

      {/* Bottom-left: Power ring + streak */}
      <div style={{ position: 'absolute', bottom: 20, left: 16, zIndex: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ ...glassCard, display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px' }}>
          <div style={{ position: 'relative', width: 48, height: 48 }}>
            <svg width={48} height={48} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={24} cy={24} r={20} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={4} />
              <circle cx={24} cy={24} r={20} fill="none" stroke={charge >= 90 ? '#FFD700' : '#58CC02'} strokeWidth={4} strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - charge / 100)}`}
                style={{ transition: 'stroke-dashoffset 0.2s ease, stroke 0.3s', filter: charge >= 90 ? 'drop-shadow(0 0 8px #FFD700)' : 'none' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: charge >= 90 ? '#FFD700' : 'rgba(255,255,255,0.6)' }}>
              {charge >= 100 ? '✦' : `${charge}%`}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {burstCount > 0 && (
              <motion.div key={burstCount} initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ fontSize: 13, fontWeight: 800, color: '#FFD700' }}>
                +{burstCount} BURST{burstCount > 1 ? 'S' : ''}
              </motion.div>
            )}
            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>
              {charge >= 90 ? 'READY TO BURST!' : eye.quality === 'good' ? 'Charging...' : 'Lock eyes to charge'}
            </div>
          </div>
        </div>

        {/* Current streak badge */}
        {eye.currentStreak > 0 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              ...glassCard,
              borderColor: 'rgba(88,204,2,0.3)',
              padding: '8px 14px',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <span style={{ fontSize: 20, fontWeight: 800, color: '#58CC02' }}>{eye.currentStreak}s</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>streak</span>
          </motion.div>
        )}
      </div>
    </div>
  )
}
