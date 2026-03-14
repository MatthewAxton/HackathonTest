import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Download, Copy } from 'lucide-react'
import { renderShareCard } from '../../lib/renderShareCard'
import type { RadarScores } from './radar-chart/radarGeometry'

interface ShareModalProps {
  scores: RadarScores
  overall: number
  title: string
  subtitle?: string
  onClose: () => void
}

export function ShareModal({ scores, overall, title, onClose }: ShareModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      renderShareCard(canvasRef.current, scores, overall, title)
    }
  }, [scores, overall, title])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'speechmax-score.png'
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  const handleCopy = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    try {
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res))
      if (blob) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      }
    } catch {
      // Clipboard API may not be available
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 24, padding: 24, maxWidth: 660, width: '90%',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 18, fontWeight: 700 }}>Share Your Score</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <canvas
          ref={canvasRef}
          style={{ width: '100%', borderRadius: 12, marginBottom: 16 }}
        />

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={handleDownload}>
            <Download size={16} /> Download PNG
          </button>
          <button className="btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={handleCopy}>
            <Copy size={16} /> Copy to Clipboard
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
