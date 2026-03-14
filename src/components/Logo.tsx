import { motion } from 'framer-motion'

export default function Logo({ size = 80 }: { size?: number }) {
  const r = size * 0.45
  return (
    <motion.div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'conic-gradient(from 0deg, #c28fe7, #d4aef0, #e4cdf4, #c28fe7)',
          opacity: 0.12,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />
      <div
        className="relative rounded-full bg-white flex items-center justify-center"
        style={{ width: size - 6, height: size - 6 }}
      >
        <svg width={r} height={r} viewBox="0 0 40 40" fill="none">
          <rect x="14" y="6" width="12" height="18" rx="6" fill="#c28fe7" />
          <path d="M10 20a10 10 0 0020 0" stroke="#c28fe7" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <line x1="20" y1="30" x2="20" y2="35" stroke="#c28fe7" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="15" y1="35" x2="25" y2="35" stroke="#c28fe7" strokeWidth="2.5" strokeLinecap="round" />
          <motion.path
            d="M33 13a8 8 0 010 14"
            stroke="#d4aef0"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            animate={{ opacity: [0, 0.8, 0], pathLength: [0, 1, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.path
            d="M7 13a8 8 0 000 14"
            stroke="#d4aef0"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            animate={{ opacity: [0, 0.8, 0], pathLength: [0, 1, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          />
        </svg>
      </div>
    </motion.div>
  )
}
