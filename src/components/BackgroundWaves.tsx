import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function BackgroundWaves() {
  const [_mouse, setMouse] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const smoothX = useSpring(mx, { stiffness: 40, damping: 20 })
  const smoothY = useSpring(my, { stiffness: 40, damping: 20 })

  useEffect(() => {
    function handleMove(e: MouseEvent) {
      // Normalize to -1 to 1
      const nx = (e.clientX / window.innerWidth - 0.5) * 2
      const ny = (e.clientY / window.innerHeight - 0.5) * 2
      mx.set(nx)
      my.set(ny)
      setMouse({ x: nx, y: ny })
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [mx, my])

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main background — moves with cursor */}
      <motion.div
        className="absolute"
        style={{
          // Oversize so parallax shift doesn't reveal edges
          top: '-10%',
          left: '-10%',
          width: '120%',
          height: '120%',
          x: useSpring(mx, { stiffness: 30, damping: 25 }).get() !== undefined ? smoothX as any : 0,
          y: useSpring(my, { stiffness: 30, damping: 25 }).get() !== undefined ? smoothY as any : 0,
        }}
      >
        <motion.img
          src="/bg2.png"
          className="w-full h-full object-cover"
          style={{
            x: smoothX as any,
            y: smoothY as any,
            scale: 1.1,
            filter: 'hue-rotate(260deg) saturate(0.8) brightness(0.7)',
          }}
        />
      </motion.div>

      {/* Second layer — moves faster for depth */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 30% 50%, rgba(194,143,231,0.12) 0%, transparent 60%)',
        }}
      >
        <motion.div
          className="w-full h-full"
          style={{
            x: smoothX as any,
            y: smoothY as any,
          }}
        />
      </motion.div>

      {/* Floating orbs that react to cursor at different speeds */}
      {[
        { size: 500, x: '20%', y: '30%', color: 'rgba(194,143,231,0.08)', speed: 30, blur: 120 },
        { size: 400, x: '70%', y: '60%', color: 'rgba(194,143,231,0.06)', speed: 20, blur: 100 },
        { size: 300, x: '50%', y: '20%', color: 'rgba(168,120,210,0.05)', speed: 40, blur: 80 },
      ].map((orb, i) => {
        const orbX = useSpring(mx, { stiffness: orb.speed, damping: 20 })
        const orbY = useSpring(my, { stiffness: orb.speed, damping: 20 })
        return (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: orb.size,
              height: orb.size,
              left: orb.x,
              top: orb.y,
              background: orb.color,
              filter: `blur(${orb.blur}px)`,
              x: orbX as any,
              y: orbY as any,
              translateX: '-50%',
              translateY: '-50%',
            }}
          />
        )
      })}

      {/* Dark overlay to keep text readable */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, rgba(10,10,15,0.3) 0%, rgba(10,10,15,0.6) 100%)' }}
      />
    </div>
  )
}
