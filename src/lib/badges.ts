import type { BadgeDef } from '../analysis/types'

const BADGES: BadgeDef[] = [
  // Bronze tier — getting started
  {
    id: 'first-scan',
    name: 'First Scan',
    description: 'Complete your first 30-second scan.',
    icon: 'Scan',
    tier: 'bronze',
    check: (ctx) => ctx.totalScans >= 1,
  },
  {
    id: 'first-game',
    name: 'First Game',
    description: 'Play your first mini-game.',
    icon: 'Gamepad2',
    tier: 'bronze',
    check: (ctx) => ctx.totalGames >= 1,
  },
  {
    id: '3-day-streak',
    name: 'Getting Started',
    description: 'Practice 3 days in a row.',
    icon: 'Calendar',
    tier: 'bronze',
    check: (ctx) => ctx.streakDays >= 3,
  },

  // Silver tier — building consistency
  {
    id: '5-scans',
    name: 'Scanner Pro',
    description: 'Complete 5 speech scans.',
    icon: 'Radio',
    tier: 'silver',
    check: (ctx) => ctx.totalScans >= 5,
  },
  {
    id: '10-games',
    name: 'Game Grinder',
    description: 'Play 10 games total.',
    icon: 'Dumbbell',
    tier: 'silver',
    check: (ctx) => ctx.totalGames >= 10,
  },
  {
    id: '7-day-streak',
    name: '7-Day Streak',
    description: 'Practice 7 days in a row.',
    icon: 'Flame',
    tier: 'silver',
    check: (ctx) => ctx.streakDays >= 7,
  },
  {
    id: 'filler-free-minute',
    name: 'Filler-Free Minute',
    description: 'Go 60 seconds without a filler word.',
    icon: 'ShieldCheck',
    tier: 'silver',
    check: (ctx) => ctx.longestFillerFreeStreak >= 60,
  },

  // Gold tier — mastery
  {
    id: 'all-games',
    name: 'Full Circuit',
    description: 'Play all 5 games at least once.',
    icon: 'Trophy',
    tier: 'gold',
    check: (ctx) => {
      const games = ['filler-ninja', 'eye-lock', 'pace-racer', 'pitch-surfer', 'statue-mode'] as const
      return games.every((g) => (ctx.gamesPlayed[g] || 0) >= 1)
    },
  },
  {
    id: 'ninja-master',
    name: 'Ninja Master',
    description: 'Score 90+ on Filler Ninja.',
    icon: 'Swords',
    tier: 'gold',
    check: (ctx) => ctx.highestGameScore >= 90,
  },
  {
    id: 'score-80',
    name: 'Rising Star',
    description: 'Reach an overall score of 80+.',
    icon: 'Star',
    tier: 'gold',
    check: (ctx) => ctx.bestOverall >= 80,
  },

  // Diamond tier — legendary
  {
    id: '100-club',
    name: '100 Score Club',
    description: 'Score 100 on any axis.',
    icon: 'Crown',
    tier: 'diamond',
    check: (ctx) => ctx.bestOverall >= 100 || ctx.bestClarity >= 100,
  },
]

export default BADGES
