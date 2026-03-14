import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Lock } from 'lucide-react'
import { TopBanner, BottomBanner } from '../components/Banner'
import { AudioWave } from '../components/AudioWave'
import { GraceCountdown } from '../components/GraceCountdown'
import { CameraFeed } from '../components/CameraFeed'

export default function EyeLock() {
  const nav = useNavigate()
  const [time, setTime] = useState(3)
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])
  useEffect(() => { if (!ready) return; const t = setInterval(() => setTime(p => { if (p <= 1) { clearInterval(t); nav('/score/eyelock'); return 0 } return p - 1 }), 1000); return () => clearInterval(t) }, [nav, ready])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {!ready && <GraceCountdown onReady={onReady} prompt="What's your greatest professional strength?" promptLabel="Behavioral Question" />}
      <TopBanner backTo="/queue" title="Eye Lock" center={<span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 16px', borderRadius: 12, fontSize: 15, fontWeight: 800 }}>0:{time.toString().padStart(2, '0')}</span>} right={<span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700 }}><Zap size={14} /> 280</span>} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ width: '100%', maxWidth: 960, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 40px' }}>
          <div style={{ width: '100%', maxWidth: 640, marginBottom: 10, boxShadow: '0 0 0 4px rgba(88,204,2,0.3), 0 4px 20px rgba(194,143,231,0.08)', borderRadius: 20 }}>
            <CameraFeed
              style={{ height: 300 }}
              overlay={
                <motion.div animate={{ scale: [1, 1.2, 1], boxShadow: ['0 0 0 6px rgba(88,204,2,0.3)', '0 0 0 12px rgba(88,204,2,0.1)', '0 0 0 6px rgba(88,204,2,0.3)'] }} transition={{ repeat: Infinity, duration: 3 }} style={{ position: 'absolute', top: 20, right: 20, width: 28, height: 28, borderRadius: '50%', background: 'var(--green)' }} />
              }
            />
          </div>
          <div className="card" style={{ width: '100%', maxWidth: 600, textAlign: 'center', padding: '18px 28px', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--muted)', marginBottom: 6 }}>Behavioral Question</div>
            <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.4 }}>What's your greatest professional strength?</div>
          </div>
          <AudioWave />
        </div>
      </div>
      <BottomBanner left={<div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 14, padding: '8px 16px', fontSize: 13, fontWeight: 600 }}>Great eye contact! Stay locked in.</div>} center={<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><motion.div key={time} initial={{ scale: 1.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }} style={{ fontSize: 22, fontWeight: 800, color: '#58CC02' }}>87% Locked</motion.div><div style={{ fontSize: 11, fontWeight: 600, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.5 }}>Gaze Score</div></div>} right={<><Lock size={16} /> Locked</>} />
    </div>
  )
}
