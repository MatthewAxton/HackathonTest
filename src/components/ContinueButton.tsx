import { motion } from 'framer-motion'

interface Props {
  onClick: () => void
  disabled?: boolean
  label?: string
}

export default function ContinueButton({ onClick, disabled = false, label = 'Continue' }: Props) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      whileHover={disabled ? {} : { scale: 1.015 }}
      whileTap={disabled ? {} : { scale: 0.985 }}
      onClick={disabled ? undefined : onClick}
      className={`
        w-full py-4 rounded-2xl text-[16px] font-semibold tracking-wide cursor-pointer transition-all duration-200 border-none
        ${disabled
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : 'bg-primary text-white hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/20'
        }
      `}
    >
      {label}
    </motion.button>
  )
}
