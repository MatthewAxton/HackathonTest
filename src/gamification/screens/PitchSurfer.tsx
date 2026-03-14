import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, TrendingUp } from 'lucide-react'
import { TopBanner, BottomBanner } from '../components/Banner'
import { Mike } from '../components/Mike'
import { AudioWave } from '../components/AudioWave'
import { GraceCountdown } from '../components/GraceCountdown'

export default function PitchSurfer() {
  const nav = useNavigate()
  const [time, setTime] = useState(3)
  const [wavePath, setWavePath] = useState('')
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])

  useEffect(() => {
    const gen = () => {
      let d = 'M0,170'
      for (let x = 50; x <= 800; x += 50) { const y = 30 + Math.random() * 140; d += ` Q${x-25},${y} ${x},${60 + Math.random() * 100}` }
      d += ' L800,220 L0,220 Z'
      setWavePath(d)
    }
    gen()
    if (!ready) return
    const t = setInterval(() => {
      setTime(p => { if (p <= 1) { clearInterval(t); nav('/score/pitch'); return 0 } return p - 1 })
      gen()
    }, 1500)
    return () => clearInterval(t)
  }, [nav, ready])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {!ready && <GraceCountdown onReady={onReady} prompt="We need to talk about the quarterly results. The numbers show a significant improvement." promptLabel="Read With Expression" />}
      <TopBanner backTo="/queue" title="Pitch Surfer" center={<span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 16px', borderRadius: 12, fontSize: 15, fontWeight: 800 }}>0:{time.toString().padStart(2, '0')}</span>} right={<span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700 }}><Zap size={14} /> 410</span>} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ width: '100%', maxWidth: 960, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 40px' }}>
          <div style={{ width: '100%', maxWidth: 800, height: 220, position: 'relative', marginBottom: 12 }}>
            <svg width="100%" height="100%" viewBox="0 0 800 220" preserveAspectRatio="none">
              <defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(194,143,231,0.15)" /><stop offset="100%" stopColor="rgba(194,143,231,0.02)" /></linearGradient></defs>
              <motion.path d={wavePath} fill="url(#wg)" animate={{ d: wavePath }} transition={{ duration: 1 }} />
              <motion.path d={wavePath.replace(/ L800,220 L0,220 Z/, '')} fill="none" stroke="var(--purple)" strokeWidth={2.5} animate={{ d: wavePath.replace(/ L800,220 L0,220 Z/, '') }} transition={{ duration: 1 }} />
            </svg>
            <motion.div animate={{ y: [0, -12, 0, -6, 0], rotate: [0, 3, 0, -2, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }} style={{ position: 'absolute', top: 20, left: '52%', transform: 'translateX(-50%)' }}>
              <Mike state="talking" size={90} />
            </motion.div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green)', fontSize: 16, fontWeight: 700, marginBottom: 10 }}><TrendingUp size={18} /> HIGH VARIATION — Great!</div>
          <div className="card" style={{ width: '100%', maxWidth: 600, textAlign: 'center', padding: '18px 28px', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--muted)', marginBottom: 6 }}>Read With Expression</div>
            <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.4 }}>We need to talk about the quarterly results. The numbers show a significant improvement.</div>
          </div>
          <AudioWave />
        </div>
      </div>
      <BottomBanner left={<div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 14, padding: '8px 16px', fontSize: 13, fontWeight: 600 }}>Ride the wave! Great variation.</div>} center={<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><div style={{ fontSize: 22, fontWeight: 800, color: '#58CC02' }}>High</div><div style={{ fontSize: 11, fontWeight: 600, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.5 }}>Pitch Variation</div></div>} right={<><Zap size={14} /> 410</>} />
    </div>
  )
}
