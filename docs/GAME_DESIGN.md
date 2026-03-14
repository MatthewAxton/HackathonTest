# Game Design

## Philosophy

Each mini-game isolates **one speech skill** and trains it through focused, time-boxed practice with real-time feedback. Games are short (30-90 seconds), immediately replayable, and scored on a 0-100 scale.

The game queue recommends games based on the user's weakest radar axes from their most recent scan, creating a personalized training loop.

---

## Games

### 1. Filler Ninja

**Trains:** Clarity (filler word elimination)
**Duration:** 90 seconds
**Radar axis:** Clarity

| Mechanic | Detail |
|----------|--------|
| Goal | Speak continuously without filler words |
| Detection | `fillerDetector.ts` matches against: um, uh, like, you know, basically, actually, literally, right, so, I mean, kind of, sort of |
| Scoring | `100 - (fillerCount * 15) + min(30, longestStreakSeconds)` |
| Visual | Floating filler words appear as targets; ninja slash animation on detection |
| Streak | Filler-free timer builds a streak multiplier; streak resets on any filler |
| Difficulty | Easy: forgives 1-word fillers. Medium: standard. Hard: stricter matching window |

### 2. Eye Lock

**Trains:** Confidence (eye contact)
**Duration:** 60 seconds
**Radar axis:** Confidence

| Mechanic | Detail |
|----------|--------|
| Goal | Maintain eye contact with the camera |
| Detection | `gazeEngine.ts` classifies gaze as good/partial/away per frame |
| Scoring | `gazeLockedPercent + min(15, longestGazeSeconds * 0.5)` |
| Visual | Screen pulses green when locked, dims red when contact lost |
| Grace period | 1-second grace before penalizing (allows natural blinks) |
| Difficulty | Easy: wider gaze tolerance. Hard: strict center-gaze only |

### 3. Pace Racer

**Trains:** Pacing (speaking speed control)
**Duration:** 60 seconds
**Radar axis:** Pacing

| Mechanic | Detail |
|----------|--------|
| Goal | Keep WPM in the 120-160 target zone |
| Detection | `wpmTracker.ts` computes rolling WPM from transcript events |
| Scoring | `(timeInZoneSeconds / totalSeconds) * 100` |
| Visual | Speedometer-style gauge with green zone (120-160 WPM) |
| Feedback | Glow effects when in zone; warning when too fast/slow |
| Difficulty | Easy: 100-180 zone. Medium: 120-160. Hard: 130-150 |

### 4. Pitch Surfer

**Trains:** Expression (vocal variety)
**Duration:** 30 seconds
**Radar axis:** Expression

| Mechanic | Detail |
|----------|--------|
| Goal | Vary your pitch — avoid monotone delivery |
| Detection | `pitchAnalyzer.ts` tracks fundamental frequency via autocorrelation |
| Scoring | `min(60, pitchVariation * 3) + 40 - (monotoneSeconds / totalSeconds) * 60` |
| Visual | Ocean wave that the speaker "surfs" — pitch controls wave height |
| Feedback | Mascot rides the wave; wipes out on monotone sections |
| Difficulty | Easy: any variation counts. Hard: requires wider pitch range |

### 5. Stage Presence (formerly Statue Mode)

**Trains:** Composure (body language and stage presence)
**Duration:** 45-60 seconds
**Radar axis:** Composure
**GameType:** `'statue-mode'` (unchanged for backward compatibility)

| Mechanic | Detail |
|----------|--------|
| Goal | Speak with confident body language — open stance, purposeful gestures |
| Detection | `poseTracker.ts` detects posture, openness, gesture quality, stability, and bad habits (crossed arms, face-touching, fig-leaf, hands in pockets, hands behind back) |
| Scoring | `avgPresenceScore + min(20, streakSeconds * 0.5) - (badHabitCount * 3)` (falls back to old stillness formula for legacy data) |
| Visual | Skeleton overlay with power zone rectangle (shoulder-to-hip box), animated callouts (green for positive, red for negative body language) |
| Streak | Presence streak counter (flame icon) — increments while presence score ≥ 70, resets on bad habits |
| Sub-scores | Posture, Openness, Gestures, Stability — displayed as progress bars |
| Difficulty | Easy: relaxed fidget threshold. Medium: standard. Hard: ultra-strict + 60s duration |

---

## Scoring System

All games use a **0-100 scale**:

| Range | Label | Color |
|-------|-------|-------|
| 90-100 | Excellent | Gold |
| 70-89 | Great | Green |
| 50-69 | Good | Blue |
| 30-49 | Needs Work | Orange |
| 0-29 | Keep Practicing | Red |

Scores are computed by `gameScorer.ts` using per-game formulas (see table above).

---

## Difficulty Scaling

Difficulty auto-scales based on performance history in `gameStore`:

```
If last 3 scores average > 80 → difficulty up
If last 3 scores average < 40 → difficulty down
Otherwise → stay at current difficulty
```

Three levels: **Easy**, **Medium**, **Hard**. Each game adjusts thresholds accordingly.

---

## Prompt System

Before each game, users select a speaking prompt from 3 categories:

| Category | Example |
|----------|---------|
| Casual | "Tell a story about a time you tried something new" |
| Professional | "Explain a complex topic from your field to a beginner" |
| Interview | "What's your greatest strength and how has it helped you?" |

Prompts are tracked per session to avoid repetition (`sessionStore.usedPrompts`).

---

## Post-Game: ScoreCard

After each game, the ScoreCard displays:
- Overall score (0-100) with animated counter
- Key metrics breakdown specific to that game
- Actionable coaching tip based on performance
- Option to replay or continue to next game

---

## Badge System

11 badges unlock based on cumulative achievement:

| Badge | Condition |
|-------|-----------|
| First Scan | Complete 1 radar scan |
| First Game | Complete 1 mini-game |
| 7-Day Streak | Use the app 7 days in a row |
| 100 Club | Score 100 on any game |
| Filler-Free Minute | 60+ seconds without a filler word |
| Eye of the Tiger | 90%+ eye contact in Eye Lock |
| Smooth Operator | Score 85+ on Pace Racer |
| Voice Actor | Score 85+ on Pitch Surfer |
| Rock Solid | Score 90+ on Statue Mode |
| All-Rounder | Play all 5 games |
| Speech Master | 80+ overall radar score |

Badges are persisted in `sessionStore` and displayed on the Progress page.
