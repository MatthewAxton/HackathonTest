export default function Particles() {
  const particles = [
    { size: 3, top: '12%', left: '8%', delay: '0s', duration: '14s' },
    { size: 2, top: '25%', left: '85%', delay: '2s', duration: '11s' },
    { size: 4, top: '60%', left: '15%', delay: '4s', duration: '16s' },
    { size: 2, top: '45%', left: '72%', delay: '1s', duration: '13s' },
    { size: 3, top: '80%', left: '45%', delay: '3s', duration: '12s' },
    { size: 2, top: '15%', left: '55%', delay: '5s', duration: '15s' },
    { size: 3, top: '70%', left: '88%', delay: '2.5s', duration: '14s' },
    { size: 2, top: '35%', left: '30%', delay: '6s', duration: '11s' },
    { size: 4, top: '90%', left: '20%', delay: '1.5s', duration: '13s' },
    { size: 2, top: '5%', left: '40%', delay: '3.5s', duration: '16s' },
  ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <div
          key={i}
          className="particle"
          style={{
            width: p.size,
            height: p.size,
            top: p.top,
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  )
}
