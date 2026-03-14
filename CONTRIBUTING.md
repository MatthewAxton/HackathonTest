# Contributing to SpeechMAX

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/MatthewAxton/HackathonTest.git
cd HackathonTest

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open **http://localhost:5173** in Chrome (camera/mic features require Chrome).

## Project Structure

```
src/
├── App.tsx                          # Main app — homepage + React Router
├── components/                      # Homepage components (dark theme)
│   ├── PaperWaveBackground.tsx
│   ├── BackgroundWaves.tsx
│   ├── Logo.tsx
│   ├── Particles.tsx
│   └── ...
├── screens/                         # Original onboarding screens (unused currently)
│   ├── Splash.tsx
│   ├── StepGoal.tsx
│   └── ...
├── gamification/                    # Gamification features (light theme)
│   ├── GamificationLayout.tsx       # Light theme wrapper for game routes
│   ├── gamification.css             # Scoped light theme styles
│   ├── components/
│   │   ├── Banner.tsx               # Top/Bottom gradient banners
│   │   ├── Mike.tsx                 # Mascot component
│   │   ├── CameraFeed.tsx           # Live webcam component
│   │   ├── AudioWave.tsx            # Audio visualizer
│   │   ├── GraceCountdown.tsx       # Pre-game countdown
│   │   ├── DevMenu.tsx              # Dev navigation (bottom-left)
│   │   └── radar-chart/             # Reusable radar chart
│   │       ├── RadarChart.tsx
│   │       ├── RadarOverlay.tsx      # Before/after comparison
│   │       ├── radarGeometry.ts      # Math/geometry utils
│   │       └── useRadarAnimation.ts  # Staggered animation hook
│   └── screens/
│       ├── RadarScan.tsx            # 30s speech scan
│       ├── RadarResults.tsx         # Radar chart results
│       ├── GameQueue.tsx            # Game dashboard
│       ├── Countdown.tsx            # Pre-game instructions
│       ├── FillerNinja.tsx          # Clarity game
│       ├── EyeLock.tsx              # Confidence game
│       ├── PaceRacer.tsx            # Pacing game
│       ├── PitchSurfer.tsx          # Expression game
│       ├── StatueMode.tsx           # Composure game
│       └── ScoreCard.tsx            # Post-game results
└── index.css                        # Global styles + Tailwind
```

## User Flow

```
/ (Homepage, dark theme)
  → START PRACTICING
    → Goal Select
      → START SESSION
        → /scan (30s speech scan, light theme)
          → /results (Radar chart)
            → /queue (Game dashboard)
              → /countdown?next=/filler-ninja
                → /filler-ninja (game)
                  → /score/filler (results)
                    → next game or back to /queue
```

## Routes

| Route | Screen | Theme |
|-------|--------|-------|
| `/` | Homepage + Goal Select | Dark |
| `/scan` | Radar Scan (camera) | Light |
| `/results` | Radar Results | Light |
| `/queue` | Game Dashboard | Light |
| `/countdown` | Pre-game instructions | Light |
| `/filler-ninja` | Filler Ninja game | Light |
| `/eye-lock` | Eye Lock game (camera) | Light |
| `/pace-racer` | Pace Racer game | Light |
| `/pitch-surfer` | Pitch Surfer game | Light |
| `/statue-mode` | Statue Mode game (camera) | Light |
| `/score/:game` | Score Card | Light |

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** (dev server + build)
- **Tailwind CSS v4**
- **Framer Motion** (animations)
- **React Router v7** (routing)
- **Lucide React** (icons)
- **anam-react-liquid-glass** (glass UI effects on homepage)

## Team Ownership (from PRD)

| Person | Owns | Area |
|--------|------|------|
| Anam | Analysis pipeline, app shell, routing, stores | `packages/analysis` + `apps/web` |
| Meng | Shared UI components, radar chart, mascot, camera | `packages/ui` |
| Bruno | All 5 games, game shell, score card | `packages/games` |
| Hugo | Mascot animations, sound FX, promo video | Assets only |

Work on separate files to avoid merge conflicts.

## Git Workflow

```bash
# Create a branch for your work
git checkout -b feature/your-feature-name

# Make your changes, then:
git add <specific-files>
git commit -m "Short description of what you did"
git push -u origin feature/your-feature-name
```

Then open a Pull Request on GitHub to merge into `main`.

## Important Notes

- **Homepage is protected** — don't modify `src/App.tsx` homepage sections or `src/components/` without checking with Meng
- **Dark theme** lives in `src/index.css` — the homepage uses inline dark styles
- **Light theme** lives in `src/gamification/gamification.css` — scoped under `.gamification-theme`
- **All timers are set to 3 seconds** for quick demo iteration
- **Camera screens** (`/scan`, `/eye-lock`, `/statue-mode`) request webcam permission on load
- **Dev menu** (purple button, bottom-left) lets you jump to any screen during development
- The app runs fully client-side — no backend, no API keys needed

## Build & Deploy

```bash
# Type check
npx tsc --noEmit

# Production build
npm run build

# Preview production build
npm run preview
```

Deployment target: **Vercel** (connect the GitHub repo, it auto-deploys on push to `main`).
