import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { TopBanner, BottomBanner } from '../components/Banner'
import { AudioWave } from '../components/AudioWave'
import { GraceCountdown } from '../components/GraceCountdown'
import { CameraFeed } from '../components/CameraFeed'

export default function StatueMode() {
  const nav = useNavigate()
  const [time, setTime] = useState(3)
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])
  useEffect(() => { if (!ready) return; const t = setInterval(() => setTime(p => { if (p <= 1) { clearInterval(t); nav('/score/statue'); return 0 } return p - 1 }), 1000); return () => clearInterval(t) }, [nav, ready])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {!ready && <GraceCountdown onReady={onReady} prompt="Present your biggest achievement. Stay composed." promptLabel="Composure Challenge" />}
      <TopBanner backTo="/queue" title="Statue Mode" center={<span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 16px', borderRadius: 12, fontSize: 15, fontWeight: 800 }}>0:{time.toString().padStart(2, '0')}</span>} right={<span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700 }}><Zap size={14} /> 290</span>} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ width: '100%', maxWidth: 960, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 40px' }}>
          <div style={{ width: '100%', maxWidth: 640, marginBottom: 10, boxShadow: '0 4px 20px rgba(194,143,231,0.08)', borderRadius: 20 }}>
            <CameraFeed
              style={{ height: 300 }}
              overlay={
                <svg style={{ position: 'absolute', inset: 30, pointerEvents: 'none' }} viewBox="0 0 580 300">
                  <rect x={230} y={5} width={120} height={70} rx={8} fill="rgba(88,204,2,0.06)" stroke="var(--green)" strokeWidth={1} strokeDasharray={4} /><text x={290} y={84} textAnchor="middle" fontFamily="Nunito" fontSize={10} fontWeight={600} fill="var(--green)">Head: Stable</text>
                  <rect x={200} y={90} width={180} height={50} rx={8} fill="rgba(88,204,2,0.06)" stroke="var(--green)" strokeWidth={1} strokeDasharray={4} /><text x={290} y={150} textAnchor="middle" fontFamily="Nunito" fontSize={10} fontWeight={600} fill="var(--green)">Shoulders: Stable</text>
                  <rect x={120} y={140} width={100} height={70} rx={8} fill="rgba(255,75,75,0.06)" stroke="var(--red)" strokeWidth={1} strokeDasharray={4} /><text x={170} y={220} textAnchor="middle" fontFamily="Nunito" fontSize={10} fontWeight={600} fill="var(--red)">Left Hand: Moving</text>
                  <line x1={290} y1={40} x2={290} y2={110} stroke="var(--purple)" strokeWidth={2} opacity={0.4} />
                  <line x1={290} y1={110} x2={230} y2={160} stroke="var(--purple)" strokeWidth={2} opacity={0.4} />
                  <line x1={290} y1={110} x2={350} y2={160} stroke="var(--purple)" strokeWidth={2} opacity={0.4} />
                  <line x1={230} y1={160} x2={170} y2={180} stroke="var(--red)" strokeWidth={2} opacity={0.5} />
                  <line x1={350} y1={160} x2={405} y2={180} stroke="var(--purple)" strokeWidth={2} opacity={0.4} />
                </svg>
              }
            />
          </div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--green)' }} /> Stable</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--red)' }} /> Moving</span>
          </div>
          <div className="card" style={{ width: '100%', maxWidth: 600, textAlign: 'center', padding: '14px 28px', marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--muted)', marginBottom: 6 }}>Composure Challenge</div>
            <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.4 }}>Present your biggest achievement. Stay composed.</div>
          </div>
          <AudioWave />
        </div>
      </div>
      <BottomBanner left={<div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 14, padding: '8px 16px', fontSize: 13, fontWeight: 600 }}>Arms moving too much. Try to stay still.</div>} center={<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><div style={{ fontSize: 22, fontWeight: 800 }}>72</div><div style={{ fontSize: 11, fontWeight: 600, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.5 }}>Composure Score</div></div>} right={<><Zap size={14} /> 290</>} />
    </div>
  )
}
