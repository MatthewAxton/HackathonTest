import { motion } from 'framer-motion'
import Logo from '../components/Logo'

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } },
}

const fade = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
}

export default function StepReady({ onBack }: { onBack: () => void }) {
  return (
    <motion.div
      className="w-full max-w-[380px] mx-auto px-6 flex flex-col items-center text-center select-none"
      variants={stagger}
      initial="hidden"
      animate="show"
      exit="exit"
    >
      {/* Back */}
      <motion.div variants={fade} className="w-full flex mb-6">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center text-text-tertiary hover:bg-surface transition-colors cursor-pointer bg-transparent border-none"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.button>
      </motion.div>

      {/* Celebration */}
      <motion.div
        variants={fade}
        className="mb-6"
      >
        <motion.div
          animate={{ scale: [1, 1.08, 1], rotate: [0, 2, -2, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Logo size={88} />
        </motion.div>
      </motion.div>

      <motion.h1 variants={fade} className="text-[28px] font-bold text-text-primary tracking-tight mb-2">
        You're all set!
      </motion.h1>
      <motion.p variants={fade} className="text-[15px] text-text-secondary mb-8 max-w-[280px] leading-relaxed">
        Your personalized plan is ready. Let's start with your first session.
      </motion.p>

      {/* Plan summary */}
      <motion.div variants={fade} className="w-full flex flex-col gap-2.5 mb-8">
        {[
          { icon: '🎯', label: 'Goal', value: 'Job Interviews' },
          { icon: '📊', label: 'Level', value: 'Somewhat nervous' },
          { icon: '🎯', label: 'Focus', value: 'Filler words, Eye contact' },
          { icon: '⏱️', label: 'Daily', value: '5 min / day' },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3.5 px-4 py-3.5 bg-green-50 rounded-2xl border border-green-100"
          >
            <span className="text-lg">{item.icon}</span>
            <div className="text-left">
              <div className="text-[11px] font-semibold text-green-600 uppercase tracking-wider">{item.label}</div>
              <div className="text-[14px] font-medium text-text-primary">{item.value}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.button
        variants={fade}
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        className="w-full py-4 rounded-2xl bg-green-500 text-white text-[17px] font-semibold cursor-pointer border-none hover:bg-green-600 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-200"
      >
        Start First Session
      </motion.button>

      <motion.p variants={fade} className="mt-4 text-[13px] text-text-tertiary">
        Takes about 2 minutes
      </motion.p>
    </motion.div>
  )
}
