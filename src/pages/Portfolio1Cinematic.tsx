// ─── Portfolio 1 — Cinematic Scroll ─────────────────────────────────────────
// Dennis Snellenberg / Bruno Simon / Brandon Bartram inspired.
// GSAP ScrollTrigger + Lenis smooth scroll + React Three Fiber 3D hero.
//
// Modular layout:
//   ./cinematic/CinematicChrome.tsx   — Lenis hook, split reveal, intro loader,
//                                       custom cursor, dots nav, back-to-top
//   ./cinematic/CinematicScene.tsx    — R3F starfield + wireframe hero canvas
//   ./cinematic/CinematicHero.tsx     — hero / about / career sections
//   ./cinematic/CinematicWorks.tsx    — projects / skills sections
//   ./cinematic/CinematicFinale.tsx   — testimonials / contact / footer sections

import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import StyleSwitcher from '../components/StyleSwitcher'
import {
  useLenisScroll,
  reducedMotion,
  NoiseOverlay,
  ScrollProgress,
  ParallaxOrbs,
  IntroLoader,
  CustomCursor,
  DotsNav,
  BackToTop,
} from './cinematic/CinematicChrome'
import { HeroSection, AboutSection, CareerSection } from './cinematic/CinematicHero'
import { ProjectsSection, SkillsSection } from './cinematic/CinematicWorks'
import { TestimonialsSection, ContactSection, FooterSection } from './cinematic/CinematicFinale'

gsap.registerPlugin(ScrollTrigger)

const SECTION_FADE = 'cin-section transition-all duration-1000'
const FADE_STYLE = { opacity: 0, transform: 'translateY(40px)' } as const

export default function Portfolio1Cinematic() {
  const containerRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  /* Reduced-motion visitors skip the intro curtain entirely */
  const [revealed, setRevealed] = useState(() => reducedMotion())
  const [introDone, setIntroDone] = useState(() => reducedMotion())

  /* ── Lenis smooth scroll + sync with GSAP ScrollTrigger ────────────── */
  useLenisScroll()

  /* ── Title (re-set when returning from a nested case study) ─────────── */
  useEffect(() => {
    if (location.pathname === '/portfolio-1') {
      document.title = 'EPOS V5 — Cinematic Portfolio'
    }
  }, [location.pathname])

  /* ── Section fade-in observer — runs once the sections are mounted ──── */
  useEffect(() => {
    if (!revealed || reducedMotion()) return
    const sections = containerRef.current?.querySelectorAll('.cin-section')
    if (!sections?.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement
            el.style.opacity = '1'
            el.style.transform = 'translateY(0)'
          }
        })
      },
      { threshold: 0.1 },
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [revealed])

  /* ── Refresh ScrollTrigger once sections mount behind the curtain ──── */
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

      <CustomCursor />

      {revealed && (
        <>
          <NoiseOverlay />
          <ScrollProgress />
          <ParallaxOrbs />

          {/* Fixed section navigation (right edge, desktop) */}
          <DotsNav />
          <BackToTop />

          <HeroSection />

          <div className={SECTION_FADE} style={FADE_STYLE}>
            <AboutSection />
          </div>

          <CareerSection />
          <ProjectsSection />

          <div className={SECTION_FADE} style={FADE_STYLE}>
            <SkillsSection />
          </div>

          <div className={SECTION_FADE} style={FADE_STYLE}>
            <TestimonialsSection />
          </div>

          <div className={SECTION_FADE} style={FADE_STYLE}>
            <ContactSection />
          </div>

          <FooterSection />
        </>
      )}

      {/* Style switcher dock (press 0–4 to jump between variants) */}
      <StyleSwitcher />

      {/* Case study overlay mount point */}
      <Outlet />

      {/* Embedded keyframes for orbital skills + marquee + gradient shift */}
      <style>{`
        @keyframes orbit-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  )
}
