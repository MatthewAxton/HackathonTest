import type { UserGoal } from '../analysis/types'

interface GoalConfig {
  label: string
  focusAxes: ('clarity' | 'confidence' | 'pacing' | 'expression' | 'composure')[]
  tips: string[]
  recommendedDrillCount: number
}

const GOAL_CONFIGS: Record<UserGoal, GoalConfig> = {
  interview: {
    label: 'Interview Prep',
    focusAxes: ['clarity', 'confidence'],
    tips: [
      'Practice answering common questions without filler words.',
      'Maintain eye contact to project confidence.',
      'Use the STAR method: Situation, Task, Action, Result.',
    ],
    recommendedDrillCount: 3,
  },
  presentation: {
    label: 'Presentations',
    focusAxes: ['expression', 'pacing'],
    tips: [
      'Vary your pitch to keep the audience engaged.',
      'Aim for 130-150 WPM for clear delivery.',
      'Pause after key points to let them land.',
    ],
    recommendedDrillCount: 4,
  },
  casual: {
    label: 'Casual Speaking',
    focusAxes: ['clarity', 'composure'],
    tips: [
      'Speak clearly without rushing — relax your pace.',
      'Use open body language to appear approachable.',
      'Replace filler words with short pauses.',
    ],
    recommendedDrillCount: 2,
  },
  reading: {
    label: 'Reading Aloud',
    focusAxes: ['pacing', 'expression'],
    tips: [
      'Read ahead mentally to maintain a smooth flow.',
      'Emphasise key words with pitch variation.',
      'Keep a steady pace — don\'t rush through sentences.',
    ],
    recommendedDrillCount: 3,
  },
}

export default GOAL_CONFIGS
