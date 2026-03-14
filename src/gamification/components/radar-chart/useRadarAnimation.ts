import { useState, useEffect, useRef } from 'react'
import type { RadarScores } from './radarGeometry'
import { AXIS_LABELS } from './radarGeometry'

/**
 * Hook that manages staggered radar animation.
 * Each axis animates from 0 to its target score over `duration` ms,
 * staggered by `stagger` ms per axis.
 */
export function useRadarAnimation(
  scores: RadarScores,
  animated: boolean = true,
  duration: number = 800,
  stagger: number = 150,
): RadarScores {
  const [current, setCurrent] = useState<RadarScores>(
    animated
      ? { clarity: 0, confidence: 0, pacing: 0, expression: 0, composure: 0 }
      : scores,
  )
  const rafRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    if (!animated) {
      setCurrent(scores)
      return
    }

    // Reset to 0
    setCurrent({ clarity: 0, confidence: 0, pacing: 0, expression: 0, composure: 0 })
    startTimeRef.current = performance.now()

    function tick(now: number) {
      const elapsed = now - startTimeRef.current
      const next: RadarScores = { clarity: 0, confidence: 0, pacing: 0, expression: 0, composure: 0 }
      let allDone = true

      AXIS_LABELS.forEach((key, i) => {
        const axisStart = i * stagger
        const axisElapsed = Math.max(0, elapsed - axisStart)
        const progress = Math.min(1, axisElapsed / duration)
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        next[key] = scores[key] * eased
        if (progress < 1) allDone = false
      })

      setCurrent(next)
      if (!allDone) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [scores, animated, duration, stagger])

  return current
}
