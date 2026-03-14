import { useEffect, useRef, useCallback } from 'react'

interface WaveLayer {
  path: string
  fill: string
  highlight?: string
  // How far this layer moves (px per unit of mouse offset)
  parallax: number
  opacity: number
  // Gentle diagonal tilt in degrees
  rotate: number
  // Lerp factor — lower = more lag = deeper feel (0.01–0.08)
  ease: number
}

// Bottom layers — sweeping diagonally from bottom-left to top-right
const LAYERS: WaveLayer[] = [
  {
    path: 'M-200,580 C100,520 350,600 600,530 C850,460 1050,560 1300,490 C1550,420 1750,510 2000,450 L2000,1000 L-200,1000 Z',
    fill: '#080609',
    parallax: 6,
    opacity: 0.6,
    rotate: -3,
    ease: 0.012,
  },
  {
    path: 'M-200,480 C80,410 300,500 560,420 C820,340 1000,450 1250,380 C1500,310 1700,400 2000,350 L2000,1000 L-200,1000 Z',
    fill: '#0c0910',
    highlight: '#100c13',
    parallax: 10,
    opacity: 0.8,
    rotate: -2.5,
    ease: 0.018,
  },
  {
    path: 'M-200,560 C100,490 350,570 620,500 C890,430 1080,540 1320,470 C1560,400 1750,490 2000,440 L2000,1000 L-200,1000 Z',
    fill: '#110d15',
    highlight: '#16111a',
    parallax: 16,
    opacity: 0.85,
    rotate: -2,
    ease: 0.024,
  },
  {
    path: 'M-200,630 C80,570 330,640 580,580 C830,520 1030,620 1280,560 C1530,500 1730,580 2000,540 L2000,1000 L-200,1000 Z',
    fill: '#16111a',
    highlight: '#1c1421',
    parallax: 22,
    opacity: 0.9,
    rotate: -1.5,
    ease: 0.03,
  },
  {
    path: 'M-200,700 C100,650 370,710 620,660 C870,610 1060,700 1300,650 C1540,600 1730,680 2000,640 L2000,1000 L-200,1000 Z',
    fill: '#1a131f',
    highlight: '#201826',
    parallax: 28,
    opacity: 0.92,
    rotate: -1,
    ease: 0.035,
  },
  {
    path: 'M-200,770 C80,730 330,780 570,740 C810,700 1020,770 1270,730 C1520,690 1720,760 2000,720 L2000,1000 L-200,1000 Z',
    fill: '#1e1624',
    highlight: '#241a2a',
    parallax: 34,
    opacity: 0.95,
    rotate: -0.5,
    ease: 0.04,
  },
]

// Top layers — sweeping from top-right down
const TOP_LAYERS: WaveLayer[] = [
  {
    path: 'M-200,0 L2000,0 L2000,300 C1700,350 1400,270 1100,320 C800,370 550,280 300,340 C50,400 -100,310 -200,360 Z',
    fill: '#080609',
    parallax: 8,
    opacity: 0.5,
    rotate: 2.5,
    ease: 0.014,
  },
  {
    path: 'M-200,0 L2000,0 L2000,230 C1650,270 1350,210 1050,250 C750,290 500,220 250,260 C0,300 -100,240 -200,270 Z',
    fill: '#0c0910',
    highlight: '#100c13',
    parallax: 14,
    opacity: 0.65,
    rotate: 2,
    ease: 0.02,
  },
  {
    path: 'M-200,0 L2000,0 L2000,170 C1700,200 1400,160 1100,190 C800,220 550,170 300,200 C50,230 -100,180 -200,210 Z',
    fill: '#110d15',
    highlight: '#16111a',
    parallax: 20,
    opacity: 0.7,
    rotate: 1.5,
    ease: 0.026,
  },
]

export default function PaperWaveBackground() {
  const layerRefs = useRef<(SVGSVGElement | null)[]>([])
  // Raw mouse target (updated instantly on mousemove)
  const targetRef = useRef({ x: 0, y: 0 })
  // Smoothed mouse (lerps toward target — shared first-stage damping)
  const smoothMouseRef = useRef({ x: 0, y: 0 })
  // Per-layer current positions (each lerps toward smoothMouse at its own rate)
  const allLayers = [...TOP_LAYERS, ...LAYERS]
  const totalLayers = allLayers.length
  const layerPositions = useRef(allLayers.map(() => ({ x: 0, y: 0 })))
  const rafRef = useRef<number>(0)

  const animate = useCallback(() => {
    // Stage 1: smooth the raw mouse with heavy damping
    const sm = smoothMouseRef.current
    const tg = targetRef.current
    sm.x += (tg.x - sm.x) * 0.045
    sm.y += (tg.y - sm.y) * 0.045

    // Stage 2: each layer lerps toward smoothed mouse at its own rate
    for (let i = 0; i < totalLayers; i++) {
      const el = layerRefs.current[i]
      if (!el) continue

      const layer = allLayers[i]
      const pos = layerPositions.current[i]

      const layerTargetX = sm.x * layer.parallax
      const layerTargetY = sm.y * layer.parallax * 0.35

      pos.x += (layerTargetX - pos.x) * layer.ease
      pos.y += (layerTargetY - pos.y) * layer.ease

      el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) rotate(${layer.rotate}deg)`
    }

    rafRef.current = requestAnimationFrame(animate)
  }, [totalLayers, allLayers])

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      // Normalize to -1..1
      targetRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      targetRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }

    window.addEventListener('mousemove', handleMouseMove)
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [animate])

  let refIdx = 0

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ background: '#050508' }}
    >
      {/* Center dark clearance for readability */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 55% 45% at 50% 50%, rgba(5,5,8,0.94) 0%, transparent 100%)',
          zIndex: totalLayers + 1,
        }}
      />

      {/* Top layers */}
      {TOP_LAYERS.map((layer, i) => {
        const idx = refIdx++
        return (
          <svg
            key={`top-${i}`}
            ref={(el) => { layerRefs.current[idx] = el }}
            className="absolute will-change-transform"
            style={{
              top: '-5%',
              left: '-12%',
              width: '124%',
              height: '110%',
              opacity: layer.opacity,
              zIndex: i,
              transformOrigin: 'center center',
            }}
            viewBox="0 0 1800 900"
            preserveAspectRatio="none"
          >
            <defs>
              {layer.highlight && (
                <linearGradient id={`th${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={layer.highlight} stopOpacity="0.6" />
                  <stop offset="100%" stopColor={layer.fill} stopOpacity="0" />
                </linearGradient>
              )}
              <filter id={`ts${i}`}>
                <feDropShadow dx="2" dy="5" stdDeviation="8" floodColor="#000" floodOpacity="0.3" />
              </filter>
            </defs>
            <path d={layer.path} fill={layer.fill} filter={`url(#ts${i})`} />
            {layer.highlight && <path d={layer.path} fill={`url(#th${i})`} />}
          </svg>
        )
      })}

      {/* Bottom layers */}
      {LAYERS.map((layer, i) => {
        const idx = refIdx++
        return (
          <svg
            key={`btm-${i}`}
            ref={(el) => { layerRefs.current[idx] = el }}
            className="absolute will-change-transform"
            style={{
              top: '-5%',
              left: '-12%',
              width: '124%',
              height: '110%',
              opacity: layer.opacity,
              zIndex: TOP_LAYERS.length + i,
              transformOrigin: 'center center',
            }}
            viewBox="0 0 1800 900"
            preserveAspectRatio="none"
          >
            <defs>
              {layer.highlight && (
                <linearGradient id={`bh${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={layer.highlight} stopOpacity="0.5" />
                  <stop offset="30%" stopColor={layer.fill} stopOpacity="0" />
                </linearGradient>
              )}
              <filter id={`bs${i}`}>
                <feDropShadow dx="-2" dy="-4" stdDeviation="7" floodColor="#000" floodOpacity="0.35" />
              </filter>
            </defs>
            <path d={layer.path} fill={layer.fill} filter={`url(#bs${i})`} />
            {layer.highlight && <path d={layer.path} fill={`url(#bh${i})`} />}
          </svg>
        )
      })}
    </div>
  )
}
