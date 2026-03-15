/**
 * E3.R2 — Filler Word Detector
 * Scans transcripts for filler words and emits events.
 * Uses both interim and final results for fast detection.
 * Tracks per-segment detections to handle repeated words correctly.
 */
import type { FillerEvent, TranscriptEvent } from '../types'
import { onTranscript } from './transcriber'

type FillerCallback = (event: FillerEvent) => void

const FILLER_WORDS = [
  // Vocal hesitations — the universal fillers
  'um', 'uh', 'uhh', 'umm', 'er', 'ah', 'hmm',
  // Discourse fillers — words used as crutches
  'like', 'you know', 'i mean', 'basically', 'actually', 'right',
]

// Build regex patterns — whole-word, case-insensitive
const FILLER_PATTERNS = FILLER_WORDS.map((word) => ({
  word,
  regex: new RegExp(`\\b${word.replace(/\s+/g, '\\s+')}\\b`, 'gi'),
}))

const subscribers = new Set<FillerCallback>()
let totalFillerCount = 0
let unsubTranscript: (() => void) | null = null

// Track what we've already detected in the current interim sequence
// Key: count of each filler word detected so far in the current segment
let interimFillerCounts = new Map<string, number>()
let lastInterimText = ''

function countMatches(text: string, regex: RegExp): number {
  regex.lastIndex = 0
  let count = 0
  while (regex.exec(text) !== null) count++
  return count
}

function processTranscript(event: TranscriptEvent) {
  const text = event.text
  if (!text || text === lastInterimText) return
  lastInterimText = text

  // For each filler word, count occurrences in current text
  // If count increased since last check, emit new detections
  for (const { word, regex } of FILLER_PATTERNS) {
    const currentCount = countMatches(text, regex)
    const previousCount = interimFillerCounts.get(word) || 0

    if (currentCount > previousCount) {
      // New filler(s) detected in this segment
      const newDetections = currentCount - previousCount
      for (let i = 0; i < newDetections; i++) {
        totalFillerCount++
        const fillerEvent: FillerEvent = {
          word,
          timestamp: event.timestamp,
          index: totalFillerCount,
        }
        subscribers.forEach((cb) => cb(fillerEvent))
      }
      interimFillerCounts.set(word, currentCount)
    }
  }

  // On final result, reset for next segment
  if (event.isFinal) {
    interimFillerCounts = new Map()
    lastInterimText = ''
  }
}

export function startFillerDetection(): void {
  totalFillerCount = 0
  interimFillerCounts = new Map()
  lastInterimText = ''
  unsubTranscript = onTranscript(processTranscript)
}

export function stopFillerDetection(): void {
  if (unsubTranscript) {
    unsubTranscript()
    unsubTranscript = null
  }
}

export function onFillerDetected(callback: FillerCallback): () => void {
  subscribers.add(callback)
  return () => { subscribers.delete(callback) }
}

export function getFillerCount(): number {
  return totalFillerCount
}
