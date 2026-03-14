import { Outlet } from 'react-router-dom'
import '../gamification/gamification.css'

export default function GamificationLayout() {
  return (
    <div className="gamification-theme" style={{ height: '100vh', overflow: 'hidden' }}>
      <Outlet />
    </div>
  )
}
