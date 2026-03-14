import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Eye } from 'lucide-react'
import { TopBanner } from '../components/Banner'
import { AudioWave } from '../components/AudioWave'
import { CameraFeed } from '../components/CameraFeed'
import { startTranscription, stopTranscription, onTranscript, getTranscriberStatus } from '../../analysis/speech/transcriber'
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

export default function RadarScan() {
  const nav = useNavigate()
  const [phase, setPhase] = useState<'scanning' | 'analyzing'>('scanning')
  const [time, setTime] = useState(30)
  const [wpm, setWpm] = useState(0)
  const [fillers, setFillers] = useState(0)
  const [transcriptStatus, setTranscriptStatus] = useState('')
  const micStarted = useRef(false)
  const scanFinished = useRef(false)

  // Sensor accumulators
  const gazeFrames = useRef({ good: 0, total: 0 })
  const poseScores = useRef<number[]>([])
  const stillFrames = useRef({ still: 0, total: 0 })
  const fidgets = useRef(0)
  const pitchReadings = useRef<number[]>([])
  const wordCountRef = useRef(0)

  // Start scan in store
  const startScan = useScanStore((s) => s.startScan)
  const appendRawData = useScanStore((s) => s.appendRawData)
  const completeScan = useScanStore((s) => s.completeScan)

  // Start MediaPipe when video element is available
  const handleVideoRef = useCallback(async (video: HTMLVideoElement) => {
    try {
      await initGazeEngine()
      startGazeTracking(video)
    } catch { /* gaze may fail — continue */ }
    try {
      await initPoseTracker()
      startPoseTracking(video)
    } catch { /* pose may fail — continue */ }
  }, [])

  // Start mic + analysis when camera stream is ready (audio comes with it)
  const handleStream = useCallback((stream: MediaStream) => {
    if (micStarted.current) return
    micStarted.current = true

    // Start all analysis modules
    startTranscription()
    startFillerDetection()
    startWpmTracking()
    startAudioAnalysis(stream)
    startScan()
    playScanStart()
  }, [startScan])

  // Subscribe to sensor callbacks
  useEffect(() => {
    const unsubGaze = onGazeReading((reading) => {
      gazeFrames.current.total++
      if (reading.quality === 'good') gazeFrames.current.good++
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
    return () => {
      unsubGaze()
      unsubPose()
      unsubAudio()
      unsubTranscript()
    }
  }, [])

  // Update live metrics
  useEffect(() => {
    const wpmInterval = setInterval(() => {
      setWpm(getRollingWpm())
      setFillers(getFillerCount())
      const status = getTranscriberStatus()
      setTranscriptStatus(status.simulated ? 'Demo mode (simulated)' : status.error ? `Error: ${status.error}` : status.active ? 'Listening...' : 'Inactive')
    }, 500)
    return () => clearInterval(wpmInterval)
  }, [])

  const finishScan = useCallback(() => {
    if (scanFinished.current) return
    scanFinished.current = true

    // Stop all analysis
    stopTranscription()
    stopFillerDetection()
    stopWpmTracking()
    stopAudioAnalysis()
    stopGazeTracking()
    stopPoseTracking()

    // Compute real sensor values
    const eyeContactPercent = gazeFrames.current.total > 0
      ? (gazeFrames.current.good / gazeFrames.current.total) * 100 : 50
    const postureScore = poseScores.current.length > 0
      ? poseScores.current.reduce((a, b) => a + b) / poseScores.current.length : 50
    const pitchStdDev = computeStdDev(pitchReadings.current)
    const stillnessPercent = stillFrames.current.total > 0
      ? (stillFrames.current.still / stillFrames.current.total) * 100 : 50

    appendRawData({
      durationSeconds: 30,
      fillerCount: getFillerCount(),
      wordCount: wordCountRef.current,
      avgWpm: getRollingWpm(),
      wpmStdDev: getWpmStdDev(),
      eyeContactPercent: Math.round(eyeContactPercent),
      postureScore: Math.round(postureScore),
      pitchStdDev: Math.round(pitchStdDev),
      stillnessPercent: Math.round(stillnessPercent),
      fidgetCount: fidgets.current,
    })
    completeScan()
    playScanComplete()
    useSessionStore.getState().recordScan()
    const badges = useSessionStore.getState().checkBadges()
    if (badges && badges.length > 0) playBadgeEarned()

    setPhase('analyzing')
  }, [appendRawData, completeScan])

  // Timer countdown
  useEffect(() => {
    const t = setInterval(() => setTime(p => {
      if (p <= 1) {
        clearInterval(t)
        finishScan()
        return 0
      }
      return p - 1
    }), 1000)
    return () => clearInterval(t)
  }, [nav, finishScan])

  // Navigate after analyzing phase
  useEffect(() => {
    if (phase !== 'analyzing') return
    const t = setTimeout(() => nav('/results'), 2000)
    return () => clearTimeout(t)
  }, [phase, nav])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <AnimatePresence>
        {phase === 'analyzing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#050508', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(135deg, #C28FE7, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
            >
              Analysing your speech...
            </motion.div>
            <motion.div
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}
            >
              Building your speech profile
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <TopBanner title="30-Second Scan" center={<span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 16px', borderRadius: 12, fontSize: 15, fontWeight: 800 }}>0:{time.toString().padStart(2, '0')}</span>} right={<span style={{ fontSize: 13, opacity: 0.8 }}>Analysing your speech...</span>} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ width: '100%', maxWidth: 960, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 40px' }}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}
            style={{ width: '100%', maxWidth: 640, margin: '10px 0' }}>
            <CameraFeed
              style={{ height: 260 }}
              withAudio={true}
              onStream={handleStream}
              onVideoRef={handleVideoRef}
              overlay={
                <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                  style={{ position: 'absolute', bottom: 12, right: 12, background: 'var(--purple)', color: 'white', fontSize: 18, fontWeight: 800, padding: '6px 16px', borderRadius: 12 }}>
                  0:{time.toString().padStart(2, '0')}
                </motion.div>
              }
            />
          </motion.div>
          <div className="card-surface" style={{ width: '100%', maxWidth: 640, textAlign: 'center', padding: '14px 28px', marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--muted)', marginBottom: 6 }}>Read This Passage Aloud</div>
            <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.6 }}>
              <span style={{ color: 'var(--muted)' }}>The most effective leaders are those who can communicate their vision clearly. </span>
              <span style={{ color: 'var(--purple)', fontWeight: 800 }}>They inspire action not through authority, </span>
              but through the power of their words and the confidence of their delivery.
            </div>
          </div>
          <AudioWave />
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <span style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '6px 14px', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><Activity size={14} color="var(--purple)" /> <span style={{ color: 'var(--purple)', fontWeight: 700 }}>{wpm} WPM</span></span>
            <span style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '6px 14px', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><Eye size={14} color="var(--purple)" /> <span style={{ color: 'var(--purple)', fontWeight: 700 }}>{fillers} fillers</span></span>
            <span style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '6px 14px', fontSize: 11, fontWeight: 600, color: transcriptStatus.startsWith('Error') ? 'var(--red)' : 'var(--muted)' }}>{transcriptStatus}</span>
          </div>
          {time < 20 && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={finishScan}
              style={{ marginTop: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '10px 28px', fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}
            >
              Finish Early
            </motion.button>
          )}
        </div>
      </div>
    </div>
  )
}
