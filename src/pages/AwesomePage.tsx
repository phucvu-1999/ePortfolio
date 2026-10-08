// ─── /awesome — flagship cinematic scrollytelling page ──────────────────────
// Research-informed: one jaw-dropping first impression tuned for the
// ~30-second recruiter scan. Kinetic-type hero → pinned impact numbers →
// pinned flagship case studies → current focus → oversized contact finale.
// Reuses the cinematic chrome (Lenis, intro curtain, noise) and shared
// profile/content data. No new dependencies.

import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import StyleSwitcher from '../components/StyleSwitcher'
import {
  useLenisScroll,
  reducedMotion,
  NoiseOverlay,
  IntroLoader,
} from './cinematic/CinematicChrome'
import { PORTFOLIO_PROFILE } from './portfolio/profile'
import {
  HeroScene,
  ImpactScene,
  WorksScene,
  FocusScene,
  ContactScene,
} from './awesome/AwesomeScenes'

gsap.registerPlugin(ScrollTrigger)

export default function AwesomePage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  /* Reduced-motion visitors skip the intro curtain entirely */
  const [revealed, setRevealed] = useState(() => reducedMotion())
  const [introDone, setIntroDone] = useState(() => reducedMotion())

  /* ── Lenis smooth scroll + sync with GSAP ScrollTrigger ────────────── */
  useLenisScroll()

  /* ── Title (re-set when returning from a nested case study) ─────────── */
  useEffect(() => {
    if (location.pathname === '/awesome') {
      document.title = `${PORTFOLIO_PROFILE.name} — ${PORTFOLIO_PROFILE.role}`
    }
  }, [location.pathname])

  /* ── Refresh ScrollTrigger once scenes mount behind the curtain ────── */
  useEffect(() => {
    if (!revealed) return
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [revealed])

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-[#0a0a0a] text-white selection:bg-emerald-500/30 selection:text-white"
    >
      {/* Intro curtain — percentage counter, then lifts to reveal the hero */}
      {!introDone && (
        <IntroLoader onReveal={() => setRevealed(true)} onDone={() => setIntroDone(true)} />
      )}

      {revealed && (
        <>
          <NoiseOverlay />
          <HeroScene />
          <ImpactScene />
          <WorksScene />
          <FocusScene />
          <ContactScene />
        </>
      )}

      {/* Style switcher dock (press 0–5 to jump between variants) */}
      <StyleSwitcher />

      {/* Case study overlay mount point */}
      <Outlet />

      {/* Marquee keyframes (scoped to this page's inline style) */}
      <style>{`
        @keyframes awesome-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .awesome-marquee-track { animation: none !important; }
        }
      `}</style>
    </div>
  )
}
