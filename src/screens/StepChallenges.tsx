import { useState } from 'react'
import { motion } from 'framer-motion'
import ProgressBar from '../components/ProgressBar'
import OptionCard from '../components/OptionCard'
import ContinueButton from '../components/ContinueButton'

const OPTIONS = [
  { emoji: '😶', title: 'Filler words', desc: '"Um", "like", "you know", "basically"' },
  { emoji: '👀', title: 'Eye contact', desc: 'I look away or stare at my notes' },
  { emoji: '😨', title: 'Nervousness', desc: 'My voice shakes or I freeze up' },
  { emoji: '🏃', title: 'Speaking too fast', desc: 'I rush and lose the audience' },
  { emoji: '🗂️', title: 'Losing structure', desc: 'I ramble or go off on tangents' },
  { emoji: '😐', title: 'Monotone delivery', desc: 'My voice sounds flat' },
]

interface Props { onNext: () => void; onBack: () => void; progress: number }

export default function StepChallenges({ onNext, onBack, progress }: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set())

  function toggle(i: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

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
        What's hardest for you?
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-[15px] text-text-secondary mb-7"
      >
        Pick all that apply — we'll target these
      </motion.p>

      <div className="flex flex-col gap-2.5 mb-8">
        {OPTIONS.map((opt, i) => (
          <OptionCard
            key={opt.title}
            icon={opt.emoji}
            title={opt.title}
            description={opt.desc}
            selected={selected.has(i)}
            onClick={() => toggle(i)}
            delay={0.1 + i * 0.04}
          />
        ))}
      </div>

      <ContinueButton onClick={onNext} disabled={selected.size === 0} />
    </motion.div>
  )
}
