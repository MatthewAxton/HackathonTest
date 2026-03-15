import { motion } from 'framer-motion'

interface Props {
  progress: number
  onBack: () => void
}

export default function ProgressBar({ progress, onBack }: Props) {
  return (
    <div className="w-full flex items-center gap-3 mb-10">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onBack}
        className="w-9 h-9 rounded-full flex items-center justify-center text-text-tertiary hover:bg-surface transition-colors cursor-pointer bg-transparent border-none"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.button>
      <div className="flex-1 h-2 bg-primary-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
        />
      </div>
    </div>
  )
}
