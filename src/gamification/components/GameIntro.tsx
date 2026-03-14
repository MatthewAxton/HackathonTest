import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { TopBanner } from './Banner'
import { Mike } from './Mike'
import { playCountdownBeep, playGoTone } from '../../lib/sounds'

interface GameIntroProps {
  title: string
  axis: string
  duration: string
  icon: LucideIcon
  steps: string[]
  goal: string
  tip: string
  prompt: string
  promptLabel: string
  heroContent?: React.ReactNode
  onReady: () => void
}

interface Particle { id: number; angle: number }

export default function GameIntro({
  title, axis, duration, icon: Icon, steps, goal, tip, prompt, promptLabel, heroContent, onReady,
}: GameIntroProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [phase, setPhase] = useState<'intro' | 'countdown'>('intro')
  const [count, setCount] = useState(3)
  const goFired = useRef(false)

  const handleReady = () => {
    if (phase !== 'intro') return
    setParticles(Array.from({ length: 14 }, (_, i) => ({ id: i, angle: (360 / 14) * i })))
    setTimeout(() => setPhase('countdown'), 800)
  }

  useEffect(() => {
    if (phase !== 'countdown') return
    if (count > 0) {
      playCountdownBeep()
      const t = setTimeout(() => setCount(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
    if (count === 0 && !goFired.current) {
      goFired.current = true
      playGoTone()
      setTimeout(() => onReady(), 800)
    }
  }, [phase, count, onReady])

  const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }
  const fadeLeft = { hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }
  const fadeRight = { hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }

  // Countdown overlay
  if (phase === 'countdown') {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: '#050508', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          {count > 0 ? (
            <motion.div key={count} initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 2, opacity: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{ fontSize: 120, fontWeight: 800, background: 'linear-gradient(135deg, #c28fe7, #9b59d0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1, userSelect: 'none' }}>
              {count}
            </motion.div>
          ) : (
            <motion.div key="go" initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
              <div style={{ width: 160, height: 160, borderRadius: '50%', background: 'linear-gradient(135deg, #c28fe7, #9b59d0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 52, fontWeight: 800, color: '#fff', letterSpacing: 2 }}>GO!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#050508', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 50 }}>
      <TopBanner backTo="/queue" title={title}
        right={<div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(194,143,231,0.15)', borderRadius: 20, padding: '4px 14px', fontSize: 13, color: '#c28fe7', fontWeight: 600 }}>{axis} · {duration}</div>}
      />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 48px', overflow: 'auto' }}>
        <div style={{ display: 'flex', gap: 56, maxWidth: 960, width: '100%', alignItems: 'center' }}>

          {/* LEFT — Visual side */}
          <motion.div
            initial="hidden" animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
            style={{ flex: '0 0 340px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}
          >
            <motion.div variants={fadeLeft} transition={{ duration: 0.5 }}>
              <Mike state="idle" size={90} />
            </motion.div>

            {heroContent && (
              <motion.div variants={fadeLeft} transition={{ duration: 0.5 }} style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                {heroContent}
              </motion.div>
            )}

            {/* Game badge */}
            <motion.div variants={fadeLeft} transition={{ duration: 0.5 }} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(194,143,231,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={26} color="#c28fe7" />
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 22, fontWeight: 800 }}>{title}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>{axis} · {duration}</div>
              </div>
            </motion.div>

            {/* Goal */}
            <motion.div variants={fadeLeft} transition={{ duration: 0.5 }}
              style={{ width: '100%', background: 'rgba(194,143,231,0.08)', borderRadius: 14, padding: '14px 18px', border: '1px solid rgba(194,143,231,0.15)' }}>
              <div style={{ color: '#c28fe7', fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4 }}>Goal</div>
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 1.5 }}>{goal}</div>
            </motion.div>

            {/* Button */}
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }} style={{ position: 'relative', marginTop: 4 }}>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={handleReady}
                style={{ background: 'linear-gradient(135deg, #c28fe7, #9b59d0)', color: '#fff', border: 'none', borderRadius: 16, padding: '16px 56px', fontSize: 16, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', position: 'relative', zIndex: 2 }}>
                I'M READY
              </motion.button>
              <AnimatePresence>
                {particles.map((p) => {
                  const rad = (p.angle * Math.PI) / 180
                  return (
                    <motion.div key={p.id} initial={{ opacity: 1, x: 0, y: 0, scale: 1 }} animate={{ opacity: 0, x: Math.cos(rad) * 80, y: Math.sin(rad) * 80, scale: 0.3 }} transition={{ duration: 0.8, ease: 'easeOut' }}
                      style={{ position: 'absolute', top: '50%', left: '50%', width: 8, height: 8, borderRadius: '50%', background: '#c28fe7', pointerEvents: 'none', zIndex: 1 }} />
                  )
                })}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* RIGHT — Instructions side */}
          <motion.div
            initial="hidden" animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } } }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}
          >
            {/* How to Play */}
            <motion.div variants={fadeRight} transition={{ duration: 0.5 }}>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 }}>How to Play</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {steps.map((step, i) => (
                  <motion.div key={i} variants={fadeRight} transition={{ duration: 0.4 }} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(194,143,231,0.2)', color: '#c28fe7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1.5, paddingTop: 3 }}>{step}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Prompt card */}
            <motion.div variants={fadeRight} transition={{ duration: 0.5 }}
              style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', borderRadius: 16, padding: '18px 20px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ color: '#c28fe7', fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>{promptLabel}</div>
              <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15, lineHeight: 1.6 }}>{prompt}</div>
            </motion.div>

            {/* Tip */}
            <motion.div variants={fadeRight} transition={{ duration: 0.5 }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '12px 16px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Lightbulb size={18} color="#c28fe7" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.5 }}>{tip}</div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
