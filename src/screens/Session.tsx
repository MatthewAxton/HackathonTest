import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LiquidGlassPill } from 'anam-react-liquid-glass'
import BackgroundWaves from '../components/BackgroundWaves'

const QUESTIONS = [
  "Tell me about yourself and why you're interested in this role.",
  "Describe a time you faced a difficult challenge at work. How did you handle it?",
  "What's your greatest strength and how has it helped you professionally?",
  "Tell me about a time you had a conflict with a coworker. How did you resolve it?",
  "Where do you see yourself in five years?",
]

const TIPS = [
  { type: 'positive' as const, text: 'Great eye contact!' },
  { type: 'warning' as const, text: 'Try slowing down a little.' },
  { type: 'negative' as const, text: 'Filler: "um" — try pausing.' },
  { type: 'positive' as const, text: 'Nice hand gestures!' },
  { type: 'warning' as const, text: 'Add some pitch variation.' },
]

export default function Session({ onBack }: { onBack: () => void }) {
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(true)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [activeTip, setActiveTip] = useState(0)
  const [wpm, setWpm] = useState(136)
  const [fillers, setFillers] = useState(0)
  const [confidence, setConfidence] = useState(78)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setWpm(130 + Math.floor(Math.random() * 25))
      setFillers((f) => f + (Math.random() > 0.7 ? 1 : 0))
      setConfidence(70 + Math.floor(Math.random() * 20))
      setActiveTip(Math.floor(Math.random() * TIPS.length))
    }, 3000)
    return () => clearInterval(id)
  }, [running])

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0')
  const secs = String(seconds % 60).padStart(2, '0')

  function nextQuestion() {
    if (questionIndex < QUESTIONS.length - 1) setQuestionIndex((i) => i + 1)
  }

  const tip = TIPS[activeTip]
  const tipStyle = tip.type === 'positive'
    ? { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', color: '#4ade80' }
    : tip.type === 'warning'
    ? { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', color: '#fbbf24' }
    : { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', color: '#f87171' }

  function metricColor(label: string) {
    if (label === 'WPM') return wpm >= 130 && wpm <= 150 ? '#4ade80' : '#fbbf24'
    if (label === 'Fillers') return fillers <= 2 ? '#4ade80' : fillers <= 5 ? '#fbbf24' : '#f87171'
    return confidence >= 75 ? '#4ade80' : '#fbbf24'
  }

  return (
    <motion.div
      className="w-full h-full flex flex-col select-none relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #12101a 50%, #0e0c14 100%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <BackgroundWaves />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid rgba(194,143,231,0.1)' }}>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="text-[14px] font-semibold cursor-pointer bg-transparent border-none"
          style={{ color: '#dc2626' }}
        >
          End
        </motion.button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#aeaeb2' }}>Interview</span>
          <span className="text-[13px] font-bold px-2.5 py-0.5 rounded-full" style={{ color: '#c28fe7', background: 'rgba(194,143,231,0.1)' }}>
            Q{questionIndex + 1}/{QUESTIONS.length}
          </span>
        </div>

        <div className="text-[20px] font-bold tabular-nums tracking-tight" style={{ color: 'rgba(255,255,255,0.85)' }}>
          {mins}:{secs}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-6 max-w-[520px] mx-auto w-full">

        {/* Mascot + tip */}
        <div className="flex items-start gap-3 w-full mb-6">
          <motion.img src="/TALKING_1.gif" alt="mascot" className="w-10 h-10 object-contain shrink-0 drop-shadow-md" />
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTip}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.25 }}
              className="px-4 py-2.5 rounded-2xl text-[13px] font-medium"
              style={{ background: tipStyle.bg, border: `1px solid ${tipStyle.border}`, color: tipStyle.color, backdropFilter: 'blur(12px)' }}
            >
              {tip.text}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={questionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="w-full mb-6"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: '#c28fe7' }}>Question {questionIndex + 1}</p>
            <p className="text-[22px] font-bold leading-snug tracking-tight" style={{ color: 'rgba(255,255,255,0.9)' }}>
              {QUESTIONS[questionIndex]}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Waveform */}
        <div className="w-full mb-6">
          <div className="flex items-end justify-center gap-[3px] h-12">
            {Array.from({ length: 40 }).map((_, i) => {
              const h = running ? 8 + Math.random() * 36 : 8
              return (
                <motion.div
                  key={i}
                  className="w-[4px] rounded-full"
                  style={{ background: '#c28fe7' }}
                  animate={{ height: h, opacity: running ? [0.3, 0.8, 0.3] : 0.15 }}
                  transition={{ duration: 0.3, repeat: Infinity, repeatType: 'reverse', delay: i * 0.03 }}
                />
              )
            })}
          </div>
          <p className="text-center text-[12px] mt-2" style={{ color: '#aeaeb2' }}>
            {running ? 'Listening...' : 'Paused'}
          </p>
        </div>

        {/* Metrics */}
        <div className="w-full grid grid-cols-3 gap-3 mb-8">
          {[
            { label: 'WPM', value: wpm },
            { label: 'Fillers', value: fillers },
            { label: 'Confidence', value: `${confidence}%` },
          ].map((m) => (
            <div key={m.label} className="glass text-center py-3 rounded-2xl shadow-sm">
              <div className="text-[24px] font-bold tabular-nums" style={{ color: metricColor(m.label) }}>{m.value}</div>
              <div className="text-[11px] font-semibold uppercase tracking-wider mt-0.5" style={{ color: '#aeaeb2' }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1">
            <LiquidGlassPill
              onClick={() => setRunning(!running)}
              tiltMax={3}
              shineSize={180}
              borderRadius="16px"
              style={{
                background: running ? 'rgba(255,255,255,0.04)' : '#c28fe7',
                border: running ? '1px solid rgba(255,255,255,0.08)' : 'none',
                width: '100%',
              }}
            >
              <div className="py-3.5 text-[15px] font-semibold text-center w-full cursor-pointer" style={{ color: running ? 'rgba(255,255,255,0.6)' : '#fff' }}>
                {running ? 'Pause' : 'Resume'}
              </div>
            </LiquidGlassPill>
          </div>
          <div className="flex-1">
            <LiquidGlassPill
              onClick={nextQuestion}
              tiltMax={4}
              shineSize={200}
              borderRadius="16px"
              style={{ background: '#c28fe7', width: '100%' }}
            >
              <div className="py-3.5 text-[15px] font-bold text-white text-center w-full cursor-pointer">
                {questionIndex < QUESTIONS.length - 1 ? 'Next Question' : 'Finish'}
              </div>
            </LiquidGlassPill>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
