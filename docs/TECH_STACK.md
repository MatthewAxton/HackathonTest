# Tech Stack

## Core Framework

### React 19 + TypeScript 5.8 (strict mode)

- **Why React 19:** Latest stable release, concurrent features, excellent ecosystem.
- **Why TypeScript strict:** Catches bugs at compile time. All `strict` checks enabled — `noImplicitAny`, `strictNullChecks`, `noUnusedLocals`, etc.
- **JSX transform:** `react-jsx` (no React import needed in components).

### Vite 6

- **Why Vite:** Instant HMR, native ES modules in dev, Rollup-based production builds.
- **Plugins:** `@vitejs/plugin-react` (Babel for Fast Refresh), `@tailwindcss/vite` (Tailwind CSS).
- **Output:** Static SPA in `dist/` — deploy anywhere.

---

## State Management

### Zustand 5

- **Why Zustand:** 1.2kB bundle, no boilerplate, TypeScript-native, built-in `persist` middleware.
- **Persistence:** All 3 stores use `zustand/middleware/persist` with `localStorage`.
- **Custom serializer:** `sessionStore` uses a custom serializer to handle `Set` types (used for badge IDs and prompt tracking).

**Stores:**

| Store | Purpose | Key State |
|-------|---------|-----------|
| `scanStore` | Scan lifecycle & results | `scans[]`, `currentScanId`, `rawDataBuffer`, radar scores |
| `gameStore` | Game history & difficulty | `gameHistory[]`, `currentGameType`, per-game difficulty |
| `sessionStore` | User progress | `earnedBadges`, `personalBests`, `streakDays`, `totalScans` |

---

## Analysis APIs

### Web Speech API (SpeechRecognition)

- **Used for:** Real-time speech-to-text transcription.
- **Config:** `continuous: true`, `interimResults: true`, `lang: 'en-US'`.
- **Fallback:** If no results after 5 seconds, switches to simulation mode with pre-written sentences.
- **Browser support:** Chrome, Edge (webkit prefix). Firefox/Safari have limited support.
- **Module:** `src/analysis/speech/transcriber.ts`

### Web Audio API

- **Used for:** Pitch detection via autocorrelation algorithm.
- **How:** `AudioContext` → `AnalyserNode` → time-domain data → autocorrelation → fundamental frequency (Hz).
- **Also used for:** Sound effects via `OscillatorNode` (no audio files needed).
- **Module:** `src/analysis/audio/pitchAnalyzer.ts`, `src/lib/sounds.ts`

### MediaPipe FaceLandmarker

- **Used for:** Eye contact / gaze quality tracking.
- **Model:** `face_landmarker.task` (WASM, runs on GPU via WebGL).
- **Output:** 468 facial landmarks per frame → gaze vector → quality classification (good/partial/away).
- **Module:** `src/analysis/mediapipe/gazeEngine.ts`

### MediaPipe PoseLandmarker

- **Used for:** Posture scoring and fidget detection.
- **Model:** `pose_landmarker_lite.task` (WASM).
- **Output:** 33 body keypoints per frame → shoulder alignment, head stability, hand movement → posture score + fidget count.
- **Module:** `src/analysis/mediapipe/poseTracker.ts`

---

## UI Libraries

### Framer Motion 12

- **Used for:** Page transitions, component animations, gesture handling.
- **Key uses:** `AnimatePresence` for route transitions, `motion.div` for animated game elements, spring physics for score counters.

### Tailwind CSS 4

- **Used for:** Utility-first styling (alongside inline styles).
- **Config:** Default config via Vite plugin. Dark theme enforced via inline styles to match the `#050508` background system.

### Lucide React

- **Used for:** SVG icons throughout the UI (Activity, Eye, Target, etc.).
- **Why:** Tree-shakeable, consistent style, TypeScript types.

### anam-react-liquid-glass

- **Used for:** Liquid glass visual effect on homepage.

---

## Build & Dev Tools

| Tool | Version | Purpose |
|------|---------|---------|
| TypeScript | ~5.8.3 | Type checking (`tsc -b` runs before Vite build) |
| ESLint | ^9.25.0 | Linting with `typescript-eslint` + React hooks plugin |
| Vite | ^6.3.5 | Dev server + production bundler |
| Tailwind CSS | ^4.2.1 | Utility CSS via Vite plugin |

---

## Browser Requirements

| API | Chrome | Firefox | Safari | Edge |
|-----|--------|---------|--------|------|
| Web Speech API | Full | Partial | No | Full |
| MediaPipe WASM | Full | Full | Full | Full |
| Web Audio API | Full | Full | Full | Full |
| getUserMedia | Full | Full | Full | Full |

**Recommended:** Chrome 90+ on desktop for the complete experience.

---

## No External Services

SpeechMAX has **zero backend dependencies**:
- No API keys required
- No cloud services
- No databases
- No authentication
- No telemetry

Everything runs in the browser. Data stays on the user's machine in `localStorage`.
