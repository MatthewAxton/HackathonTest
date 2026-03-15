import { useState } from 'react'
import { motion } from 'framer-motion'
import { LiquidGlassPill } from 'anam-react-liquid-glass'
import BackgroundWaves from '../components/BackgroundWaves'

const OPTIONS = [
  { title: 'Job Interview', desc: 'Practice behavioral questions with AI feedback' },
  { title: 'Presentation', desc: 'Deliver a pitch or talk to an audience' },
  { title: 'Freestyle', desc: 'Speak freely on any topic' },
  { title: 'Reading Aloud', desc: 'Practice clarity and pacing' },
]

interface Props { onNext: () => void; onBack: () => void }

export default function StepGoal({ onNext, onBack }: Props) {
  const [selected, setSelected] = useState<number>(0)

  return (
    <motion.div
      className="w-full h-full flex flex-col select-none relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #12101a 50%, #0e0c14 100%)' }}
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
    >
      <BackgroundWaves />

      {/* Top: mascot + speech bubble */}
      <div className="relative z-10 px-6 pt-10 pb-4 max-w-[480px] mx-auto w-full">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer bg-transparent border-none mb-6"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="#aeaeb2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.button>

        <div className="flex items-start gap-3 mb-6">
          <motion.img
            src="/TALKING_1.gif"
            alt="mascot"
            className="w-24 h-24 object-contain shrink-0 drop-shadow-md"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
          />
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <div className="glass px-5 py-3 rounded-2xl shadow-sm">
              <span className="text-[15px] font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
                What would you like to practice?
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Options */}
      <div className="relative z-10 flex-1 px-6 flex flex-col gap-3 max-w-[480px] mx-auto w-full">
        {OPTIONS.map((opt, i) => (
          <motion.button
            key={opt.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.35 }}
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelected(i)}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left cursor-pointer transition-all duration-200 shadow-sm"
            style={{
              background: selected === i ? 'rgba(194,143,231,0.1)' : 'rgba(255,255,255,0.04)',
              border: selected === i ? '1.5px solid rgba(194,143,231,0.4)' : '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="flex items-end gap-[3px] shrink-0">
              {[0, 1, 2].map((bar) => (
                <div
                  key={bar}
                  className="w-[5px] rounded-sm transition-colors duration-200"
                  style={{
                    height: 8 + bar * 5,
                    background: selected === i ? '#c28fe7' : 'rgba(255,255,255,0.2)',
                  }}
                />
              ))}
            </div>
            <div>
              <div className="text-[15px] font-semibold transition-colors duration-200" style={{ color: selected === i ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)' }}>
                {opt.title}
              </div>
              <div className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {opt.desc}
              </div>
            </div>
            {selected === i && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-auto shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: '#c28fe7' }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7.5L5.5 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {/* CTA */}
      <div className="relative z-10 px-6 py-8 max-w-[480px] mx-auto w-full">
        <LiquidGlassPill
          onClick={onNext}
          tiltMax={4}
          shineSize={240}
          borderRadius="18px"
          style={{ background: '#c28fe7', width: '100%' }}
        >
          <div className="py-4 text-[16px] font-bold text-white text-center w-full cursor-pointer tracking-wide">
            START SESSION
          </div>
        </LiquidGlassPill>
      </div>
    </motion.div>
  )
}
