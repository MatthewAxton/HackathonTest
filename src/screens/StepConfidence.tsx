import { useState } from 'react'
import { motion } from 'framer-motion'
import ProgressBar from '../components/ProgressBar'
import OptionCard from '../components/OptionCard'
import ContinueButton from '../components/ContinueButton'

const OPTIONS = [
  { emoji: '😰', title: 'Very nervous', desc: 'I avoid speaking whenever I can' },
  { emoji: '😅', title: 'Somewhat nervous', desc: 'I can do it but it stresses me out' },
  { emoji: '🙂', title: 'Fairly comfortable', desc: "I'm okay but want to improve" },
  { emoji: '😎', title: 'Very confident', desc: 'I want to go from good to great' },
]

interface Props { onNext: () => void; onBack: () => void; progress: number }

export default function StepConfidence({ onNext, onBack, progress }: Props) {
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <motion.div
      className="w-full max-w-[380px] mx-auto px-6 flex flex-col select-none"
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <ProgressBar progress={progress} onBack={onBack} />

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-[28px] font-bold text-text-primary tracking-tight leading-tight mb-2"
      >
        How confident are you?
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-[15px] text-text-secondary mb-7"
      >
        Be honest — there's no wrong answer
      </motion.p>

      <div className="flex flex-col gap-2.5 mb-8">
        {OPTIONS.map((opt, i) => (
          <OptionCard
            key={opt.title}
            emoji={opt.emoji}
            title={opt.title}
            description={opt.desc}
            selected={selected === i}
            onClick={() => setSelected(i)}
            delay={0.1 + i * 0.04}
          />
        ))}
      </div>

      <ContinueButton onClick={onNext} disabled={selected === null} />
    </motion.div>
  )
}
