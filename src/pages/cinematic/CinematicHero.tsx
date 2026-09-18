// ─── Cinematic Sections A — Hero · About · Career ────────────────────────────
// Portfolio 1 (Cinematic Scroll).
// Hero: R3F canvas backdrop, availability badge, char-split name, stat strip.
// About: scrub-driven word-by-word reveal. Career: pinned horizontal scroll.
import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ArrowDown } from 'lucide-react'
import { CAREER_CHAPTERS, HERO_NAME, HERO_ROLE } from '../portfolio/content'
import {
  reducedMotion,
  isMobileQuery,
  SplitReveal,
  ScrollCounter,
  parseMetricValue,
} from './CinematicChrome'
import { HeroCanvas } from './CinematicScene'

/* ═══════════════════════════════════════════════════════════════════════════
   1. HERO — 3D backdrop, availability badge, char-split name, stat strip
   ═══════════════════════════════════════════════════════════════════════════ */

const HERO_STATS = [
  { value: 7, suffix: '+', label: 'Years Shipping' },
  { value: 30, suffix: '+', label: 'POS Modules' },
  { value: 20, suffix: '+', label: 'Payment Methods' },
  { value: 0, suffix: '', label: 'Financial Incidents' },
]

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [showCanvas, setShowCanvas] = useState(false)

  useEffect(() => {
    setShowCanvas(!isMobileQuery() && !reducedMotion())
  }, [])

  useGSAP(
    () => {
      if (reducedMotion()) return
      const chars = gsap.utils.toArray<HTMLElement>('.hero-char')
      gsap.from(chars, {
        opacity: 0,
        y: 80,
        rotateX: -90,
        stagger: 0.04,
        duration: 1.2,
        ease: 'back.out(1.7)',
        delay: 0.45,
      })
      gsap.from('.hero-badge', {
        opacity: 0,
        y: -20,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.2,
      })
      gsap.from('.hero-role', {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: 'power3.out',
        delay: 1.0,
      })
      gsap.from('.hero-stat', {
        opacity: 0,
        y: 24,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out',
        delay: 1.2,
      })
      gsap.from('.hero-scroll-hint', {
        opacity: 0,
        y: -20,
        duration: 1,
        delay: 1.8,
        ease: 'power2.out',
      })
      // Parallax the hero content as user scrolls away
      gsap.to('.hero-content', {
        y: -120,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
    },
    { scope: sectionRef },
  )

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative flex h-screen items-center justify-center overflow-hidden"
    >
      {/* Radial gradient backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(16,185,129,0.08) 0%, transparent 70%)',
        }}
      />

      {showCanvas && <HeroCanvas />}

      <div className="hero-content relative z-10 flex flex-col items-center px-6 text-center will-change-transform">
        {/* Availability badge */}
        <span className="hero-badge mb-8 inline-flex items-center gap-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/[0.06] px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.25em] text-emerald-300 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Available for hire
        </span>

        <h1
          className="font-bold leading-none tracking-tighter text-white"
          style={{ fontSize: 'clamp(3rem, 8vw, 8rem)', perspective: '600px' }}
        >
          {HERO_NAME.split('').map((c, i) => (
            <span
              key={i}
              className="hero-char inline-block will-change-transform"
              style={{ display: c === ' ' ? 'inline' : undefined }}
            >
              {c === ' ' ? '\u00A0' : c}
            </span>
          ))}
        </h1>

        <p className="hero-role mt-6 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-lg font-medium tracking-widest text-transparent uppercase md:text-2xl">
          {HERO_ROLE}
        </p>

        {/* Stat strip */}
        <div className="mt-12 grid grid-cols-2 gap-y-6 sm:grid-cols-4 sm:divide-x sm:divide-white/10">
          {HERO_STATS.map((s) => (
            <div key={s.label} className="hero-stat flex flex-col items-center px-5 md:px-8">
              <span className="text-xl font-bold tabular-nums text-white md:text-3xl">
                <ScrollCounter value={s.value} suffix={s.suffix} />
              </span>
              <span className="mt-1 max-w-[110px] text-[10px] uppercase tracking-wider text-white/35 md:text-[11px]">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="hero-scroll-hint absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-white/30">
        <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <ArrowDown size={16} className="animate-bounce" />
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   2. ABOUT — parallax word reveal (scrub each word 0.15 → 1)
   ═══════════════════════════════════════════════════════════════════════════ */

const ABOUT_TEXT =
  'Building enterprise-grade POS systems that process real money, serve thousands of stores, and never go down. ' +
  'From NETS terminal protocols to government vouchers, every line of code is written with one rule: ' +
  'no financial discrepancies, no downtime, no excuses. ' +
  '30+ modules. 20+ payment methods. Zero incidents.'

export function AboutSection() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (reducedMotion()) return
      const words = gsap.utils.toArray<HTMLElement>('.about-word')
      gsap.fromTo(
        words,
        { opacity: 0.15 },
        {
          opacity: 1,
          stagger: 0.035,
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 80%',
            end: 'center 30%',
            scrub: true,
          },
        },
      )
    },
    { scope: ref },
  )

  return (
    <section id="about" ref={ref} className="relative py-40 px-6 md:px-16 lg:px-32">
      {/* Decorative accent */}
      <div className="mb-12 flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/40 to-transparent" />
        <span className="font-mono text-xs uppercase tracking-widest text-emerald-500/60">
          About
        </span>
      </div>

      <p
        className="max-w-4xl text-2xl font-light leading-relaxed text-white/80 md:text-4xl lg:text-5xl lg:leading-snug"
        style={{ willChange: 'transform' }}
      >
        {ABOUT_TEXT.split(' ').map((w, i) => (
          <span key={i} className="about-word mr-[0.3em] inline-block">
            {w}
          </span>
        ))}
      </p>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. CAREER TIMELINE — horizontal scroll with scroll counters
   ═══════════════════════════════════════════════════════════════════════════ */

function CareerCard({ chapter }: { chapter: (typeof CAREER_CHAPTERS)[number] }) {
  return (
    <div className="max-w-2xl border-l-2 pl-8" style={{ borderColor: chapter.color }}>
      <span className="font-mono text-sm tracking-wider text-white/30">{chapter.duration}</span>
      <h3 className="mt-3 text-3xl font-bold text-white md:text-5xl">{chapter.company}</h3>
      <p className="mt-1 text-lg font-medium text-white/50">{chapter.role}</p>
      <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/40">{chapter.challenge}</p>

      {/* Metrics with animated counters */}
      <div className="mt-8 flex flex-wrap gap-6">
        {chapter.metrics.map((m, i) => {
          const parsed = parseMetricValue(m.value)
          return (
            <div key={i}>
              <span className="block text-2xl font-bold tabular-nums" style={{ color: chapter.color }}>
                {parsed ? (
                  <ScrollCounter
                    value={parsed.num}
                    prefix={parsed.prefix}
                    suffix={parsed.suffix}
                    className="text-2xl font-bold tabular-nums"
                  />
                ) : (
                  m.value
                )}
              </span>
              <span className="text-[11px] uppercase tracking-wider text-white/30">{m.label}</span>
            </div>
          )
        })}
      </div>

      {/* Key projects */}
      <div className="mt-8 space-y-2">
        {chapter.projects.slice(0, 3).map((p) => (
          <div key={p.name} className="flex items-center gap-2 text-sm text-white/40">
            <div className="h-1 w-1 rounded-full" style={{ backgroundColor: chapter.color }} />
            {p.name}
          </div>
        ))}
        {chapter.projects.length > 3 && (
          <span className="text-xs text-white/20">+{chapter.projects.length - 3} more</span>
        )}
      </div>

      {/* Skills */}
      <div className="mt-6 flex flex-wrap gap-2">
        {chapter.skills.map((s) => (
          <span key={s} className="rounded-full border border-white/8 px-3 py-1 font-mono text-[11px] text-white/40">
            {s}
          </span>
        ))}
      </div>
    </div>
  )
}

export function CareerSection() {
  const wrapRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [mob, setMob] = useState(false)

  useEffect(() => setMob(isMobileQuery()), [])

  useGSAP(
    () => {
      if (reducedMotion() || mob || !trackRef.current || !wrapRef.current) return
      const totalScroll = trackRef.current.scrollWidth - window.innerWidth
      if (totalScroll <= 0) return
      gsap.to(trackRef.current, {
        x: -totalScroll,
        ease: 'none',
        scrollTrigger: {
          trigger: wrapRef.current,
          start: 'top top',
          end: () => `+=${totalScroll}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })
    },
    { scope: wrapRef, dependencies: [mob] },
  )

  if (mob) {
    return (
      <section id="career" className="px-6 py-24">
        <SplitReveal
          as="h2"
          className="mb-16 font-bold tracking-tighter text-white"
          style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}
        >
          Career
        </SplitReveal>
        <div className="space-y-16">
          {CAREER_CHAPTERS.map((ch, i) => (
            <CareerCard key={i} chapter={ch} />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section id="career" ref={wrapRef} className="relative overflow-hidden">
      <div
        ref={trackRef}
        className="flex h-screen items-center will-change-transform"
        style={{ width: `${(CAREER_CHAPTERS.length + 1) * 100}vw` }}
      >
        {/* Title panel */}
        <div className="flex h-full w-screen flex-shrink-0 items-center justify-center px-12">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-emerald-500/60">
              Timeline
            </span>
            <SplitReveal
              as="h2"
              className="mt-2 font-bold tracking-tighter text-white"
              style={{ fontSize: 'clamp(3rem, 6vw, 6rem)' }}
            >
              Career
            </SplitReveal>
            <div className="mt-4 h-px w-16 bg-emerald-500/40" />
          </div>
        </div>

        {/* Chapter panels */}
        {CAREER_CHAPTERS.map((ch, i) => (
          <div key={i} className="flex h-full w-screen flex-shrink-0 items-center px-12 md:px-20">
            <CareerCard chapter={ch} />
          </div>
        ))}
      </div>
    </section>
  )
}
