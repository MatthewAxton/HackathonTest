import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, Presentation, MessageCircle, BookOpen } from 'lucide-react'
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
              <TalkingBubble text="Hey! I'm <strong style='color:#C28FE7'>Mike</strong>, your speech coach. I'm going to listen to you speak for 30 seconds and figure out how to help you improve." />
            </div>

            <button
              className="btn-primary"
              style={{ marginTop: 32, width: '100%', maxWidth: 320 }}
              onClick={() => setStep(1)}
            >
              Next
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

                <button
                  className="btn-primary"
                  style={{ marginTop: 32, width: '100%', maxWidth: 320 }}
                  onClick={() => setCountdown(3)}
                >
                  Start My Scan
                </button>

                <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted, #777)', fontWeight: 500 }}>
                  We never store your video or audio
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
