import { useScanStore } from '../store/scanStore'
import { useGameStore } from '../store/gameStore'
import { useSessionStore } from '../store/sessionStore'
import BADGES from './badges'

const GAME_NAMES: Record<string, string> = {
  'filler-ninja': 'Filler Ninja',
  'eye-lock': 'Eye Lock',
  'pace-racer': 'Pace Racer',
  'pitch-surfer': 'Pitch Surfer',
  'statue-mode': 'Stage Presence',
}

export function buildMikeSystemPrompt(): string {
  const scanState = useScanStore.getState()
  const gameState = useGameStore.getState()
  const sessionState = useSessionStore.getState()

  const latest = scanState.getLatestScores()
  const previous = scanState.getPreviousScores()

  // Build scores section
  let scoresSection = 'No scans yet.'
  if (latest) {
    scoresSection = `Clarity ${latest.clarity}, Confidence ${latest.confidence}, Pacing ${latest.pacing}, Expression ${latest.expression}, Composure ${latest.composure}, Overall ${latest.overall}`

    if (previous) {
      const delta = (key: 'clarity' | 'confidence' | 'pacing' | 'expression' | 'composure' | 'overall') => {
        const diff = latest[key] - previous[key]
        return diff > 0 ? `+${diff}` : `${diff}`
      }
      scoresSection += `\n- Previous Score Deltas: Clarity ${delta('clarity')}, Confidence ${delta('confidence')}, Pacing ${delta('pacing')}, Expression ${delta('expression')}, Composure ${delta('composure')}, Overall ${delta('overall')}`
    }
  }

  // Weakest axis
  let weakestAxis = 'unknown'
  if (latest) {
    const axes = [
      { name: 'Clarity', score: latest.clarity },
      { name: 'Confidence', score: latest.confidence },
      { name: 'Pacing', score: latest.pacing },
      { name: 'Expression', score: latest.expression },
      { name: 'Composure', score: latest.composure },
    ]
    axes.sort((a, b) => a.score - b.score)
    weakestAxis = axes[0].name
  }

  // Recent games (last 5)
  const recentGames = gameState.gameHistory.slice(-5)
  const recentGamesStr = recentGames.length > 0
    ? recentGames.map((g) => `${GAME_NAMES[g.gameType] ?? g.gameType}: ${g.score}`).join(', ')
    : 'None yet'

  // Badges
  const totalBadges = BADGES.length
  const earnedCount = sessionState.earnedBadges.size

  const { personalBests } = sessionState

  return `You are Mike, the AI speech coach in SpeechMAX. Friendly, casual, knowledgeable.

CRITICAL: Keep ALL responses to 1-2 short sentences MAX. Be punchy and direct. No bullet points, no lists, no long explanations. Think text message energy, not essay.

USER DATA:
- Goal: ${sessionState.userGoal ?? 'Not set'}
- Latest Scores: ${scoresSection}
- Streak: ${sessionState.streakDays} days | Scans: ${sessionState.totalScans} | Games: ${sessionState.totalGames}
- Personal Bests: Overall ${personalBests.overallScore}, Clarity ${personalBests.clarityScore}, Filler-Free ${personalBests.longestFillerFreeStreak}s
- Recent Games: ${recentGamesStr}
- Badges: ${earnedCount}/${totalBadges}
- Weakest axis: ${weakestAxis}

RULES:
- 1-2 sentences only. Never more.
- Reference user data when relevant
- Games: Filler Ninja=Clarity, Eye Lock=Confidence, Pace Racer=Pacing, Pitch Surfer=Expression, Stage Presence=Composure
- Never say you're an AI or mention Gemini — you ARE Mike`
}
