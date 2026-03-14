# Architecture

## System Overview

SpeechMAX is a fully client-side single-page application. No backend server is required — all analysis, scoring, and persistence happen in the browser.

```
┌─────────────────────────────────────────────────────────┐
│                      Browser                            │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Camera   │  │   Mic    │  │ Speaker  │              │
│  └────┬─────┘  └────┬─────┘  └────▲─────┘              │
│       │              │             │                     │
│  ┌────▼─────────────▼─────────────┴────────────────┐   │
│  │            Analysis Pipeline                     │   │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────────┐  │   │
│  │  │ MediaPipe  │ │  Speech   │ │  Web Audio    │  │   │
│  │  │ Face+Pose  │ │ Transcr.  │ │  Pitch Anal.  │  │   │
│  │  └─────┬─────┘ └─────┬─────┘ └──────┬────────┘  │   │
│  │        │              │              │            │   │
│  │  ┌─────▼──────────────▼──────────────▼────────┐  │   │
│  │  │         Scoring Engine                      │  │   │
│  │  │   radarScorer.ts  |  gameScorer.ts          │  │   │
│  │  └─────────────────────┬──────────────────────┘  │   │
│  └────────────────────────┼─────────────────────────┘   │
│                           │                              │
│  ┌────────────────────────▼─────────────────────────┐   │
│  │              Zustand Stores                       │   │
│  │  scanStore  │  gameStore  │  sessionStore         │   │
│  │         (persisted to localStorage)               │   │
│  └────────────────────────┬─────────────────────────┘   │
│                           │                              │
│  ┌────────────────────────▼─────────────────────────┐   │
│  │                React UI                           │   │
│  │  App.tsx → GamificationLayout → Screen Components │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

### Radar Scan Flow

```
User speaks for 30 seconds
        │
        ├──► Web Speech API → transcript events → filler detection + WPM
        ├──► Web Audio API → pitch frames → pitch std dev
        ├──► MediaPipe FaceLandmarker → gaze readings → eye contact %
        └──► MediaPipe PoseLandmarker → pose frames → posture + fidgets
                │
                ▼
        ScanRawData accumulated in refs
                │
                ▼
        scanStore.appendRawData() → radarScorer.computeRadarScores()
                │
                ▼
        RadarScores { clarity, confidence, pacing, expression, composure, overall }
                │
                ▼
        Navigate to /results → RadarChart visualization
```

### Game Flow

```
GameQueue recommends games based on weakest radar axes
        │
        ▼
GameIntro (prompt selection + countdown)
        │
        ▼
Game screen (real-time analysis + scoring)
        │
        ▼
gameStore.addResult() → ScoreCard (breakdown + coaching tips)
        │
        ▼
Back to GameQueue or Progress
```

## Module Boundaries

### Analysis Layer (`src/analysis/`)

Pure functions and pub/sub modules. No React imports. Each module exposes:
- `start*()` / `stop*()` — lifecycle
- `on*()` — subscribe to events (returns unsubscribe function)
- `get*()` — read current state

Modules are independent and can run in any combination.

### UI Layer (`src/gamification/`)

React components that subscribe to analysis modules via `useEffect` + callbacks. Components never call analysis functions directly in render — always through effects or event handlers.

### Store Layer (`src/store/`)

Zustand stores with `persist` middleware. Stores are the single source of truth for:
- **scanStore** — scan history, raw data, computed radar scores
- **gameStore** — game results, difficulty progression
- **sessionStore** — badges, streaks, prompts used, personal bests

### Lib Layer (`src/lib/`)

Stateless utilities: badge definitions, prompt pools, sound synthesis, word tracking.

## Routing

All gamification routes are wrapped in `GamificationLayout` which applies the dark theme CSS. The homepage is a standalone component in `App.tsx`.

```
/                 → Homepage (standalone)
/onboarding       → First-time walkthrough
/scan             → 30-second radar scan
/results          → Radar chart results
/queue            → Game selection
/filler-ninja     → Filler Ninja game
/eye-lock         → Eye Lock game
/pace-racer       → Pace Racer game
/pitch-surfer     → Pitch Surfer game
/statue-mode      → Stage Presence game (formerly Statue Mode)
/score/:game      → Post-game score card
/progress         → Progress dashboard
```

All game screens are lazy-loaded via `React.lazy()` with `Suspense` fallback.

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| No backend | Hackathon constraint + privacy story. All computation is client-side. |
| Zustand over Redux | Minimal boilerplate, built-in persist middleware, tiny bundle. |
| MediaPipe WASM over TF.js | Better accuracy for face/pose, runs on GPU via WebGL. |
| Web Speech API over Whisper | Zero latency, no model download, good enough for English. |
| Inline styles over CSS modules | Faster iteration during hackathon. Tailwind for utilities. |
| Web Audio oscillators for SFX | No audio files to load. Instant, tiny, no licensing. |
| Simulation fallback | If speech recognition fails, simulated text keeps the demo running. |
