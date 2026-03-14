# Analysis Pipeline

## Overview

SpeechMAX runs four independent analysis streams in parallel during a scan or game. Each stream has its own start/stop lifecycle, publishes events via callbacks, and is framework-agnostic (no React dependency).

```
Camera Stream (getUserMedia)
    │
    ├──► MediaPipe FaceLandmarker ──► Gaze Engine ──► gazeReadings
    ├──► MediaPipe PoseLandmarker ──► Pose Tracker ──► poseFrames
    │
Microphone Stream (getUserMedia)
    │
    ├──► Web Speech API ──► Transcriber ──► transcriptEvents
    │                           └──► Filler Detector ──► fillerEvents
    │                           └──► WPM Tracker ──► wpmReadings
    │
    └──► Web Audio API ──► Pitch Analyzer ──► audioFrames
```

---

## Stream 1: Speech Transcription

**File:** `src/analysis/speech/transcriber.ts`

### How It Works

1. Creates a `SpeechRecognition` instance (`continuous: true`, `interimResults: true`)
2. On each `onresult` event, emits a `TranscriptEvent`:
   ```ts
   { text: string, isFinal: boolean, wordCount: number, timestamp: number }
   ```
3. Interim results fire every ~200ms with partial recognition
4. Final results fire when the browser is confident in a complete phrase
5. Auto-restarts on error or unexpected `onend`

### Simulation Fallback

If no speech results arrive within 5 seconds (e.g., mic permission denied, unsupported browser), the transcriber switches to simulation mode — emitting pre-written sentences every 2-3.5 seconds. This keeps the demo functional even without a working mic.

### Pub/Sub Pattern

All analysis modules use the same pattern:
```ts
const subscribers = new Set<Callback>()

export function onTranscript(cb: Callback): () => void {
  subscribers.add(cb)
  return () => subscribers.delete(cb)  // returns unsubscribe function
}
```

React components subscribe in `useEffect` and unsubscribe on cleanup.

---

## Stream 2: Filler Word Detection

**File:** `src/analysis/speech/fillerDetector.ts`

### Detection Method

Subscribes to transcript events and scans each phrase for filler words:

**Detected fillers:** um, uh, uh huh, like, you know, basically, actually, literally, right, so, I mean, kind of, sort of, well, anyway

### Matching

- Case-insensitive word boundary matching
- Multi-word fillers (e.g., "you know", "kind of") detected as single units
- Each detection emits a `FillerEvent` with the filler word, timestamp, and running count

---

## Stream 3: WPM Tracking

**File:** `src/analysis/speech/wpmTracker.ts`

### Rolling Average

- Maintains a sliding window of word counts over time
- Computes WPM as: `(words in window / window duration) * 60`
- Updates on every final transcript event
- Also tracks WPM standard deviation (used for Pacing score)

---

## Stream 4: Pitch Analysis

**File:** `src/analysis/audio/pitchAnalyzer.ts`

### How It Works

1. Connects to the microphone `MediaStream` via `AudioContext`
2. Routes through an `AnalyserNode` (FFT size 2048)
3. On each animation frame, reads time-domain data
4. Runs **autocorrelation** to find the fundamental frequency:
   - Normalizes the signal
   - Computes autocorrelation coefficients
   - Finds the first peak after the initial drop
   - Converts lag to frequency: `sampleRate / lag`
5. Emits `AudioFrame`:
   ```ts
   { pitch: number, volume: number, timestamp: number }
   ```
6. Pitch = 0 indicates silence (below volume threshold)

### Why Autocorrelation?

- Works well for human voice (80-400 Hz range)
- More robust than zero-crossing for noisy environments
- No external dependencies (pure math on typed arrays)

---

## Stream 5: Gaze Tracking

**File:** `src/analysis/mediapipe/gazeEngine.ts`

### How It Works

1. Initializes `FaceLandmarker` with the `face_landmarker.task` WASM model (singleton — cached after first load)
2. Processes video frames at ~10-15 FPS (frame-skipping for performance)
3. Skips frames if `video.readyState < 2` (prevents errors before video is ready)
4. Extracts 478 facial landmarks + iris + blendshapes per frame
5. Fuses three independent gaze signals: iris centering (40%), head pose (35%), blendshape gaze direction (25%)
6. Applies EMA smoothing (α = 0.2) to prevent flicker
7. Classifies gaze quality:
   - **good** (≥ 0.55) — looking at camera
   - **weak** (≥ 0.30) — drifting
   - **lost** (< 0.30) — looking away
8. **Biometric signals** (emitted alongside gaze for composure enrichment):
   - **Blink detection:** eyeBlink blendshapes > 0.5 with 200ms debounce
   - **Jaw tension:** jawForward + mouthClose blendshapes (0-1)
   - **Lip compression:** mouthPressLeft + mouthPressRight blendshapes (0-1)

### Eye Contact Percentage

```
eyeContactPercent = (goodFrames / totalFrames) * 100
```

Used by the Confidence radar axis and the Eye Lock game.

---

## Stream 6: Pose Tracking

**File:** `src/analysis/mediapipe/poseTracker.ts`

### How It Works

1. Initializes `PoseLandmarker` with `pose_landmarker_lite.task` WASM model (singleton — cached after first load)
2. Processes video frames alongside gaze (shared camera feed)
3. Extracts 33 body keypoints per frame
4. Computes per-frame metrics:
   - **Posture score:** Shoulder alignment (Y-delta between landmarks 11/12), head position relative to shoulders
   - **Fidget detection:** Movement delta of key landmarks (shoulders, wrists, head) between frames exceeding threshold
   - **Stillness:** Percentage of frames with movement below fidget threshold
5. **Stage Presence detection** (optional fields on `PoseFrame`):
   - **Shoulder level:** How level shoulders are (0-1)
   - **Upright alignment:** Head above shoulder midpoint (0-1)
   - **Openness:** Inverse of closed postures — crossed arms, pockets, fig-leaf, behind-back (0-1)
   - **Gesture quality:** Hands in power zone (shoulder-to-hip box) with purposeful movement (0-1)
   - **Hip stability:** Hip midpoint rolling buffer stdDev (0-1)
   - **Bad habits:** `armsCrossed`, `handsInPockets`, `faceTouching`, `figLeaf`, `handsBehindBack` (booleans)
   - **Presence score:** Weighted composite (posture 25%, stability 20%, openness 20%, gesture quality 25%, habit avoidance 10%)

### Key Landmarks Used

| Landmark | ID | Used For |
|----------|-----|----------|
| Nose | 0 | Head stability, face-touching detection |
| Left/Right Ear | 7, 8 | Head orientation |
| Left/Right Shoulder | 11, 12 | Posture alignment, power zone boundary |
| Left/Right Elbow | 13, 14 | Arm position, crossed-arms detection |
| Left/Right Wrist | 15, 16 | Hand movement, gestures, bad habit detection |
| Left/Right Hip | 23, 24 | Body sway, power zone boundary, fig-leaf detection |

---

## Scoring Engine

### Radar Scorer (`src/analysis/scoring/radarScorer.ts`)

Converts `ScanRawData` into 5 radar axes (0-100 each):

| Axis | Formula | Weight |
|------|---------|--------|
| **Clarity** | `100 - (fillersPerMinute * 15)` | 25% |
| **Confidence** | `eyeContact * 0.6 + posture * 0.4` | 25% |
| **Pacing** | `100 - |avgWpm - 135| * 1.5 - wpmStdDev * 0.5` | 20% |
| **Expression** | `pitchStdDev * 2` | 15% |
| **Composure** | Enriched: `stillness*0.25 + blink*0.15 + jaw*0.15 + gaze*0.15 + lip*0.10 + vocal*0.20`. Fallback: `stillness*0.7 + (100-fidgets*8)*0.3` | 15% |

**Overall** = weighted sum of all 5 axes.

Composure uses the enriched 6-signal formula when biometric data is available (from RadarScan collecting blink rate, jaw tension, lip compression, gaze stability, and pitch jitter). Falls back to the simpler stillness+fidgets formula for scans without biometric data (backward compatible).

### Game Scorer (`src/analysis/scoring/gameScorer.ts`)

Per-game scoring with typed metric interfaces. See [Game Design](GAME_DESIGN.md) for individual formulas.

---

## Word Tracker

**File:** `src/lib/wordTracker.ts`

Real-time word alignment for the reading passage in RadarScan:

1. Strips punctuation from both passage and spoken text
2. Greedy forward matching — never goes backwards
3. Fuzzy prefix matching (3+ characters) handles partial recognition
4. Look-ahead of 2 words handles skipped/mumbled words
5. Filler words naturally ignored (don't match any passage word)
6. `Math.max(prev, matched)` in the UI prevents backward jumps

---

## Performance Considerations

| Concern | Mitigation |
|---------|-----------|
| MediaPipe GPU load | Frame-skipping (process every 2nd-3rd frame) |
| Model download time (3.76MB face, ~2MB pose) | Singleton pattern caches models after first init; parallel loading in RadarScan |
| Multiple concurrent streams | Each stream runs independently; no shared locks |
| Memory from landmark arrays | Landmarks processed immediately, not stored long-term |
| Speech recognition restarts | Auto-restart with 200ms delay on `onend` |
| Pitch analysis per frame | Uses `requestAnimationFrame`; skips if volume below threshold |
| Video element lifecycle | CameraFeed waits for `loadeddata` event before notifying consumers |
