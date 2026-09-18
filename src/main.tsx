import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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

// The app is a single-purpose portfolio site — everything routes to /portfolio.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <ToastProvider>
          <AchievementsProvider>
            <ToastContainer />
            <Suspense fallback={<div className="fixed inset-0 bg-[#0a0a0f] flex items-center justify-center text-slate-400 font-mono text-sm">Loading...</div>}>
              <Routes>
                <Route path="/" element={<Navigate to="/portfolio" replace />} />
                {/* Original portfolio (the existing interactive POS-themed page) */}
                <Route path="portfolio" element={<PortfolioPage />}>
                  <Route path="project/:slug" element={<CaseStudyPage />} />
                </Route>
                {/* Portfolio 1: Cinematic Scroll — GSAP + Lenis + R3F 3D */}
                <Route path="portfolio-1" element={<Portfolio1Cinematic />}>
                  <Route path="project/:slug" element={<CaseStudyPage />} />
                </Route>
                {/* Portfolio 2: Clean Minimalist — Brittany Chiang style */}
                <Route path="portfolio-2" element={<Portfolio2Minimal />}>
                  <Route path="project/:slug" element={<CaseStudyPage />} />
                </Route>
                {/* Portfolio 3: Neubrutalist — bold borders + pop colors */}
                <Route path="portfolio-3" element={<Portfolio3Brutal />}>
                  <Route path="project/:slug" element={<CaseStudyPage />} />
                </Route>
                {/* Portfolio 4: Bento Grid — Apple/Linear modular layout */}
                <Route path="portfolio-4" element={<Portfolio4Bento />}>
                  <Route path="project/:slug" element={<CaseStudyPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/portfolio" replace />} />
              </Routes>
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
