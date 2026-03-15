import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PaperWaveBackground from './components/PaperWaveBackground'
import GamificationLayout from './gamification/GamificationLayout'
import { TalkingBubble } from './gamification/components/Mike'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AuthProvider, useAuth } from './lib/auth'
import './App.css'

const RadarScan = lazy(() => import('./gamification/screens/RadarScan'))
const RadarResults = lazy(() => import('./gamification/screens/RadarResults'))
const GameQueue = lazy(() => import('./gamification/screens/GameQueue'))
const FillerNinja = lazy(() => import('./gamification/screens/FillerNinja'))
const EyeLock = lazy(() => import('./gamification/screens/EyeLock'))
const PaceRacer = lazy(() => import('./gamification/screens/PaceRacer'))
const PitchSurfer = lazy(() => import('./gamification/screens/PitchSurfer'))
const StatueMode = lazy(() => import('./gamification/screens/StagePresence'))
const ScoreCard = lazy(() => import('./gamification/screens/ScoreCard'))
const Onboarding = lazy(() => import('./gamification/screens/Onboarding'))
const Progress = lazy(() => import('./gamification/screens/Progress'))
const History = lazy(() => import('./gamification/screens/History'))
const Practice = lazy(() => import('./gamification/screens/Practice'))
const Library = lazy(() => import('./gamification/screens/Library'))
const Insights = lazy(() => import('./gamification/screens/Insights'))
const Settings = lazy(() => import('./gamification/screens/Settings'))

/* ====== ROOT APP WITH ROUTER ====== */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <AnimatedRoutes />
        </ErrorBoundary>
  
      </BrowserRouter>
    </AuthProvider>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{ height: '100vh', overflow: 'hidden' }}
      >
        <Suspense fallback={null}>
          <Routes location={location}>
            {/* YOUR HOMEPAGE — preserved exactly as-is */}
            <Route path="/" element={<Homepage />} />

            {/* GAMIFICATION ROUTES — teammate's screens, wrapped in light theme */}
            <Route element={<GamificationLayout />}>
              <Route path="/scan" element={<RadarScan />} />
              <Route path="/results" element={<RadarResults />} />
              <Route path="/queue" element={<GameQueue />} />
              <Route path="/filler-ninja" element={<FillerNinja />} />
              <Route path="/eye-lock" element={<EyeLock />} />
              <Route path="/pace-racer" element={<PaceRacer />} />
              <Route path="/pitch-surfer" element={<PitchSurfer />} />
              <Route path="/statue-mode" element={<StatueMode />} />
              <Route path="/score/:game" element={<ScoreCard />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/history" element={<History />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/library" element={<Library />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  )
}

/* ====== 404 NOT FOUND ====== */
function NotFound() {
  const nav = useNavigate()
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#050508', color: 'rgba(255,255,255,0.9)', fontFamily: 'Nunito, sans-serif' }}>
      <img src="/IDLE.gif" alt="Mike" style={{ width: 120, height: 120, marginBottom: 24 }} />
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Lost your way?</h1>
      <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>This page doesn't exist. Let's get you back on track.</p>
      <button onClick={() => nav('/')} style={{ background: '#c28fe7', color: 'white', border: 'none', padding: '12px 32px', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Go Home</button>
    </div>
  )
}

/* ====================================================================
   EVERYTHING BELOW IS YOUR ORIGINAL HOMEPAGE — UNCHANGED
   ==================================================================== */

function Homepage() {
  const navigate = useNavigate()
  const { signInWithGoogle, isAnonymous, isLoading } = useAuth()

  // If already authenticated (returning Google user), skip to onboarding/queue
  useEffect(() => {
    if (!isLoading && !isAnonymous) {
      navigate('/onboarding', { replace: true })
    }
  }, [isLoading, isAnonymous, navigate])

  const handleGuest = () => navigate('/onboarding')

  const handleGoogle = async () => {
    await signInWithGoogle()
  }

  return (
    <div
      className="h-full w-full relative overflow-hidden select-none"
      style={{ background: '#050508' }}
    >
      <PaperWaveBackground />

      {/* Mascot */}
      <motion.img
        src="/IDLE.gif"
        alt="mascot"
        className="absolute z-30 object-contain drop-shadow-lg pointer-events-none"
        animate={{
          left: '50%',
          top: '50%',
          width: 256,
          height: 256,
          x: '-50%',
          y: '-50%',
        }}
        transition={{ type: 'spring', stiffness: 80, damping: 18, mass: 1 }}
      />

      {/* Speech bubble */}
      <motion.div
        className="absolute z-30 pointer-events-none"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 1,
          scale: 1,
          left: '50%',
          top: 'calc(50% - 155px)',
          x: '-50%',
        }}
        transition={{ type: 'spring', stiffness: 80, damping: 18 }}
      >
        <div className="glass px-6 py-3 rounded-2xl">
          <SplashBubbleText />
        </div>
        <div
          className="absolute left-1/2 -translate-x-1/2 -bottom-[6px] w-0 h-0"
          style={{ borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '7px solid rgba(255,255,255,0.08)' }}
        />
      </motion.div>

      {/* Content */}
      <motion.div
        className="absolute inset-0 z-20 flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Logo */}
        <motion.h1
          className="text-[72px] font-bold tracking-tight text-center"
          style={{ color: '#f5f5f5' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Speech<span style={{ color: '#c28fe7' }}>MAX</span>
        </motion.h1>

        <div className="h-16" />
        <div style={{ height: 240 }} />
        <div className="h-8" />

        {/* Auth buttons */}
        <div className="w-full max-w-[320px] px-6 flex flex-col items-center gap-3">
          {/* Google Sign In */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            onClick={handleGoogle}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 18, padding: '14px 20px', cursor: 'pointer',
              fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.9)',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.14)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </motion.button>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '2px 0' }}
          >
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1 }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
          </motion.div>

          {/* Continue as Guest */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            onClick={handleGuest}
            style={{
              width: '100%',
              background: '#c28fe7',
              border: 'none',
              borderRadius: 18, padding: '14px 20px', cursor: 'pointer',
              fontSize: 15, fontWeight: 700, color: 'white',
              transition: 'filter 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
          >
            Continue as Guest
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.4 }}
            style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.25)', textAlign: 'center', lineHeight: 1.5, marginTop: 4 }}
          >
            Sign in to sync your progress across devices
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}

/* ====== SPLASH BUBBLE TEXT ====== */
function SplashBubbleText() {
  const [showSecond, setShowSecond] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowSecond(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <span className="text-[15px] font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
      <AnimatePresence mode="wait">
        {!showSecond ? (
          <motion.span key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <TalkingBubble text="Welcome to Speech<span style='color:#c28fe7'>MAX</span>!" />
          </motion.span>
        ) : (
          <motion.span key="speaking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <TalkingBubble text="Let's get you speaking!" />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}


