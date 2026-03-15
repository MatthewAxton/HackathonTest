/**
 * E3.R2 — Filler Word Detector
 * Scans transcripts for filler words and emits events.
 * Uses both interim and final results for fast detection.
 * Tracks per-segment detections to handle repeated words correctly.
 */
import type { FillerEvent, TranscriptEvent } from '../types'
import { onTranscript } from './transcriber'

type FillerCallback = (event: FillerEvent) => void

const SIMPLE_FILLERS = [
  // Vocal hesitations — the universal fillers
  'um', 'uh', 'uhh', 'umm', 'er', 'ah', 'hmm',
  // Discourse fillers — words used as crutches (no "like" — handled separately)
  'you know', 'i mean', 'basically', 'actually', 'right',
]

// "like" is only a filler when NOT used as verb/preposition
// Filler: "I was like going..." / "it's like really hard" / "like I don't know"
// Not filler: "I like pizza" / "looks like that" / "like a pro"
const LIKE_NOT_FILLER_BEFORE = /\b(i|we|they|you|he|she|it|who|would|might|could|don't|didn't|doesn't|do|does|really|also|still)\s+$/i
const LIKE_NOT_FILLER_AFTER = /^\s+(that|this|it|a|an|the|to|of|in|my|his|her|your|our|their)\b/i

// Build regex patterns — whole-word, case-insensitive
const FILLER_PATTERNS = SIMPLE_FILLERS.map((word) => ({
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

function countContextualLike(text: string): number {
  const likeRegex = /\blike\b/gi
  let count = 0
  let match: RegExpExecArray | null
  while ((match = likeRegex.exec(text)) !== null) {
    const before = text.slice(0, match.index)
    const after = text.slice(match.index + match[0].length)
    // Skip if preceded by subject/verb or followed by determiner/pronoun
    if (LIKE_NOT_FILLER_BEFORE.test(before)) continue
    if (LIKE_NOT_FILLER_AFTER.test(after)) continue
    count++
  }
  return count
}

function processTranscript(event: TranscriptEvent) {
  const text = event.text
  if (!text || text === lastInterimText) return
  lastInterimText = text

  // Check simple fillers
  for (const { word, regex } of FILLER_PATTERNS) {
    const currentCount = countMatches(text, regex)
    const previousCount = interimFillerCounts.get(word) || 0

    if (currentCount > previousCount) {
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

  // Check "like" with context awareness
  const likeCount = countContextualLike(text)
  const prevLikeCount = interimFillerCounts.get('like') || 0
  if (likeCount > prevLikeCount) {
    const newDetections = likeCount - prevLikeCount
    for (let i = 0; i < newDetections; i++) {
      totalFillerCount++
      subscribers.forEach((cb) => cb({
        word: 'like',
        timestamp: event.timestamp,
        index: totalFillerCount,
      }))
    }
    interimFillerCounts.set('like', likeCount)
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
