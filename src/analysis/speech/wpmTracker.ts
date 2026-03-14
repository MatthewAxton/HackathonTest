/**
 * E3.R3 — WPM Tracker
 * Real-time WPM from interim speech results. No buffering delay.
 */
import type { TranscriptEvent } from '../types'
import { onTranscript } from './transcriber'

type WpmCallback = (wpm: { session: number; rolling: number }) => void

const subscribers = new Set<WpmCallback>()
let startTime = 0
let totalFinalWords = 0
let segmentStart = 0
let lastDisplayWpm = 0
let lastSpeechTime = 0
const wpmSamples: number[] = []
let intervalId: ReturnType<typeof setInterval> | null = null
let unsubTranscript: (() => void) | null = null

function processTranscript(event: TranscriptEvent) {
  if (startTime === 0) startTime = Date.now()
  lastSpeechTime = Date.now()

  const words = event.text.split(/\s+/).filter(Boolean).length

  if (event.isFinal) {
    totalFinalWords += words
    segmentStart = 0 // reset for next utterance
  } else {
    // Interim result: compute instant WPM from this utterance
    if (segmentStart === 0) segmentStart = Date.now()
    const elapsed = (Date.now() - segmentStart) / 1000
    if (elapsed > 0.3 && words > 0) {
      lastDisplayWpm = Math.round((words / elapsed) * 60)
    } else if (words > 0) {
      // Very start of utterance — estimate from word count
      lastDisplayWpm = Math.max(lastDisplayWpm, words * 40)
    }
  }
}

export function getSessionWpm(): number {
  if (startTime === 0 || totalFinalWords === 0) return 0
  const elapsedSeconds = (Date.now() - startTime) / 1000
  if (elapsedSeconds < 1) return 0
  return Math.round((totalFinalWords / elapsedSeconds) * 60)
}

export function getRollingWpm(): number {
  // If speaking recently, show live WPM
  // If silent for 4+ seconds, decay toward 0
  const silenceMs = Date.now() - lastSpeechTime
  if (silenceMs < 2000) return lastDisplayWpm
  if (silenceMs < 6000) {
    // Gentle decay
    const decay = 1 - (silenceMs - 2000) / 4000
    return Math.round(lastDisplayWpm * decay)
  }
  return 0
}

function emitReading() {
  const rolling = getRollingWpm()
  const reading = { session: getSessionWpm(), rolling }
  wpmSamples.push(rolling)
  subscribers.forEach((cb) => cb(reading))
}

export function getWpmStdDev(): number {
  if (wpmSamples.length < 2) return 0
  const mean = wpmSamples.reduce((a, b) => a + b, 0) / wpmSamples.length
  const variance = wpmSamples.reduce((sum, v) => sum + (v - mean) ** 2, 0) / wpmSamples.length
  return Math.sqrt(variance)
}

export function startWpmTracking(): void {
  startTime = 0
  totalFinalWords = 0
  segmentStart = 0
  lastDisplayWpm = 0
  lastSpeechTime = 0
  wpmSamples.length = 0
  unsubTranscript = onTranscript(processTranscript)
  intervalId = setInterval(emitReading, 300)
}

export function stopWpmTracking(): void {
  if (unsubTranscript) {
    unsubTranscript()
    unsubTranscript = null
  }
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

export function onWpmReading(callback: WpmCallback): () => void {
  subscribers.add(callback)
  return () => { subscribers.delete(callback) }
}
