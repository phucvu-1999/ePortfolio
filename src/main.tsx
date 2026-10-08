import React, { StrictMode, lazy, Suspense, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import './index.css'
import './styles/themes.css'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './contexts/ToastContext'
import { AchievementsProvider } from './hooks/useAchievements'
import ToastContainer from './components/ToastContainer'
import PortfolioPage from './pages/PortfolioPage'
import CaseStudyPage from './pages/portfolio/CaseStudyPage'

// Lazy-loaded portfolio style variants
const Portfolio1Cinematic = lazy(() => import('./pages/Portfolio1Cinematic'))
const Portfolio2Minimal = lazy(() => import('./pages/Portfolio2Minimal'))
const Portfolio3Brutal = lazy(() => import('./pages/Portfolio3Brutal'))
const Portfolio4Bento = lazy(() => import('./pages/Portfolio4Bento'))
const AwesomePage = lazy(() => import('./pages/AwesomePage'))

// --- Animated route transition helpers ---
const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
}
const pageTransition = { duration: 0.3, ease: 'easeInOut' as const }

function PageWrap({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()

  // Scroll to top when the top-level portfolio variant changes
  const segment = location.pathname.split('/')[1] || 'home'
  useEffect(() => { window.scrollTo(0, 0) }, [segment])

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={segment}>
        <Route path="/" element={<Navigate to="/portfolio" replace />} />
        {/* Original portfolio (the existing interactive POS-themed page) */}
        <Route path="portfolio" element={<PageWrap><PortfolioPage /></PageWrap>}>
          <Route path="project/:slug" element={<CaseStudyPage />} />
        </Route>
        {/* Portfolio 1: Cinematic Scroll — GSAP + Lenis + R3F 3D */}
        <Route path="portfolio-1" element={<PageWrap><Portfolio1Cinematic /></PageWrap>}>
          <Route path="project/:slug" element={<CaseStudyPage />} />
        </Route>
        {/* Portfolio 2: Clean Minimalist — Brittany Chiang style */}
        <Route path="portfolio-2" element={<PageWrap><Portfolio2Minimal /></PageWrap>}>
          <Route path="project/:slug" element={<CaseStudyPage />} />
        </Route>
        {/* Portfolio 3: Neubrutalist — bold borders + pop colors */}
        <Route path="portfolio-3" element={<PageWrap><Portfolio3Brutal /></PageWrap>}>
          <Route path="project/:slug" element={<CaseStudyPage />} />
        </Route>
        {/* Portfolio 4: Bento Grid — Apple/Linear modular layout */}
        <Route path="portfolio-4" element={<PageWrap><Portfolio4Bento /></PageWrap>}>
          <Route path="project/:slug" element={<CaseStudyPage />} />
        </Route>
        {/* Awesome: flagship cinematic scrollytelling — recruiter first impression */}
        <Route path="awesome" element={<PageWrap><AwesomePage /></PageWrap>}>
          <Route path="project/:slug" element={<CaseStudyPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/portfolio" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

// The app is a single-purpose portfolio site — everything routes to /portfolio.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <ToastProvider>
          <AchievementsProvider>
            <ToastContainer />
            <Suspense fallback={<div className="fixed inset-0 bg-[#0a0a0f] flex items-center justify-center text-slate-400 font-mono text-sm">Loading...</div>}>
              <AnimatedRoutes />
            </Suspense>
          </AchievementsProvider>
        </ToastProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)

// Register service worker in production builds only
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => { /* silent */ })
  })
}
