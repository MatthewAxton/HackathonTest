import { motion } from 'framer-motion'
import { LiquidGlassPill } from 'anam-react-liquid-glass'
import BackgroundWaves from '../components/BackgroundWaves'

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.4 } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } },
}

const fade = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function Splash({ onNext }: { onNext: () => void }) {
  return (
    <motion.div
      className="w-full h-full flex flex-col items-center select-none px-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #12101a 50%, #0e0c14 100%)' }}
      variants={stagger}
      initial="hidden"
      animate="show"
      exit="exit"
    >
      <BackgroundWaves />

      {/* Top: Title */}
      <motion.div variants={fade} className="z-10 mt-16 mb-auto">
        <h1 className="text-[72px] font-bold tracking-tight text-center" style={{ color: '#f5f5f5' }}>
          Speech<span style={{ color: '#c28fe7' }}>MAX</span>
        </h1>
      </motion.div>

      {/* Center: Mascot + speech bubble */}
      <div className="z-10 flex flex-col items-center">
        <motion.div variants={fade} className="relative mb-3">
          <div className="glass px-6 py-3 rounded-2xl shadow-sm">
            <span className="text-[15px] font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Let's get you speaking!
            </span>
          </div>
          <div
            className="absolute left-1/2 -translate-x-1/2 -bottom-[6px] w-0 h-0"
            style={{ borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '7px solid rgba(194,143,231,0.12)' }}
          />
        </motion.div>

        <motion.div variants={fade}>
          <motion.img
            src="/IDLE.gif"
            alt="SpeechMAX mascot"
            className="w-64 h-64 object-contain drop-shadow-lg"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>

      {/* Bottom: Buttons */}
      <div className="z-10 mt-auto mb-12 w-full max-w-[320px] flex flex-col items-center">
        <motion.div variants={fade} className="w-full">
          <LiquidGlassPill
            onClick={onNext}
            tiltMax={4}
            shineSize={240}
            borderRadius="18px"
            style={{ background: '#c28fe7', width: '100%' }}
          >
            <div className="py-4 text-[16px] font-bold text-white text-center w-full cursor-pointer tracking-wide">
              START PRACTICING
            </div>
          </LiquidGlassPill>
        </motion.div>

        <motion.div variants={fade} className="w-full mt-3">
          <LiquidGlassPill
            tiltMax={3}
            shineSize={200}
            borderRadius="18px"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', width: '100%' }}
          >
            <div className="py-4 text-[14px] font-semibold text-center w-full cursor-pointer" style={{ color: 'rgba(255,255,255,0.5)' }}>
              I ALREADY HAVE AN ACCOUNT
            </div>
          </LiquidGlassPill>
        </motion.div>
      </div>
    </motion.div>
  )
}
