import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, Presentation, MessageCircle, BookOpen, Camera, Mic, Brain } from 'lucide-react'
import { Mike, TalkingBubble } from '../components/Mike'
import { useSessionStore } from '../../store/sessionStore'
import { useScanStore } from '../../store/scanStore'
import type { UserGoal } from '../../analysis/types'

const ease = [0.25, 0.46, 0.45, 0.94] as const

const slideVariants = {
  enter: { x: 60, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -60, opacity: 0 },
}

const GOALS: { value: UserGoal; label: string; icon: typeof Briefcase; description: string }[] = [
  { value: 'interview', label: 'Job Interview', icon: Briefcase, description: 'Nail your next interview' },
  { value: 'presentation', label: 'Presentation', icon: Presentation, description: 'Command the room' },
  { value: 'casual', label: 'Casual Conversation', icon: MessageCircle, description: 'Speak with confidence' },
  { value: 'reading', label: 'Reading Aloud', icon: BookOpen, description: 'Improve expression & clarity' },
]

export default function Onboarding() {
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const [selectedGoal, setSelectedGoal] = useState<UserGoal | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const setUserGoal = useSessionStore((s) => s.setUserGoal)
  const existingGoal = useSessionStore((s) => s.userGoal)
  const hasScans = useScanStore((s) => s.scans.length > 0)

  // Skip onboarding if user already completed it (returning user)
  useEffect(() => {
    if (existingGoal) {
      nav(hasScans ? '/queue' : '/scan', { replace: true })
    }
  }, [existingGoal, hasScans, nav])

  // Countdown timer
  useEffect(() => {
    if (countdown === null) return
    if (countdown <= 0) {
      nav('/scan')
      return
    }
    const t = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown, nav])

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', position: 'relative',
    }}>
      {/* Step dots */}
      <div style={{ position: 'absolute', top: 32, display: 'flex', gap: 8 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 10, height: 10, borderRadius: '50%',
              background: i <= step ? 'var(--purple, #C28FE7)' : 'var(--border, #E5D5F7)',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Slide 1 — Mascot Introduction */}
        {step === 0 && (
          <motion.div
            key="slide-0"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: 400 }}
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Mike state="talking" size={120} />
            </motion.div>

            <div style={{ marginTop: 24, background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '2px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '20px 28px', fontSize: 17, fontWeight: 600, lineHeight: 1.6, color: 'var(--text, rgba(255,255,255,0.9))', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
              <TalkingBubble text="Hey! I'm <strong style='color:#C28FE7'>Mike</strong>, your AI speech coach. Let's figure out where you shine and where we can level up!" />
            </div>

            {/* What to expect */}
            <div style={{ marginTop: 20, display: 'flex', gap: 12, width: '100%', maxWidth: 380 }}>
              {[
                { icon: Mic, label: '30s speech scan' },
                { icon: Brain, label: '5 axis analysis' },
                { icon: Camera, label: 'Camera + mic' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 14, padding: '12px 8px',
                }}>
                  <Icon size={18} color="#C28FE7" />
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>{label}</span>
                </div>
              ))}
            </div>

            <button
              className="btn-primary"
              style={{ marginTop: 24, width: '100%', maxWidth: 320 }}
              onClick={() => setStep(1)}
            >
              Let's Go
            </button>
          </motion.div>
        )}

        {/* Slide 2 — Goal Selection */}
        {step === 1 && (
          <motion.div
            key="slide-1"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: 440 }}
          >
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text, rgba(255,255,255,0.9))', marginBottom: 6 }}>
              What are you practicing for?
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--muted, rgba(255,255,255,0.4))', marginBottom: 24 }}>
              This helps me tailor your prompts and coaching
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%' }}>
              {GOALS.map(({ value, label, icon: Icon, description }) => {
                const isSelected = selectedGoal === value
                return (
                  <motion.button
                    key={value}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedGoal(value)}
                    style={{
                      background: isSelected ? 'rgba(194,143,231,0.15)' : 'rgba(255,255,255,0.06)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: `2px solid ${isSelected ? '#C28FE7' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 16,
                      padding: '20px 16px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'border-color 0.2s, background 0.2s',
                    }}
                  >
                    <Icon size={28} style={{ color: isSelected ? '#C28FE7' : 'rgba(255,255,255,0.5)' }} />
                    <div style={{ fontSize: 15, fontWeight: 700, color: isSelected ? '#C28FE7' : 'rgba(255,255,255,0.9)' }}>{label}</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.4)', lineHeight: 1.3 }}>{description}</div>
                  </motion.button>
                )
              })}
            </div>

            <button
              className="btn-primary"
              style={{ marginTop: 28, width: '100%', maxWidth: 320, opacity: selectedGoal ? 1 : 0.4, pointerEvents: selectedGoal ? 'auto' : 'none' }}
              onClick={() => {
                if (selectedGoal) {
                  setUserGoal(selectedGoal)
                  setStep(2)
                }
              }}
            >
              Next
            </button>
          </motion.div>
        )}

        {/* Slide 3 — Camera Permission + Countdown */}
        {step === 2 && (
          <motion.div
            key="slide-2"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: 400 }}
          >
            {countdown !== null ? (
              /* Countdown overlay */
              <motion.div
                key="countdown"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
              >
                <Mike state="talking" size={100} />
                <motion.div
                  key={countdown}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  style={{
                    width: 120, height: 120, borderRadius: '50%',
                    background: 'rgba(194,143,231,0.15)', border: '3px solid #C28FE7',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: countdown > 0 ? 56 : 28, fontWeight: 900, color: '#C28FE7',
                  }}
                >
                  {countdown > 0 ? countdown : 'GO!'}
                </motion.div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>
                  Starting your scan...
                </div>
              </motion.div>
            ) : (
              /* Ready screen */
              <>
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Mike state="talking" size={100} />
                </motion.div>

                <div style={{ marginTop: 20, background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '2px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '18px 24px', fontSize: 18, fontWeight: 700, lineHeight: 1.5, color: 'var(--text, rgba(255,255,255,0.9))', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                  <TalkingBubble text="I need to <strong style='color:#C28FE7'>see and hear</strong> you. Ready?" />
                </div>

                {/* What happens next */}
                <div style={{
                  marginTop: 16, width: '100%', maxWidth: 340,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 16, padding: '16px 20px',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>What happens next</div>
                  {[
                    'Your browser will ask for camera & mic permission',
                    'Speak about a topic for 30 seconds',
                    'Get your personalized speech radar chart',
                  ].map((text, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: i < 2 ? 8 : 0 }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                        background: 'rgba(194,143,231,0.15)', border: '1px solid rgba(194,143,231,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 800, color: '#C28FE7',
                      }}>{i + 1}</div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>{text}</span>
                    </div>
                  ))}
                </div>

                <button
                  className="btn-primary"
                  style={{ marginTop: 20, width: '100%', maxWidth: 320 }}
                  onClick={() => setCountdown(3)}
                >
                  Start My Scan
                </button>

                <div style={{ marginTop: 10, fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>
                  All analysis runs locally — we never store your video or audio
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
