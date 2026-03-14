import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface TopBannerProps {
  title: React.ReactNode
  center?: React.ReactNode
  right?: React.ReactNode
  showBack?: boolean
  backTo?: string
}

export function TopBanner({ title, center, right, showBack = true, backTo }: TopBannerProps) {
  const nav = useNavigate()
  return (
    <div className="gradient-banner" style={{
      height: 52, minHeight: 52, maxHeight: 52,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 180 }}>
        {showBack && <ArrowLeft size={18} style={{ opacity: 0.8, cursor: 'pointer' }} onClick={() => backTo ? nav(backTo) : nav(-1)} />}
        <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: 0.3 }}>{title}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flex: 1 }}>{center}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, minWidth: 180 }}>{right}</div>
    </div>
  )
}

interface BottomBannerProps {
  left?: React.ReactNode
  center?: React.ReactNode
  right?: React.ReactNode
}

export function BottomBanner({ left, center, right }: BottomBannerProps) {
  return (
    <div className="gradient-banner" style={{
      height: 60, minHeight: 60, maxHeight: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 200 }}>{left}</div>
      <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>{center}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, fontSize: 14, fontWeight: 700, minWidth: 120 }}>{right}</div>
    </div>
  )
}
