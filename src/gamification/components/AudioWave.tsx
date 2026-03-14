import { Mic } from 'lucide-react'

export function AudioWave() {
  const bars = 30
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '8px 16px' }}>
      <Mic size={16} color="var(--purple)" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 32 }}>
        {Array.from({ length: bars }).map((_, i) => (
          <div key={i} style={{
            width: 3, height: '100%', display: 'flex', alignItems: 'center',
          }}>
            <div style={{
              width: '100%',
              height: `${20 + Math.random() * 80}%`,
              background: 'var(--purple)',
              borderRadius: 2,
              opacity: 0.3 + Math.random() * 0.7,
              animation: `waveBar ${0.3 + Math.random() * 1.2}s ease-in-out infinite`,
              animationDelay: `${i * 0.05}s`,
            }} />
          </div>
        ))}
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--purple)' }}>LIVE</span>
    </div>
  )
}
