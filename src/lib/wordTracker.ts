// Word alignment engine for real-time reading tracker

export const SCAN_PASSAGE = "The most effective leaders are those who can communicate their vision clearly and inspire action not through authority but through the power of their words, the confidence of their delivery, and the authenticity of their message."

export const PASSAGE_WORDS = SCAN_PASSAGE.replace(/[.,!?;:]/g, '').toLowerCase().split(/\s+/)

/**
 * Given a spoken transcript, find how many passage words have been matched.
 * Uses greedy forward matching with fuzzy tolerance.
 */
export function matchWordsToPassage(spokenText: string): number {
  const spoken = spokenText.replace(/[.,!?;:]/g, '').toLowerCase().split(/\s+/).filter(Boolean)
  if (spoken.length === 0) return 0

  let passageIdx = 0

  for (const word of spoken) {
    if (passageIdx >= PASSAGE_WORDS.length) break

    // Exact match
    if (word === PASSAGE_WORDS[passageIdx]) {
      passageIdx++
      continue
    }

    // Fuzzy: check if word starts with same 3+ chars (handles partial recognition)
    if (word.length >= 3 && PASSAGE_WORDS[passageIdx].startsWith(word.slice(0, 3))) {
      passageIdx++
      continue
    }

    // Look ahead 1-2 words in passage (user may have skipped a word)
    for (let ahead = 1; ahead <= 2 && passageIdx + ahead < PASSAGE_WORDS.length; ahead++) {
      if (word === PASSAGE_WORDS[passageIdx + ahead] ||
          (word.length >= 3 && PASSAGE_WORDS[passageIdx + ahead].startsWith(word.slice(0, 3)))) {
        passageIdx += ahead + 1
        break
      }
    }

    // Filler words that don't match any passage word are simply ignored
  }

  return passageIdx
}
