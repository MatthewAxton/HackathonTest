/**
 * Oscillator-based sound FX system.
 * Single shared AudioContext, lazy-created on first call.
 * All functions are fire-and-forget, self-cleaning.
 */

let ctx: AudioContext | null = null
let soundEnabled = true

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled
}

export function isSoundEnabled(): boolean {
  return soundEnabled
}

function playTone(freq: number, duration: number, gain: number, type: OscillatorType = 'sine') {
  if (!soundEnabled) return
  const ac = getCtx()
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.value = gain
  osc.connect(g)
  g.connect(ac.destination)
  osc.start(ac.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration / 1000)
  osc.stop(ac.currentTime + duration / 1000 + 0.01)
}

/** GraceCountdown each tick (5-1): 800Hz sine, 80ms */
export function playCountdownBeep(): void {
  playTone(800, 80, 0.15)
}

/** GraceCountdown "GO!" + Countdown "GO!": 1000Hz sine, 150ms */
export function playGoTone(): void {
  playTone(1000, 150, 0.2)
}

/** RadarScan scan begins: 200->400Hz frequency ramp, 150ms */
export function playScanStart(): void {
  if (!soundEnabled) return
  const ac = getCtx()
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = 'sine'
  osc.frequency.value = 200
  osc.frequency.linearRampToValueAtTime(400, ac.currentTime + 0.15)
  g.gain.value = 0.15
  osc.connect(g)
  g.connect(ac.destination)
  osc.start(ac.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15)
  osc.stop(ac.currentTime + 0.16)
}

/** RadarScan scan complete: C-E-G chord, 400ms */
export function playScanComplete(): void {
  if (!soundEnabled) return
  const freqs = [261, 329, 392]
  freqs.forEach(f => playTone(f, 400, 0.12))
}

/** FillerNinja filler detected: 150Hz sawtooth, 120ms */
export function playFillerBuzz(): void {
  playTone(150, 120, 0.15, 'sawtooth')
}

/** All games on timer expiry: ascending C5-E5-G5, 100ms each staggered 100ms */
export function playGameComplete(): void {
  if (!soundEnabled) return
  const ac = getCtx()
  const notes = [523, 659, 784]
  notes.forEach((freq, i) => {
    const osc = ac.createOscillator()
    const g = ac.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    g.gain.value = 0.15
    osc.connect(g)
    g.connect(ac.destination)
    const start = ac.currentTime + i * 0.1
    osc.start(start)
    g.gain.exponentialRampToValueAtTime(0.001, start + 0.1)
    osc.stop(start + 0.11)
  })
}

/** Badge earned: 1200Hz->1600Hz sine, 250ms */
export function playBadgeEarned(): void {
  if (!soundEnabled) return
  const ac = getCtx()
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = 'sine'
  osc.frequency.value = 1200
  osc.frequency.linearRampToValueAtTime(1600, ac.currentTime + 0.25)
  g.gain.value = 0.18
  osc.connect(g)
  g.connect(ac.destination)
  osc.start(ac.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.25)
  osc.stop(ac.currentTime + 0.26)
}
