// ─── Cinematic Chrome — shared helpers + page chrome for Portfolio 1 ─────────
// Reduced-motion guards, Lenis smooth-scroll hook, split-text reveal, scroll
// counters, progress bar, noise overlay, magnetic wrapper, parallax orbs,
// SG clock, plus the new intro preloader, custom cursor, dots nav and
// back-to-top button.
import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Lenis from 'lenis'
import { Clock, ArrowUp } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

/* ── helpers ──────────────────────────────────────────────────────────────── */

export const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const isMobileQuery = () =>
  typeof window !== 'undefined' && window.innerWidth < 768

/** Module-level scroll progress (0→1) shared with the R3F scene */
export let scrollYProgress = 0

/** Module-level Lenis instance so chrome components can smooth-scroll */
let lenisInstance: Lenis | null = null

/** Smooth-scroll helper — uses Lenis when available, falls back to native */
export function lenisScrollTo(target: string | number) {
  if (lenisInstance) {
    lenisInstance.scrollTo(target as never, { duration: 1.4 })
    return
  }
  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: 'smooth' })
  } else {
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
  }
}

/* ── Lenis smooth scroll + GSAP ScrollTrigger sync ────────────────────────── */

export function useLenisScroll() {
  useEffect(() => {
    if (reducedMotion()) return

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })
    lenisInstance = lenis

    lenis.on('scroll', (e: { progress?: number }) => {
      ScrollTrigger.update()
      scrollYProgress = e.progress ?? 0
    })

    const raf = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      lenisInstance = null
      ScrollTrigger.getAll().forEach((st) => st.kill())
    }
  }, [])
}

/* ═══════════════════════════════════════════════════════════════════════════
   SPLIT REVEAL — reusable per-character GSAP animation
   ═══════════════════════════════════════════════════════════════════════════ */

export function SplitReveal({
  children,
  as: Tag = 'h2',
  className = '',
  style,
  stagger = 0.03,
  y = 60,
  delay = 0,
  start = 'top 80%',
}: {
  children: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  className?: string
  style?: React.CSSProperties
  stagger?: number
  y?: number
  delay?: number
  start?: string
}) {
  const ref = useRef<HTMLElement>(null)
  const id = useMemo(() => `sr-${Math.random().toString(36).slice(2, 9)}`, [])

  useGSAP(
    () => {
      if (reducedMotion() || !ref.current) return
      const chars = ref.current.querySelectorAll<HTMLElement>(`.${id}`)
      gsap.from(chars, {
        opacity: 0,
        y,
        rotateX: -90,
        stagger,
        duration: 1,
        ease: 'back.out(1.7)',
        delay,
        scrollTrigger: { trigger: ref.current, start },
      })
    },
    { scope: ref },
  )

  return (
    <Tag
      ref={ref as never}
      className={className}
      style={{ perspective: '600px', ...style }}
    >
      {children.split('').map((c, i) => (
        <span
          key={i}
          className={`${id} inline-block will-change-transform`}
          style={{ display: c === ' ' ? 'inline' : undefined }}
        >
          {c === ' ' ? '\u00A0' : c}
        </span>
      ))}
    </Tag>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   SCROLL COUNTER — numbers count up as they scroll into view
   ═══════════════════════════════════════════════════════════════════════════ */

export function ScrollCounter({
  value,
  suffix = '',
  prefix = '',
  className = '',
}: {
  value: number
  suffix?: string
  prefix?: string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const numRef = useRef({ val: 0 })

  useGSAP(() => {
    if (reducedMotion() || !ref.current) return
    gsap.to(numRef.current, {
      val: value,
      duration: 2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      onUpdate: () => {
        if (ref.current) {
          const v = numRef.current.val
          ref.current.textContent = `${prefix}${v % 1 !== 0 ? v.toFixed(1) : Math.round(v)}${suffix}`
        }
      },
    })
  })

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  )
}

/** Parse numeric value from strings like "$200K+", "30+", "99.9%" */
export function parseMetricValue(val: string): { num: number; prefix: string; suffix: string } | null {
  const m = val.match(/^([^0-9]*)([0-9]+(?:\.[0-9]+)?)(.*)$/)
  if (!m) return null
  return { prefix: m[1], num: parseFloat(m[2]), suffix: m[3] }
}

/* ═══════════════════════════════════════════════════════════════════════════
   NOISE GRAIN OVERLAY + HERO SCAN LINES
   ═══════════════════════════════════════════════════════════════════════════ */

export function NoiseOverlay() {
  return (
    <>
      {/* Full-page noise grain */}
      <svg
        className="pointer-events-none fixed inset-0 z-50 h-full w-full"
        style={{ opacity: 0.04, mixBlendMode: 'overlay' }}
        aria-hidden="true"
      >
        <filter id="cinematic-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#cinematic-noise)" />
      </svg>
      {/* Scan lines limited to hero viewport */}
      <div
        className="pointer-events-none absolute inset-0 z-[51] h-screen"
        style={{
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
          mixBlendMode: 'overlay',
        }}
        aria-hidden="true"
      />
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   SCROLL PROGRESS BAR — emerald → blue → violet gradient
   ═══════════════════════════════════════════════════════════════════════════ */

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!barRef.current) return
    gsap.to(barRef.current, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
      },
    })
  })

  return (
    <div className="fixed left-0 top-0 z-[60] h-[3px] w-full">
      <div
        ref={barRef}
        className="h-full w-full origin-left bg-gradient-to-r from-emerald-500 via-blue-500 to-violet-500 will-change-transform"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAGNETIC WRAPPER — translate toward cursor, spring back on leave
   ═══════════════════════════════════════════════════════════════════════════ */

export function Magnetic({
  children,
  className = '',
  href,
  as: Tag = 'a',
  onClick,
  target,
  rel,
}: {
  children: React.ReactNode
  className?: string
  href?: string
  as?: 'a' | 'div' | 'button'
  onClick?: () => void
  target?: string
  rel?: string
}) {
  const ref = useRef<HTMLElement>(null)

  const onMove = useCallback((e: React.MouseEvent) => {
    if (reducedMotion() || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const x = e.clientX - r.left - r.width / 2
    const y = e.clientY - r.top - r.height / 2
    gsap.to(ref.current, { x: x * 0.3, y: y * 0.3, duration: 0.4, ease: 'power2.out' })
  }, [])

  const onLeave = useCallback(() => {
    if (!ref.current) return
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,0.3)' })
  }, [])

  const tagProps: Record<string, unknown> = {
    ref,
    onMouseMove: onMove,
    onMouseLeave: onLeave,
    className: `inline-block will-change-transform ${className}`,
    onClick,
  }
  if (Tag === 'a') {
    tagProps.href = href
    tagProps.target = target
    tagProps.rel = rel
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Tag {...(tagProps as any)}>{children}</Tag>
}

/* ═══════════════════════════════════════════════════════════════════════════
   PARALLAX ORBS — translucent gradient spheres at different scroll speeds
   ═══════════════════════════════════════════════════════════════════════════ */

export function ParallaxOrbs() {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (reducedMotion() || !ref.current) return
    const orbs = ref.current.querySelectorAll<HTMLElement>('.parallax-orb')
    orbs.forEach((orb, i) => {
      gsap.to(orb, {
        y: -200 * (i + 1) * 0.4,
        ease: 'none',
        scrollTrigger: {
          trigger: document.documentElement,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
      })
    })
  })

  return (
    <div ref={ref} className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div
        className="parallax-orb absolute -left-[20%] top-[15%] h-[50vh] w-[50vh] rounded-full will-change-transform"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)' }}
      />
      <div
        className="parallax-orb absolute -right-[10%] top-[40%] h-[60vh] w-[60vh] rounded-full will-change-transform"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)' }}
      />
      <div
        className="parallax-orb absolute left-[30%] top-[70%] h-[45vh] w-[45vh] rounded-full will-change-transform"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)' }}
      />
      <div
        className="parallax-orb absolute right-[25%] top-[10%] h-[35vh] w-[35vh] rounded-full will-change-transform"
        style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 70%)' }}
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   SINGAPORE CLOCK CHIP
   ═══════════════════════════════════════════════════════════════════════════ */

export function SGClock() {
  const [t, setT] = useState('')

  useEffect(() => {
    const tick = () =>
      setT(
        new Date().toLocaleTimeString('en-SG', {
          timeZone: 'Asia/Singapore',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
      )
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-1.5 font-mono text-xs text-white/50">
      <Clock size={12} /> SGT {t}
    </span>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   INTRO PRELOADER — percentage counter, then curtain lift
   ═══════════════════════════════════════════════════════════════════════════ */

export function IntroLoader({
  onReveal,
  onDone,
}: {
  /** Fired when the curtain starts lifting — mount the page behind it */
  onReveal: () => void
  /** Fired when the curtain has fully left the viewport */
  onDone: () => void
}) {
  const [pct, setPct] = useState(0)
  const [gone, setGone] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const cb = useRef({ onReveal, onDone })

  useEffect(() => {
    cb.current = { onReveal, onDone }
  })

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    lenisInstance?.stop()
    const start = performance.now()
    const dur = 1300
    let raf = 0

    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1)
      setPct(Math.round(p * 100))
      if (p < 1) {
        raf = requestAnimationFrame(tick)
        return
      }
      // Content mounts behind the curtain right as it starts lifting
      cb.current.onReveal()
      gsap.to(overlayRef.current, {
        yPercent: -100,
        duration: 0.85,
        ease: 'power4.inOut',
        delay: 0.15,
        onComplete: () => {
          document.body.style.overflow = ''
          lenisInstance?.start()
          setGone(true)
          cb.current.onDone()
        },
      })
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      document.body.style.overflow = ''
      lenisInstance?.start()
    }
  }, [])

  if (gone) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#0a0a0a]"
      role="status"
      aria-label="Loading portfolio"
    >
      <div className="flex flex-col items-center gap-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.45em] text-white/40">
          EPOS V5 — Portfolio
        </span>
        <div className="h-px w-56 overflow-hidden bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-blue-500"
            style={{ width: `${pct}%`, transition: 'width 0.1s linear' }}
          />
        </div>
      </div>
      {/* Giant percentage, Snellenberg style */}
      <span
        className="pointer-events-none absolute bottom-4 right-8 select-none font-bold tabular-nums leading-none text-white/10"
        style={{ fontSize: 'clamp(5rem, 14vw, 11rem)' }}
      >
        {pct}
      </span>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   CUSTOM CURSOR — emerald dot + lagging ring (desktop, fine pointers only)
   ═══════════════════════════════════════════════════════════════════════════ */

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false)
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reducedMotion() || !window.matchMedia('(pointer: fine)').matches) return
    setEnabled(true)
  }, [])

  useEffect(() => {
    if (!enabled || !dotRef.current || !ringRef.current) return
    gsap.set([dotRef.current, ringRef.current], { xPercent: -50, yPercent: -50, x: -100, y: -100 })
    const ringX = gsap.quickTo(ringRef.current, 'x', { duration: 0.35, ease: 'power3.out' })
    const ringY = gsap.quickTo(ringRef.current, 'y', { duration: 0.35, ease: 'power3.out' })

    const move = (e: MouseEvent) => {
      gsap.set(dotRef.current, { x: e.clientX, y: e.clientY })
      ringX(e.clientX)
      ringY(e.clientY)
    }
    const over = (e: MouseEvent) => {
      const interactive = !!(e.target as HTMLElement).closest('a, button, [data-cursor]')
      gsap.to(ringRef.current, {
        scale: interactive ? 1.9 : 1,
        backgroundColor: interactive ? 'rgba(16,185,129,0.10)' : 'rgba(16,185,129,0)',
        duration: 0.3,
        ease: 'power2.out',
      })
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseover', over)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseover', over)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[150] h-1.5 w-1.5 rounded-full bg-emerald-400"
        aria-hidden="true"
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[149] h-9 w-9 rounded-full border border-emerald-400/40"
        aria-hidden="true"
      />
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   DOTS NAV — fixed right-side section navigation with labels
   ═══════════════════════════════════════════════════════════════════════════ */

const DOT_NAV = [
  { id: 'hero', label: 'Intro' },
  { id: 'about', label: 'About' },
  { id: 'career', label: 'Career' },
  { id: 'works', label: 'Works' },
  { id: 'skills', label: 'Skills' },
  { id: 'testimonials', label: 'Praise' },
  { id: 'contact', label: 'Contact' },
]

export function DotsNav() {
  const [active, setActive] = useState('hero')

  useEffect(() => {
    const els = DOT_NAV.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[]
    if (!els.length) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <nav
      className="fixed right-5 top-1/2 z-[80] hidden -translate-y-1/2 flex-col gap-4 md:flex"
      aria-label="Section navigation"
    >
      {DOT_NAV.map((n) => (
        <button
          key={n.id}
          onClick={() => lenisScrollTo(`#${n.id}`)}
          className="group relative flex items-center justify-end"
          aria-label={`Scroll to ${n.label}`}
        >
          <span className="absolute right-5 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.2em] text-white/0 transition-all duration-300 group-hover:-translate-x-1 group-hover:text-white/60">
            {n.label}
          </span>
          <span
            className={`block h-2 w-2 rounded-full transition-all duration-300 ${
              active === n.id
                ? 'scale-125 bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.6)]'
                : 'bg-white/20 group-hover:bg-white/50'
            }`}
          />
        </button>
      ))}
    </nav>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   BACK TO TOP — appears after the first screens
   ═══════════════════════════════════════════════════════════════════════════ */

export function BackToTop() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 900)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      onClick={() => lenisScrollTo(0)}
      aria-label="Back to top"
      className={`fixed bottom-6 right-6 z-[85] flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white/60 backdrop-blur-md transition-all duration-500 hover:border-emerald-500/40 hover:text-emerald-400 ${
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <ArrowUp size={18} />
    </button>
  )
}
