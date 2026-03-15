import { useState } from 'react'
import { motion } from 'framer-motion'
import ProgressBar from '../components/ProgressBar'
import ContinueButton from '../components/ContinueButton'

const GOALS = [
  { emoji: '🌱', label: 'Casual', time: '2 min / day' },
  { emoji: '📘', label: 'Regular', time: '5 min / day' },
  { emoji: '🔥', label: 'Serious', time: '10 min / day' },
  { emoji: '🚀', label: 'Intense', time: '15 min / day' },
]

interface Props { onNext: () => void; onBack: () => void; progress: number }

export default function StepDailyGoal({ onNext, onBack, progress }: Props) {
  const [selected, setSelected] = useState<number | null>(1)

  return (
    <motion.div
      className="w-full max-w-[380px] mx-auto px-6 flex flex-col select-none"
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
    >
      <ProgressBar progress={progress} onBack={onBack} />

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-[28px] font-bold text-text-primary tracking-tight leading-tight mb-2"
      >
        Your daily goal
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-[15px] text-text-secondary mb-8"
      >
        Consistency beats intensity. Even 2 minutes helps.
      </motion.p>

      <div className="flex flex-col gap-3 mb-6">
        {GOALS.map((g, i) => (
          <motion.button
            key={g.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + i * 0.05, duration: 0.35 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelected(i)}
            className={`
              w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 bg-white
              ${selected === i
                ? 'border-green-500 bg-green-50 shadow-[0_0_0_3px_rgba(34,197,94,0.08)]'
                : 'border-border hover:border-green-300'
              }
            `}
          >
            <span className="text-2xl">{g.emoji}</span>
            <div className="text-left flex-1">
              <div className={`text-[16px] font-semibold ${selected === i ? 'text-green-800' : 'text-text-primary'}`}>
                {g.label}
              </div>
              <div className="text-[13px] text-text-secondary">{g.time}</div>
            </div>
            {selected === i && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7.5L5.5 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Insight nudge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full px-4 py-3 rounded-2xl bg-green-50 border border-green-200 mb-8"
      >
        <p className="text-[13px] text-green-700 font-medium text-center leading-snug">
          Users who practice 5 min/day see measurable improvement in 2&nbsp;weeks
        </p>
      </motion.div>

      <ContinueButton onClick={onNext} disabled={selected === null} />
    </motion.div>
  )
}
