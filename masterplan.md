# SpeechMAX Master Plan

## Context

SpeechMAX is a browser-based AI speech coach for UNIHACK 2026. React + TypeScript + Vite. Uses Web Speech API, Web Audio API, and MediaPipe for real-time speech analysis. All 5 mini-games connect to real analysis modules and produce real scores.

**Design rule (non-negotiable):** `#050508` background, glass cards (`rgba(255,255,255,0.06)` + `backdrop-filter: blur(20px)`), `#c28fe7` purple accent, `rgba(255,255,255,0.x)` text hierarchy.

---

## Sprint 1: Data Integrity [COMPLETE]

### 1.1 — localStorage persistence for all Zustand stores [DONE]
### 1.2 — Wire real sensor data into RadarScan [DONE]
### 1.3 — Wire real game metrics into ScoreCard [DONE]

---

## Sprint 2: Dark Theme Conversion [COMPLETE]

### 2.1 — Convert gamification CSS to dark theme [DONE]
### 2.2 — Convert all screen inline styles to dark theme [DONE]

---

## Sprint 3: UX Flow Completion [COMPLETE]

### 3.1 — Blackout transition: scan → results [DONE]
### 3.2 — Rescan flow with radar overlay [DONE]
### 3.3 — Per-game prompt picker [DONE]
### 3.4 — Wire difficulty auto-scaling [DONE]
### 3.5 — Route guards [DONE]
### 3.6 — Hide DevMenu in production [DONE]
### 3.7 — ErrorBoundary [DONE]

---

## Sprint 4: Game Visual Upgrades [COMPLETE]

### 4.1 — Filler Ninja: floating targets + slash animation [DONE]
### 4.2 — Eye Lock: full-screen pulse/dim [DONE]
### 4.3 — Pitch Surfer: ocean wave + surfing mascot [DONE]
### 4.4 — Statue Mode: body outline heatmap [DONE]
### 4.5 — Pace Racer: glow/pulse effects [DONE]

---

## Sprint 5: Sound & Final Polish [COMPLETE]

### 5.1 — Sound FX system (oscillator-based) [DONE]
### 5.2 — Visual QA pass (dark theme tokens + progress bar) [DONE]
### 5.3 — Performance (lazy loading + MediaPipe frame-skipping) [DONE]

---

## Sprint 6: Per-Game Intro Screens [COMPLETE]

> Replace shared Countdown.tsx with unique intro screens built into each game.

### 6.1 — Shared components [DONE]

Created `GameIntro.tsx` (split left/right layout with mascot, hero visual, instructions, prompt, 3-2-1 countdown built-in) and `CountdownOverlay.tsx`.

**Files:**
- New: `src/gamification/components/GameIntro.tsx`
- New: `src/gamification/components/CountdownOverlay.tsx`

### 6.2 — Per-game intro phases [DONE]

Each game has `phase: 'intro' | 'playing'` state machine. Intro shows game-specific hero visual:
- **FillerNinja** — floating filler word bubbles
- **EyeLock** — pulsing green dot with concentric rings
- **PaceRacer** — animated pace bar preview
- **PitchSurfer** — undulating wave SVG
- **StatueMode** — body silhouette outline

### 6.3 — Remove Countdown.tsx [DONE]

Deleted shared Countdown screen and route. GameQueue paths simplified from `/countdown?next=/X` to `/X`. ScoreCard replay paths updated.

**Files modified:** All 5 game screens, `GameQueue.tsx`, `ScoreCard.tsx`, `DevMenu.tsx`, `App.tsx`

---

## Sprint 7: Fullscreen Camera + Glass HUD [COMPLETE]

> Camera games (EyeLock, StatueMode, RadarScan) redesigned with fullscreen camera feed and floating glass overlay cards.

### 7.1 — Fullscreen camera layout [DONE]

Camera fills the entire viewport. All UI elements (timer, stats, prompt, back button, finish early) float as semi-transparent glass cards with backdrop blur.

Glass card style: `background: rgba(0,0,0,0.5)`, `backdropFilter: blur(16px)`, `borderRadius: 14`, `border: 1px solid rgba(255,255,255,0.1)`

**Files:** `EyeLock.tsx`, `StatueMode.tsx`, `RadarScan.tsx`

### 7.2 — Eye tracking video ref fix [DONE]

Replaced fragile `document.querySelector('video')` with proper `onVideoRef` callback from CameraFeed. Eliminates race condition where model loads before video element exists.

---

## Sprint 8: Dashboard & UX Improvements [COMPLETE]

### 8.1 — Dashboard enhancements [DONE]
- Lucide icons replace emojis on game cards (Crosshair, Eye, Activity, Waves, Shield)
- Wider radar chart (340px container, 280px chart) so axis labels display properly
- Top Awards badge row with earned badge names + "View All" link to Progress
- Mascot tip popup with random coaching tips

### 8.2 — Remove mascot/bottom banner from non-game screens [DONE]
- Removed `MikeWithBubble` and `BottomBanner` from Progress, ScoreCard, RadarResults, RadarScan
- Games/Rescan buttons moved to Progress top banner

### 8.3 — Progress page redesign [DONE]
- Split layout: radar + stats left, personal bests + badges right
- Score deltas from previous scan
- Overall trend indicator
- Share Results button (UI only)

### 8.4 — ScoreCard coaching tips [DONE]
- Per-game coaching tips based on actual metrics
- "Coach's Tip" card with contextual advice

---

## Sprint 9: Analysis Engine Improvements [COMPLETE]

### 9.1 — MediaPipe sensitivity tuning [DONE]
- Gaze: good threshold 0.65→0.55, weak 0.35→0.30, EMA alpha 0.3→0.2
- Pose: head stability multiplier 15→8, hand movement 8→4, fidget threshold 0.35→0.5
- Result: normal speaking gestures no longer flagged, more forgiving eye contact

### 9.2 — Pitch scoring fix [DONE]
- Variation multiplier increased from 1.5x to 3x
- Typical speech (20-30Hz std dev) now produces meaningful scores

### 9.3 — Filler detection improvements [DONE]
- Added 11 more filler words: er, ah, hmm, uhh, umm, well, okay so, honestly, yeah, just, i guess
- Rewrote detection with count-based tracking (not position-based) for accurate repeated word detection
- Processes interim transcripts for faster detection

### 9.4 — Speech recognition reliability [DONE]
- Restart gap reduced from 200ms to 50ms
- `maxAlternatives: 3` for better word recognition
- Error state cleared on successful results
- Smart error handling (only restart on recoverable errors)

### 9.5 — Filler streak pauses during silence [DONE]
- Timer and streak only tick while user is actively speaking
- 3s silence threshold triggers pause
- Visual indicators: yellow "PAUSED" badge on timer, progress bar turns yellow, streak counter dims with "paused — speak to continue" label

### 9.6 — Finish Early button [DONE]
- Added to PitchSurfer, EyeLock, StatueMode (prompt-based games)
- Appears after 10 seconds of gameplay
- Uses actual elapsed time for scoring

### 9.7 — Audio quality improvements [DONE]
- **Browser noise suppression**: All mic requests now enable `echoCancellation`, `noiseSuppression`, and `autoGainControl` via getUserMedia constraints (both `useMicrophone` hook and `CameraFeed`)
- **DynamicsCompressorNode**: Added to pitch analyzer audio chain (threshold -40dB, 4:1 ratio) — reduces background noise and normalizes speech volume before pitch/volume analysis
- **Confidence filtering**: Transcriber now picks the best alternative by confidence score from `maxAlternatives: 3`, and rejects final results with confidence < 0.3 (likely noise artifacts)

---

## Sprint 10: Stage Presence + Enriched Composure + Bug Fixes [COMPLETE]

> Evolved Statue Mode into Stage Presence game and enriched the Composure radar spoke with biometric signals.

### 10.1 — Stage Presence game (evolved Statue Mode) [DONE]

Renamed from "Statue Mode" to "Stage Presence" — from "don't move" to "move RIGHT." Rewards good body language, penalizes bad habits. `GameType` stays `'statue-mode'` for backward compatibility. Route unchanged.

- **Pose detection**: Added to `poseTracker.ts` — shoulder level, upright alignment, openness, gesture quality, hip stability, plus bad habit booleans (armsCrossed, handsInPockets, faceTouching, figLeaf, handsBehindBack)
- **Presence score**: Weighted composite (posture 25%, stability 20%, openness 20%, gesture quality 25%, habit avoidance 10%)
- **New game screen** (`StagePresence.tsx`): Power zone overlay, animated callouts (green positive / red negative), presence streak counter with flame icon, sub-score bars
- **Scoring**: `gameScorer.ts` uses presence score + streak bonus - habit penalty when available, falls back to old formula

**Files:** `poseTracker.ts`, `StagePresence.tsx` (new), `gameScorer.ts`, `GameQueue.tsx`, `ScoreCard.tsx`, `DevMenu.tsx`, `App.tsx`

### 10.2 — Enriched composure biometrics [DONE]

Added real biometric signals to the Composure radar spoke:
- **gazeEngine.ts**: Blink detection (debounced), jaw tension, lip compression from FaceLandmarker blendshapes
- **RadarScan.tsx**: Collects blink count, jaw tension, lip compression, gaze stability, pitch jitter during scan
- **radarScorer.ts**: 6-signal enriched composure formula (stillness 25%, blink 15%, jaw 15%, gaze 15%, lip 10%, vocal 20%) with backward-compatible fallback
- **ScanRawData**: Added optional fields (blinkRate, jawTension, lipCompression, gazeStability, pitchJitter)

### 10.3 — Eye tracking initialization fix [DONE]

Root cause: CameraFeed's `<video>` element only existed when `state === 'active'`, but `srcObject` and `onVideoRef` were called before state changed. `videoRef.current` was always null.

Fixes applied:
- **CameraFeed.tsx**: Separated stream acquisition from video attachment. State goes to 'active' first (mounting `<video>`), then `useEffect` attaches `srcObject` and waits for `loadeddata`
- **Singleton init**: `initGazeEngine()` and `initPoseTracker()` now cache model instances, preventing re-download on re-navigation
- **Parallel init**: RadarScan loads gaze + pose models via `Promise.all` instead of sequentially
- **Video readiness guard**: `processFrame()` skips if `video.readyState < 2`
- **Double-start fix**: EyeLock uses `trackingStarted` ref to prevent race condition

### 10.4 — Mascot talk blip sound [DONE]

Added Animal Crossing-style `playTalkBlip()` per-character typewriter effect to all mascot speech bubbles:
- Exported `TalkingBubble` from `Mike.tsx`
- Applied to: Homepage splash bubble, Homepage goal bubble, Onboarding (both slides), Countdown (intro + countdown), GameQueue mascot tip popup
- Previously only worked in RadarResults

---

## Sprint 11: Game Variations, Difficulty Scaling & Onboarding Customization [COMPLETE]

> Richer gameplay, onboarding-driven customization, and meaningful difficulty scaling beyond just timer changes.

### 11.1 — Types + Session Store [DONE]

- Added `UserGoal` type (`interview | presentation | casual | reading`) to `types.ts`
- Added `reading` to `PromptCategory` union
- Added `userGoal` state + `setUserGoal` action to `sessionStore.ts` (persisted via localStorage)

### 11.2 — Onboarding Goal Selection [DONE]

New slide between intro and camera: "What are you practicing for?" with 4 glass cards in 2×2 grid (Job Interview, Presentation, Casual Conversation, Reading Aloud). Step dots updated to [0,1,2]. Goal persists across refresh via sessionStore.

**Files:** `Onboarding.tsx`

### 11.3 — More Prompts [DONE]

Doubled each category (5→10 prompts each) and added `reading` category with 10 expressive passages. Total: 40 prompts (was 15).

**Files:** `prompts.ts`

### 11.4 — Goal-Driven Prompt Selection [DONE]

Created `goalPromptMap.ts` helper. All 5 game screens now check `userGoal` → map to prompt category → fallback to game default. Dynamic `promptLabel` in both GameIntro and playing-phase UI.

Map: interview→interview, presentation→professional, casual→casual, reading→reading

**Files:** New `src/lib/goalPromptMap.ts`, all 5 game screens

### 11.5 — Richer Difficulty Configs [DONE]

Each game gets a `DIFFICULTY_CONFIG` object with per-difficulty gameplay parameters (not just timer):

- **FillerNinja**: silence timeout (5s/4s/3s), penalty multiplier (1x/1x/2x), filler list hidden on medium+hard
- **EyeLock**: charge rate (6/5/4 per tick), drain rate (5/8/12 per tick)
- **PaceRacer**: WPM zone (100–180/120–160/130–150), gear-up threshold (4/10/16 consecutive)
- **PitchSurfer**: wipeout threshold (4s/3s/2s monotone), good stdDev (10/15/25)
- **StagePresence**: fidget threshold (0.6/0.5/0.35)

### 11.6 — Difficulty-Aware GameIntro Tips [DONE]

Easy tips are encouraging ("Take your time"), hard tips are challenge-oriented ("Strict rules — every mistake costs more!"). Pulled from `DIFFICULTY_CONFIG.tip`.

---

## Key Architecture

| Area | Files |
|------|-------|
| **Stores** | `src/store/{scanStore,gameStore,sessionStore}.ts` |
| **Game Screens** | `src/gamification/screens/*.tsx` |
| **Shared Components** | `src/gamification/components/{GameIntro,CountdownOverlay,Banner,CameraFeed,AudioWave,RadarChart}` |
| **Analysis** | `src/analysis/{speech,audio,mediapipe}/*.ts` |
| **Scoring** | `src/analysis/scoring/{radarScorer,gameScorer}.ts` |
| **Sounds** | `src/lib/sounds.ts` |
| **Badges/Prompts** | `src/lib/{badges,prompts}.ts` |

---

## Known Limitations

| Issue | Impact | Notes |
|-------|--------|-------|
| Web Speech API merges repeated words server-side | Filler detection may miss "um um um" → "um" | Chrome limitation, no client fix. Deepgram Nova-3 would solve this ($200 free credit) |
| 50ms restart gap in speech recognition | Occasional missed words during Chrome session reset | Near-optimal; further reduction risks race conditions |
| MediaPipe + Web Speech API CPU load | Possible jank on low-end hardware | Frame-skipping (every 2nd frame) mitigates |
| `SpeechRecognition` not available in all browsers | Firefox/Safari have limited support | Simulation fallback activates after 5s |

---

## Build & Verify

```bash
npx tsc --noEmit    # Type check
npm run build       # Production build
npm run dev         # Dev server
```
