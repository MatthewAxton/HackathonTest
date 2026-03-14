import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Activity, Eye } from 'lucide-react'
import { TopBanner, BottomBanner } from '../components/Banner'
import { MikeWithBubble } from '../components/Mike'
import { AudioWave } from '../components/AudioWave'
import { CameraFeed } from '../components/CameraFeed'

export default function RadarScan() {
  const nav = useNavigate()
  const [time, setTime] = useState(3)

  useEffect(() => {
    const t = setInterval(() => setTime(p => { if (p <= 1) { clearInterval(t); nav('/results'); return 0 } return p - 1 }), 1000)
    return () => clearInterval(t)
  }, [nav])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <TopBanner title="30-Second Scan" center={<span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 16px', borderRadius: 12, fontSize: 15, fontWeight: 800 }}>0:{time.toString().padStart(2, '0')}</span>} right={<span style={{ fontSize: 13, opacity: 0.8 }}>Analysing your speech...</span>} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ width: '100%', maxWidth: 960, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 40px' }}>
          <MikeWithBubble text="Just read naturally — I'm analysing everything." state="talking" size={90} />
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}
            style={{ width: '100%', maxWidth: 640, margin: '10px 0' }}>
            <CameraFeed
              style={{ height: 260 }}
              overlay={
                <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                  style={{ position: 'absolute', bottom: 12, right: 12, background: 'var(--purple)', color: 'white', fontSize: 18, fontWeight: 800, padding: '6px 16px', borderRadius: 12 }}>
                  0:{time.toString().padStart(2, '0')}
                </motion.div>
              }
            />
          </motion.div>
          <div className="card-surface" style={{ width: '100%', maxWidth: 640, textAlign: 'center', padding: '14px 28px', marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--muted)', marginBottom: 6 }}>Read This Passage Aloud</div>
            <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.6 }}>
              <span style={{ color: 'var(--muted)' }}>The most effective leaders are those who can communicate their vision clearly. </span>
              <span style={{ color: 'var(--purple)', fontWeight: 800 }}>They inspire action not through authority, </span>
              but through the power of their words and the confidence of their delivery.
            </div>
          </div>
          <AudioWave />
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <span style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '6px 14px', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><Activity size={14} color="var(--purple)" /> <span style={{ color: 'var(--purple)', fontWeight: 700 }}>142 WPM</span></span>
            <span style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '6px 14px', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><Eye size={14} color="var(--purple)" /> <span style={{ color: 'var(--purple)', fontWeight: 700 }}>78%</span></span>
          </div>
        </div>
      </div>
      <BottomBanner left={<div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 14, padding: '8px 16px', fontSize: 13, fontWeight: 600 }}>Scanning your profile...</div>} center={<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><div style={{ fontSize: 22, fontWeight: 800 }}>Scanning...</div><div style={{ fontSize: 11, fontWeight: 600, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.5 }}>Building your profile</div></div>} />
    </div>
  )
}
