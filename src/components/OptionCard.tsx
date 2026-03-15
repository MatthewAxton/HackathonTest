import { motion } from 'framer-motion'

interface Props {
  icon: React.ReactNode
  title: string
  description: string
  selected: boolean
  onClick: () => void
  delay?: number
}

export default function OptionCard({ icon, title, description, selected, onClick, delay = 0 }: Props) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left cursor-pointer transition-all duration-200 bg-white
        ${selected
          ? 'border-primary bg-primary-50 shadow-[0_0_0_3px_rgba(194,143,231,0.1)]'
          : 'border-border hover:border-primary-light hover:bg-primary-50/30'
        }
      `}
    >
      <div className={`
        w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200
        ${selected ? 'bg-primary-100 text-primary-dark' : 'bg-surface text-text-secondary'}
      `}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className={`text-[15px] font-semibold transition-colors ${selected ? 'text-primary-900' : 'text-text-primary'}`}>
          {title}
        </div>
        <div className="text-[13px] text-text-secondary mt-0.5 leading-snug">{description}</div>
      </div>
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="ml-auto shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7.5L5.5 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
      )}
    </motion.button>
  )
}
