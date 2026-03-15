import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { PromptCategory, BadgeContext, GameType, UserGoal } from '../analysis/types'
import BADGES from '../lib/badges'
import PROMPTS from '../lib/prompts'
import { debouncedSyncProfile } from '../lib/supabaseSync'

interface PersonalBests {
  overallScore: number
  clarityScore: number
  longestFillerFreeStreak: number
  highestGameScore: number
}

interface SessionState {
  usedPrompts: Set<string>
  earnedBadges: Set<string>
  personalBests: PersonalBests
  streakDays: number
  lastPracticeDate: string | null
  totalScans: number
  totalGames: number
  gamesPlayed: Record<GameType, number>
  userGoal: UserGoal | null
  favoritePrompts: string[]
  preferredCamera: string | null
  preferredMic: string | null

  markPromptUsed: (prompt: string) => void
  getUnusedPrompt: (category: PromptCategory) => string
  checkBadges: () => string[]  // returns newly earned badge ids
  updatePersonalBests: (bests: Partial<PersonalBests>) => void
  incrementStreak: () => void
  recordScan: () => void
  recordGame: (game: GameType) => void
  setUserGoal: (goal: UserGoal) => void
  addFavoritePrompt: (prompt: string) => void
  removeFavoritePrompt: (prompt: string) => void
  setPreferredCamera: (id: string | null) => void
  setPreferredMic: (id: string | null) => void
  resetProgress: () => void
}

const sessionStorageAdapter = createJSONStorage<SessionState>(() => localStorage)

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
  usedPrompts: new Set(),
  earnedBadges: new Set(),
  personalBests: {
    overallScore: 0,
    clarityScore: 0,
    longestFillerFreeStreak: 0,
    highestGameScore: 0,
  },
  streakDays: 0,
  lastPracticeDate: null,
  totalScans: 0,
  totalGames: 0,
  gamesPlayed: {
    'filler-ninja': 0,
    'eye-lock': 0,
    'pace-racer': 0,
    'pitch-surfer': 0,
    'statue-mode': 0,
  },
  userGoal: null,
  favoritePrompts: [],
  preferredCamera: null,
  preferredMic: null,

  setUserGoal: (goal) => {
    set({ userGoal: goal })
    debouncedSyncProfile({ user_goal: goal })
  },

  addFavoritePrompt: (prompt) => set((s) => ({
    favoritePrompts: s.favoritePrompts.includes(prompt) ? s.favoritePrompts : [...s.favoritePrompts, prompt],
  })),
  removeFavoritePrompt: (prompt) => set((s) => ({
    favoritePrompts: s.favoritePrompts.filter((p) => p !== prompt),
  })),
  setPreferredCamera: (id) => {
    set({ preferredCamera: id })
    debouncedSyncProfile({ preferred_camera: id })
  },
  setPreferredMic: (id) => {
    set({ preferredMic: id })
    debouncedSyncProfile({ preferred_mic: id })
  },
  resetProgress: () => {
    localStorage.removeItem('speechmax-session')
    localStorage.removeItem('speechmax-scan')
    localStorage.removeItem('speechmax-game')
    window.location.reload()
  },

  markPromptUsed: (prompt) => {
    set((s) => {
      const next = new Set(s.usedPrompts)
      next.add(prompt)
      return { usedPrompts: next }
    })
  },

  getUnusedPrompt: (category) => {
    const { usedPrompts } = get()
    const pool = PROMPTS[category]
    const unused = pool.filter((p) => !usedPrompts.has(p))
    if (unused.length === 0) {
      // All used — reset and pick random
      return pool[Math.floor(Math.random() * pool.length)]
    }
    return unused[Math.floor(Math.random() * unused.length)]
  },

  checkBadges: () => {
    const state = get()
    const ctx: BadgeContext = {
      totalScans: state.totalScans,
      totalGames: state.totalGames,
      streakDays: state.streakDays,
      bestOverall: state.personalBests.overallScore,
      bestClarity: state.personalBests.clarityScore,
      longestFillerFreeStreak: state.personalBests.longestFillerFreeStreak,
      highestGameScore: state.personalBests.highestGameScore,
      gamesPlayed: state.gamesPlayed,
    }

    const newlyEarned: string[] = []
    const nextBadges = new Set(state.earnedBadges)

    for (const badge of BADGES) {
      if (!nextBadges.has(badge.id) && badge.check(ctx)) {
        nextBadges.add(badge.id)
        newlyEarned.push(badge.id)
      }
    }

    if (newlyEarned.length > 0) {
      set({ earnedBadges: nextBadges })
      debouncedSyncProfile({ earned_badges: [...nextBadges] })
    }

    return newlyEarned
  },

  updatePersonalBests: (bests) => {
    set((s) => ({
      personalBests: {
        overallScore: Math.max(s.personalBests.overallScore, bests.overallScore ?? 0),
        clarityScore: Math.max(s.personalBests.clarityScore, bests.clarityScore ?? 0),
        longestFillerFreeStreak: Math.max(s.personalBests.longestFillerFreeStreak, bests.longestFillerFreeStreak ?? 0),
        highestGameScore: Math.max(s.personalBests.highestGameScore, bests.highestGameScore ?? 0),
      },
    }))
    debouncedSyncProfile({ personal_bests: get().personalBests })
  },

  incrementStreak: () => {
    const today = new Date().toISOString().split('T')[0]
    const { lastPracticeDate, streakDays } = get()

    if (lastPracticeDate === today) return // already counted today

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const newStreak = lastPracticeDate === yesterday ? streakDays + 1 : 1

    set({ streakDays: newStreak, lastPracticeDate: today })
  },

  recordScan: () => {
    set((s) => ({ totalScans: s.totalScans + 1 }))
    get().incrementStreak()
    const s = get()
    debouncedSyncProfile({
      total_scans: s.totalScans,
      streak_days: s.streakDays,
      last_practice_date: s.lastPracticeDate,
    })
  },

  recordGame: (game) => {
    set((s) => ({
      totalGames: s.totalGames + 1,
      gamesPlayed: { ...s.gamesPlayed, [game]: (s.gamesPlayed[game] || 0) + 1 },
    }))
    get().incrementStreak()
    const s = get()
    debouncedSyncProfile({
      total_games: s.totalGames,
      games_played: s.gamesPlayed,
      streak_days: s.streakDays,
      last_practice_date: s.lastPracticeDate,
    })
  },
}),
    {
      name: 'speechmax-session',
      storage: sessionStorageAdapter,
      partialize: (state) => ({
        ...state,
        usedPrompts: [...state.usedPrompts] as unknown as Set<string>,
        earnedBadges: [...state.earnedBadges] as unknown as Set<string>,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<SessionState> | undefined
        if (!p) return current
        return {
          ...current,
          ...p,
          usedPrompts: new Set(p.usedPrompts as unknown as string[] ?? []),
          earnedBadges: new Set(p.earnedBadges as unknown as string[] ?? []),
        }
      },
    }
  )
)
