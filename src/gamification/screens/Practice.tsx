import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Eye, Square } from 'lucide-react'
import { CameraFeed } from '../components/CameraFeed'
import { startTranscription, stopTranscription, onTranscript } from '../../analysis/speech/transcriber'
import { startFillerDetection, stopFillerDetection, getFillerCount } from '../../analysis/speech/fillerDetector'
import { startWpmTracking, stopWpmTracking, getRollingWpm, getWpmStdDev } from '../../analysis/speech/wpmTracker'
import { startAudioAnalysis, stopAudioAnalysis, onAudioFrame } from '../../analysis/audio/pitchAnalyzer'
import { initGazeEngine, startGazeTracking, stopGazeTracking, onGazeReading } from '../../analysis/mediapipe/gazeEngine'
import { initPoseTracker, startPoseTracking, stopPoseTracking, onPoseFrame } from '../../analysis/mediapipe/poseTracker'
import { useScanStore } from '../../store/scanStore'
import { useSessionStore } from '../../store/sessionStore'
import { playScanStart, playScanComplete, playBadgeEarned } from '../../lib/sounds'

function computeStdDev(values: number[]): number {
  if (values.length < 2) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

const glassCard: React.CSSProperties = {
  background: 'rgba(0,0,0,0.5)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  borderRadius: 14,
  padding: '10px 16px',
  border: '1px solid rgba(255,255,255,0.1)',
}

export default function Practice() {
  const nav = useNavigate()
  const location = useLocation()
  const initialPrompt = (location.state as { prompt?: string } | null)?.prompt ?? ''

  const [phase, setPhase] = useState<'setup' | 'recording' | 'analyzing'>('setup')
  const [promptText, setPromptText] = useState(initialPrompt)
  const [speakFreely, setSpeakFreely] = useState(!initialPrompt)
  const [elapsed, setElapsed] = useState(0)
  const [wpm, setWpm] = useState(0)
  const [fillers, setFillers] = useState(0)

  const micStarted = useRef(false)
  const scanFinished = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Sensor accumulators (same pattern as RadarScan)
  const gazeFrames = useRef({ good: 0, total: 0 })
  const poseScores = useRef<number[]>([])
  const stillFrames = useRef({ still: 0, total: 0 })
  const fidgets = useRef(0)
  const pitchReadings = useRef<number[]>([])
  const wordCountRef = useRef(0)
  const blinkCount = useRef(0)
  const jawTensions = useRef<number[]>([])
  const lipCompressions = useRef<number[]>([])
  const gazeConfidences = useRef<number[]>([])
  const startTimeRef = useRef(0)

  const startScan = useScanStore((s) => s.startScan)
  const appendRawData = useScanStore((s) => s.appendRawData)
  const completeScan = useScanStore((s) => s.completeScan)

  const handleVideoRef = useCallback(async (video: HTMLVideoElement) => {
    const [gazeOk, poseOk] = await Promise.all([
      initGazeEngine().then(() => true).catch(() => false),
      initPoseTracker().then(() => true).catch(() => false),
    ])
    if (gazeOk) startGazeTracking(video)
    if (poseOk) startPoseTracking(video)
  }, [])

  const handleStream = useCallback((stream: MediaStream) => {
    if (micStarted.current) return
    micStarted.current = true
    startTranscription()
    startFillerDetection()
    startWpmTracking()
    startAudioAnalysis(stream)
    startScan()
    playScanStart()
    startTimeRef.current = Date.now()
    timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000)), 1000)
  }, [startScan])

  // Subscribe to sensors
  useEffect(() => {
    if (phase !== 'recording') return
    const unsubGaze = onGazeReading((reading) => {
      gazeFrames.current.total++
      if (reading.quality === 'good') gazeFrames.current.good++
      if (reading.blinkDetected) blinkCount.current++
      if (reading.jawTension != null) jawTensions.current.push(reading.jawTension)
      if (reading.lipCompression != null) lipCompressions.current.push(reading.lipCompression)
      gazeConfidences.current.push(reading.confidence)
    })
    const unsubPose = onPoseFrame((frame) => {
      poseScores.current.push(frame.postureScore)
      stillFrames.current.total++
      if (!frame.isFidgeting) stillFrames.current.still++
      if (frame.isFidgeting) fidgets.current++
    })
    const unsubAudio = onAudioFrame((frame) => {
      if (frame.pitch > 0) pitchReadings.current.push(frame.pitch)
    })
    const unsubTranscript = onTranscript((event) => {
      if (event.isFinal) wordCountRef.current = event.wordCount
    })
    return () => { unsubGaze(); unsubPose(); unsubAudio(); unsubTranscript() }
  }, [phase])

  // Live metric updates
  useEffect(() => {
    if (phase !== 'recording') return
    const iv = setInterval(() => {
      setWpm(getRollingWpm())
      setFillers(getFillerCount())
    }, 500)
    return () => clearInterval(iv)
  }, [phase])

  const finishRecording = useCallback(() => {
    if (scanFinished.current) return
    scanFinished.current = true
    if (timerRef.current) clearInterval(timerRef.current)

    stopTranscription()
    stopFillerDetection()
    stopWpmTracking()
    stopAudioAnalysis()
    stopGazeTracking()
    stopPoseTracking()

    const duration = Math.max(5, Math.floor((Date.now() - startTimeRef.current) / 1000))
    const eyeContactPercent = gazeFrames.current.total > 0 ? (gazeFrames.current.good / gazeFrames.current.total) * 100 : 50
    const postureScore = poseScores.current.length > 0 ? poseScores.current.reduce((a, b) => a + b) / poseScores.current.length : 50
    const pitchStdDev = computeStdDev(pitchReadings.current)
    const stillnessPercent = stillFrames.current.total > 0 ? (stillFrames.current.still / stillFrames.current.total) * 100 : 50
    const blinkRate = (blinkCount.current / duration) * 60
    const avgJawTension = jawTensions.current.length > 0 ? jawTensions.current.reduce((a, b) => a + b) / jawTensions.current.length : undefined
    const avgLipCompression = lipCompressions.current.length > 0 ? lipCompressions.current.reduce((a, b) => a + b) / lipCompressions.current.length : undefined
    const gazeStability = gazeConfidences.current.length > 2 ? 1 - computeStdDev(gazeConfidences.current) * 3 : undefined
    let pitchJitter: number | undefined
    if (pitchReadings.current.length > 2) {
      const diffs: number[] = []
      for (let i = 1; i < pitchReadings.current.length; i++) diffs.push(Math.abs(pitchReadings.current[i] - pitchReadings.current[i - 1]))
      pitchJitter = diffs.reduce((a, b) => a + b) / diffs.length
    }

    appendRawData({
      durationSeconds: duration,
      fillerCount: getFillerCount(),
      wordCount: wordCountRef.current,
      avgWpm: getRollingWpm(),
      wpmStdDev: getWpmStdDev(),
      eyeContactPercent: Math.round(eyeContactPercent),
      postureScore: Math.round(postureScore),
      pitchStdDev: Math.round(pitchStdDev),
      stillnessPercent: Math.round(stillnessPercent),
      fidgetCount: fidgets.current,
      blinkRate: Math.round(blinkRate),
      jawTension: avgJawTension != null ? Math.round(avgJawTension * 100) / 100 : undefined,
      lipCompression: avgLipCompression != null ? Math.round(avgLipCompression * 100) / 100 : undefined,
      gazeStability: gazeStability != null ? Math.max(0, Math.min(1, Math.round(gazeStability * 100) / 100)) : undefined,
      pitchJitter: pitchJitter != null ? Math.round(pitchJitter * 10) / 10 : undefined,
    })
    completeScan()
    playScanComplete()
    useSessionStore.getState().recordScan()
    const badges = useSessionStore.getState().checkBadges()
    if (badges && badges.length > 0) playBadgeEarned()
    setPhase('analyzing')
  }, [appendRawData, completeScan])

  // Navigate after analyzing
  useEffect(() => {
    if (phase !== 'analyzing') return
    const t = setTimeout(() => nav('/results'), 2000)
    return () => clearTimeout(t)
  }, [phase, nav])

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  // Setup phase
  if (phase === 'setup') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#050508' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: 480, width: '100%', padding: '0 24px' }}>
            <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Free Practice</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)', marginBottom: 24 }}>Speak at your own pace. Stop when you're ready.</div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, cursor: 'pointer' }}>
              <input type="checkbox" checked={speakFreely} onChange={(e) => setSpeakFreely(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#c28fe7' }} />
              <span style={{ fontSize: 14, fontWeight: 600 }}>Speak freely (no prompt)</span>
            </label>

            {!speakFreely && (
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Enter your own text to practice..."
                style={{
                  width: '100%', minHeight: 120, padding: '14px 16px', borderRadius: 14,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: 500, resize: 'vertical',
                  fontFamily: 'inherit', marginBottom: 20,
                }}
              />
            )}

            <button className="btn-primary" style={{ width: '100%', padding: '14px 0', fontSize: 16 }} onClick={() => setPhase('recording')}>
              Start Recording
            </button>
            <button className="btn-secondary" style={{ width: '100%', marginTop: 10, padding: '10px 0' }} onClick={() => nav('/queue')}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Recording + analyzing phases
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', background: '#000' }}>
      <AnimatePresence>
        {phase === 'analyzing' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#050508', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}
          >
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(135deg, #C28FE7, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Analysing your speech...
            </motion.div>
            <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ repeat: Infinity, duration: 2.5 }}
              style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>
              Building your speech profile
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CameraFeed
        style={{ width: '100%', height: '100%', maxWidth: 'none', maxHeight: 'none', border: 'none', borderRadius: 0 }}
        withAudio={true}
        onStream={handleStream}
        onVideoRef={handleVideoRef}
      />

      {/* Top-left: Title */}
      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 20 }}>
        <div style={{ ...glassCard, fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444', animation: 'pulse 1.5s ease-in-out infinite' }} />
          Free Practice
        </div>
      </div>

      {/* Top-center: Elapsed time */}
      <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}>
        <div style={{ ...glassCard, padding: '12px 28px', fontSize: 32, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: 'rgba(255,255,255,0.95)' }}>
          {formatTime(elapsed)}
        </div>
      </div>

      {/* Top-right: Live stats */}
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 20, display: 'flex', gap: 8 }}>
        <div style={{ ...glassCard, fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Activity size={14} color="#c28fe7" />
          <span style={{ color: '#c28fe7' }}>{wpm}</span> WPM
        </div>
        <div style={{ ...glassCard, fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Eye size={14} color="#c28fe7" />
          <span style={{ color: '#c28fe7' }}>{fillers}</span> fillers
        </div>
      </div>

      {/* Bottom-center: Prompt or stop button */}
      <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        {!speakFreely && promptText && (
          <div style={{ ...glassCard, maxWidth: 600, textAlign: 'center', padding: '14px 24px' }}>
            <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.7, color: 'rgba(255,255,255,0.8)' }}>{promptText}</div>
          </div>
        )}
        <button
          onClick={finishRecording}
          style={{
            ...glassCard, padding: '12px 32px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 15, fontWeight: 700, color: '#ef4444',
            border: '1px solid rgba(239,68,68,0.3)',
          }}
        >
          <Square size={16} fill="#ef4444" /> Stop Recording
        </button>
      </div>
    </div>
  )
}
