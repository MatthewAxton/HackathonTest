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

/** FillerNinja filler detected: dramatic descending error buzz */
export function playFillerBuzz(): void {
  if (!soundEnabled) return
  const ac = getCtx()
  // Descending buzz: 400Hz→150Hz sawtooth
  const osc1 = ac.createOscillator()
  const g1 = ac.createGain()
  osc1.type = 'sawtooth'
  osc1.frequency.value = 400
  osc1.frequency.exponentialRampToValueAtTime(150, ac.currentTime + 0.15)
  g1.gain.value = 0.12
  osc1.connect(g1)
  g1.connect(ac.destination)
  osc1.start(ac.currentTime)
  g1.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.2)
  osc1.stop(ac.currentTime + 0.21)
  // Second layer: short square wave hit
  const osc2 = ac.createOscillator()
  const g2 = ac.createGain()
  osc2.type = 'square'
  osc2.frequency.value = 200
  g2.gain.value = 0.08
  osc2.connect(g2)
  g2.connect(ac.destination)
  osc2.start(ac.currentTime)
  g2.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.1)
  osc2.stop(ac.currentTime + 0.11)
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

/** Talking blip for character reveal (Animal Crossing style): random 300-500Hz sine, 30ms */
export function playTalkBlip(): void {
  const freq = 300 + Math.random() * 200
  playTone(freq, 30, 0.08)
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
