import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Crosshair, Eye, Activity, Waves, Shield, ArrowRight } from 'lucide-react'
import { TopBanner, BottomBanner } from '../components/Banner'
import { MikeWithBubble } from '../components/Mike'
import { RadarChart } from '../components/radar-chart'

const axes = [
  { name: 'Clarity', score: 42, icon: Crosshair, tip: 'You said "um" 6 times. Target: 0–2 per minute.' },
  { name: 'Confidence', score: 58, icon: Eye, tip: 'Eye contact dropped below 50% in the last 15 seconds.' },
  { name: 'Pacing', score: 61, icon: Activity, tip: 'Your pace spiked to 175 WPM mid-session.' },
  { name: 'Expression', score: 70, icon: Waves, tip: 'Good pitch variation. 12s of monotone detected.' },
  { name: 'Composure', score: 74, icon: Shield, tip: 'Steady posture. Minor hand fidgeting at 0:45.' },
]

export default function RadarResults() {
  const nav = useNavigate()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <TopBanner title={<>Speech<span style={{ color: 'var(--purple)' }}>MAX</span></>} showBack={false} right={<span style={{ fontSize: 13, opacity: 0.8 }}>Today, 2:41pm</span>} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ width: '100%', maxWidth: 1060, display: 'flex', gap: 56, padding: '8px 48px', alignItems: 'center' }}>
          <div style={{ width: 380, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <MikeWithBubble text="Here's your profile! Let's work on <strong style='color:var(--purple)'>Clarity</strong> first." state="talking" size={110} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '8px 0' }}>
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3 }} style={{ fontSize: 64, fontWeight: 900, lineHeight: 1, background: 'linear-gradient(135deg, #C28FE7, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>67</motion.span>
              <div><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>Speech<span style={{ color: 'var(--purple)' }}>MAX</span> Score</div><div style={{ display: 'inline-block', background: 'var(--surface)', color: 'var(--purple)', fontSize: 20, fontWeight: 800, padding: '4px 16px', borderRadius: 12, marginTop: 4 }}>B+</div></div>
            </div>
            <RadarChart
              scores={{ clarity: 42, confidence: 58, pacing: 61, expression: 70, composure: 74 }}
              size={320}
              animated={true}
            />
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--muted)', marginBottom: 14 }}>Per-Axis Breakdown</div>
            {axes.map((a, i) => (
              <motion.div key={a.name} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 + i*0.15 }} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--purple)' }}><a.icon size={14} /></div>
                  <span style={{ flex: 1, fontSize: 15, fontWeight: 700 }}>{a.name}</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--purple)' }}>{a.score}</span>
                </div>
                <div className="progress-track" style={{ marginBottom: 4 }}><motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${a.score}%` }} transition={{ duration: 1.2, delay: 0.5 + i*0.15 }} /></div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{a.tip}</div>
              </motion.div>
            ))}
            <button className="btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={() => nav('/queue')}>Start Training</button>
          </div>
        </div>
      </div>
      <BottomBanner left={<div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 14, padding: '8px 16px', fontSize: 13, fontWeight: 600 }}>Let's work on Clarity first!</div>} center={<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><div style={{ fontSize: 22, fontWeight: 800 }}>5 Games Ready</div><div style={{ fontSize: 11, fontWeight: 600, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.5 }}>Personalised for you</div></div>} right={<ArrowRight size={18} />} />
    </div>
  )
}
