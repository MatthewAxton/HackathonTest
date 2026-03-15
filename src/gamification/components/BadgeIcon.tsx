import { Scan, Gamepad2, Calendar, Radio, Dumbbell, Flame, ShieldCheck, Trophy, Swords, Star, Crown, HelpCircle } from 'lucide-react'
import type { BadgeTier } from '../../analysis/types'

const ICON_MAP: Record<string, typeof Scan> = {
  Scan, Gamepad2, Calendar, Radio, Dumbbell, Flame, ShieldCheck, Trophy, Swords, Star, Crown,
}

const TIER_COLORS: Record<BadgeTier, { bg: string; border: string; icon: string; glow: string }> = {
  bronze:  { bg: 'rgba(205,127,50,0.12)',  border: 'rgba(205,127,50,0.35)',  icon: '#CD7F32', glow: 'rgba(205,127,50,0.2)' },
  silver:  { bg: 'rgba(192,192,192,0.12)',  border: 'rgba(192,192,192,0.35)', icon: '#C0C0C0', glow: 'rgba(192,192,192,0.2)' },
  gold:    { bg: 'rgba(255,215,0,0.12)',    border: 'rgba(255,215,0,0.35)',   icon: '#FFD700', glow: 'rgba(255,215,0,0.25)' },
  diamond: { bg: 'rgba(185,142,255,0.15)',  border: 'rgba(185,142,255,0.4)',  icon: '#B98EFF', glow: 'rgba(185,142,255,0.3)' },
}

const TIER_LABEL: Record<BadgeTier, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  diamond: 'Diamond',
}

interface BadgeIconProps {
  iconName: string
  tier: BadgeTier
  earned: boolean
  size?: number
}

export function BadgeIcon({ iconName, tier, earned, size = 28 }: BadgeIconProps) {
  const Icon = ICON_MAP[iconName] ?? HelpCircle
  const colors = TIER_COLORS[tier]

  return (
    <div style={{
      width: size + 20,
      height: size + 20,
      borderRadius: 14,
      background: earned ? colors.bg : 'rgba(255,255,255,0.03)',
      border: `1.5px solid ${earned ? colors.border : 'rgba(255,255,255,0.06)'}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: earned ? `0 0 16px ${colors.glow}` : 'none',
      opacity: earned ? 1 : 0.3,
      filter: earned ? 'none' : 'grayscale(1)',
      transition: 'all 0.2s',
    }}>
      <Icon size={size} color={earned ? colors.icon : 'rgba(255,255,255,0.3)'} strokeWidth={1.8} />
    </div>
  )
}

export { TIER_COLORS, TIER_LABEL }
