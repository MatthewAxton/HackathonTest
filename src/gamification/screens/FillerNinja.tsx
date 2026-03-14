import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, X } from 'lucide-react'
import { TopBanner, BottomBanner } from '../components/Banner'
import { AudioWave } from '../components/AudioWave'
import { GraceCountdown } from '../components/GraceCountdown'

export default function FillerNinja() {
  const nav = useNavigate()
  const [time, setTime] = useState(3)
  const [streak, setStreak] = useState(0)
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])

  useEffect(() => {
    if (!ready) return
    const t = setInterval(() => {
      setTime(p => { if (p <= 1) { clearInterval(t); nav('/score/filler'); return 0 } return p - 1 })
      setStreak(p => p + 1)
    }, 1000)
    return () => clearInterval(t)
  }, [nav, ready])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {!ready && <GraceCountdown onReady={onReady} prompt="Describe a time you solved a difficult problem at work." promptLabel="Interview — Professional" />}
      <TopBanner backTo="/queue" title="Filler Ninja"
        center={<><span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 16px', borderRadius: 12, fontSize: 15, fontWeight: 800 }}>0:{time.toString().padStart(2, '0')}</span><div style={{ width: 160, height: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden' }}><motion.div animate={{ width: `${((3-time)/3)*100}%` }} style={{ height: '100%', background: 'white', borderRadius: 4 }} /></div></>}
        right={<span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700 }}><Zap size={14} /> 340</span>} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ width: '100%', maxWidth: 960, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 40px' }}>
          <div className="card" style={{ width: '100%', maxWidth: 600, textAlign: 'center', marginBottom: 12, padding: '20px 28px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--muted)', marginBottom: 8 }}>Interview — Professional</div>
            <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.4 }}>Describe a time you solved a difficult problem at work.</div>
          </div>
          <div style={{ maxWidth: 520, textAlign: 'center', fontSize: 16, fontWeight: 500, color: 'var(--muted)', lineHeight: 1.8, marginBottom: 12 }}>
            The biggest challenge I faced was when our database migration <span style={{ color: 'var(--red)', textDecoration: 'line-through', fontWeight: 700 }}>um</span> failed during peak hours and I had to coordinate with three teams to <span style={{ color: 'var(--red)', textDecoration: 'line-through', fontWeight: 700 }}>like</span> roll everything back safely...
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
            <motion.span animate={{ rotate: [0, -2, 2, -1, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }} style={{ background: 'var(--red)', color: 'white', fontSize: 14, fontWeight: 700, padding: '8px 18px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 6 }}><X size={14} /> um</motion.span>
            <motion.span animate={{ rotate: [0, -2, 2, -1, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay: 0.5 }} style={{ background: 'var(--red)', color: 'white', fontSize: 14, fontWeight: 700, padding: '8px 18px', borderRadius: 16, opacity: 0.4, textDecoration: 'line-through', display: 'flex', alignItems: 'center', gap: 6 }}><X size={14} /> like</motion.span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <motion.div key={streak} initial={{ scale: 1.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }} style={{ fontSize: 52, fontWeight: 800, lineHeight: 1, background: 'linear-gradient(135deg, #C28FE7, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{streak}</motion.div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>seconds filler-free</div>
          </div>
          <div style={{ marginTop: 16 }}><AudioWave /></div>
        </div>
      </div>
      <BottomBanner left={<div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 14, padding: '8px 16px', fontSize: 13, fontWeight: 600 }}>Keep going! You're on a streak.</div>} center={<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><div style={{ fontSize: 22, fontWeight: 800 }}>{streak}s Streak</div><div style={{ fontSize: 11, fontWeight: 600, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.5 }}>Filler-Free</div></div>} right={<><Zap size={14} /> Score: 340</>} />
    </div>
  )
}
