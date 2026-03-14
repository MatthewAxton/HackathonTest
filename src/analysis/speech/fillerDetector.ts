/**
 * E3.R2 — Filler Word Detector
 * Scans final transcripts for filler words and emits events.
 */
import type { FillerEvent, TranscriptEvent } from '../types'
import { onTranscript } from './transcriber'

type FillerCallback = (event: FillerEvent) => void

const FILLER_WORDS = [
  'um', 'uh', 'uhh', 'umm', 'er', 'ah', 'hmm',
  'like', 'you know', 'basically', 'right',
  'so', 'actually', 'literally', 'i mean',
  'kind of', 'sort of', 'well', 'okay so',
  'honestly', 'yeah', 'just', 'i guess',
]

// Build regex patterns — whole-word, case-insensitive
const FILLER_PATTERNS = FILLER_WORDS.map((word) => ({
  word,
  regex: new RegExp(`\\b${word.replace(/\s+/g, '\\s+')}\\b`, 'gi'),
}))

const subscribers = new Set<FillerCallback>()
let totalFillerCount = 0
let lastProcessedText = ''
let detectedPositions = new Set<string>()
let unsubTranscript: (() => void) | null = null

function processTranscript(event: TranscriptEvent) {
  const newText = event.text
  if (newText === lastProcessedText) return

  // For final transcripts, update baseline
  if (event.isFinal) {
    lastProcessedText = newText
  }

  for (const { word, regex } of FILLER_PATTERNS) {
    regex.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = regex.exec(newText)) !== null) {
      // Deduplicate: track by word+position to avoid double-firing
      const key = `${word}:${match.index}`
      if (detectedPositions.has(key)) continue
      detectedPositions.add(key)

      totalFillerCount++
      const fillerEvent: FillerEvent = {
        word,
        timestamp: event.timestamp,
        index: match.index,
      }
      subscribers.forEach((cb) => cb(fillerEvent))
    }
  }

  // Reset position tracking on final results to allow new detections
  if (event.isFinal) {
    detectedPositions = new Set()
  }
}

export function startFillerDetection(): void {
  totalFillerCount = 0
  lastProcessedText = ''
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
