import { useEffect, useRef, useCallback } from 'react'

interface Blob {
  // Position as % of viewport
  cx: string
  cy: string
  // Size in px
  size: number
  // Color stops for radial gradient
  color: string
  // Blur amount
  blur: number
  // Parallax speed multiplier (higher = moves more)
  speed: number
  // Shape: border-radius
  borderRadius: string
  // Optional rotation
  rotate?: number
}

const BLOBS: Blob[] = [
  // Large deep purple sweep — bottom left
  {
    cx: '25%', cy: '65%', size: 700,
    color: 'radial-gradient(ellipse at 40% 50%, rgba(140,80,200,0.35) 0%, rgba(100,40,180,0.15) 40%, transparent 70%)',
    blur: 80, speed: 12, borderRadius: '50%',
  },
  // Bright teal/cyan accent — right center
  {
    cx: '75%', cy: '45%', size: 600,
    color: 'radial-gradient(ellipse at 50% 50%, rgba(60,200,220,0.25) 0%, rgba(40,160,200,0.1) 40%, transparent 70%)',
    blur: 70, speed: 18, borderRadius: '45% 55% 50% 50%',
  },
  // Warm purple glow — top center
  {
    cx: '45%', cy: '15%', size: 550,
    color: 'radial-gradient(ellipse at 50% 60%, rgba(180,120,230,0.2) 0%, rgba(150,80,210,0.08) 45%, transparent 70%)',
    blur: 60, speed: 10, borderRadius: '50% 50% 40% 60%',
  },
  // Deep blue base — bottom right
  {
    cx: '70%', cy: '80%', size: 650,
    color: 'radial-gradient(ellipse at 45% 45%, rgba(30,80,180,0.3) 0%, rgba(20,50,140,0.12) 40%, transparent 70%)',
    blur: 90, speed: 8, borderRadius: '55% 45% 50% 50%',
  },
  // Soft pink highlight — upper left
  {
    cx: '15%', cy: '30%', size: 400,
    color: 'radial-gradient(ellipse at 50% 50%, rgba(200,143,231,0.2) 0%, rgba(180,120,220,0.06) 50%, transparent 70%)',
    blur: 50, speed: 22, borderRadius: '50%',
  },
  // Very subtle green-teal — center
  {
    cx: '50%', cy: '50%', size: 800,
    color: 'radial-gradient(ellipse at 50% 50%, rgba(50,180,200,0.08) 0%, rgba(30,120,160,0.03) 40%, transparent 65%)',
    blur: 100, speed: 6, borderRadius: '50%',
  },
]

export default function InteractiveBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const blobRefs = useRef<(HTMLDivElement | null)[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const currentRef = useRef<{ x: number; y: number }[]>(BLOBS.map(() => ({ x: 0, y: 0 })))
  const rafRef = useRef<number>(0)

  const animate = useCallback(() => {
    const mx = mouseRef.current.x
    const my = mouseRef.current.y

    for (let i = 0; i < BLOBS.length; i++) {
      const blob = BLOBS[i]
      const el = blobRefs.current[i]
      if (!el) continue

      // Target position based on mouse and blob speed
      const targetX = mx * blob.speed
      const targetY = my * blob.speed

      // Lerp toward target (smooth damping)
      const cur = currentRef.current[i]
      cur.x += (targetX - cur.x) * 0.04
      cur.y += (targetY - cur.y) * 0.04

      el.style.transform = `translate(calc(-50% + ${cur.x}px), calc(-50% + ${cur.y}px))${blob.rotate ? ` rotate(${blob.rotate}deg)` : ''}`
    }

    rafRef.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      // Normalize to -1..1
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }

    window.addEventListener('mousemove', handleMouseMove)
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [animate])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ background: '#060610' }}
    >
      {/* Base gradient layer */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 100%, rgba(15,25,60,1) 0%, rgba(6,6,16,1) 60%)',
        }}
      />

      {/* Gradient blobs */}
      {BLOBS.map((blob, i) => (
        <div
          key={i}
          ref={(el) => { blobRefs.current[i] = el }}
          className="absolute will-change-transform"
          style={{
            left: blob.cx,
            top: blob.cy,
            width: blob.size,
            height: blob.size,
            background: blob.color,
            borderRadius: blob.borderRadius,
            filter: `blur(${blob.blur}px)`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* Subtle noise/grain overlay for texture */}
      <div
        className="absolute inset-0 mix-blend-soft-light opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
        }}
      />

      {/* Top vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(6,6,16,0.5) 0%, transparent 30%, transparent 70%, rgba(6,6,16,0.4) 100%)',
        }}
      />
    </div>
  )
}
