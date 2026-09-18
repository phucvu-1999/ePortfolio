import { useState, useEffect, useRef, useCallback } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion'
import {
  ExternalLink, Star, Menu, X, Mail, Download, MapPin,
  ThumbsUp, Heart, Rocket, Clock, ArrowUpRight, ArrowUp,
} from 'lucide-react'
import {
  CAREER_CHAPTERS, PROJECTS, SKILLS_GRAPH, SKILL_CAT_LABELS,
  SOCIAL_LINKS, CONTACT_EMAIL, HERO_NAME, HERO_ROLE,
  TESTIMONIALS_DATA,
} from './portfolio/content'
import type { SkillCategory } from './portfolio/content'
import StyleSwitcher from '../components/StyleSwitcher'

/* ── Brand SVG icons (removed from lucide-react v1) ───────────────────── */
const GithubSvg = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
)
const LinkedinSvg = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)
const TwitterSvg = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

/* ── colours ────────────────────────────────────────────────────────────── */
const C = {
  bg:      '#0a192f',
  bgLight: '#112240',
  border:  '#1d2d50',
  text:    '#ccd6f6',
  muted:   '#8892b0',
  accent:  '#64ffda',
}

/* ── animation variants ────────────────────────────────────────────────── */
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

/* ── section config ────────────────────────────────────────────────────── */
const SECTIONS = ['about', 'experience', 'projects', 'skills', 'testimonials', 'contact'] as const

/* ── social icon map ───────────────────────────────────────────────────── */
const iconMap: Record<string, React.ReactNode> = {
  GitHub:   <GithubSvg size={20} />,
  LinkedIn: <LinkedinSvg size={20} />,
  Twitter:  <TwitterSvg size={20} />,
}

/* ── tech highlight pills for About ────────────────────────────────────── */
const TECH_PILLS = ['C#', '.NET 8', 'gRPC', 'React'] as const

/* ── quick facts for About ─────────────────────────────────────────────── */
const QUICK_FACTS = [
  { value: `${new Date().getFullYear() - 2020}+`, label: 'Years Exp.' },
  { value: '30+', label: 'Modules Shipped' },
  { value: '0', label: 'Incidents' },
  { value: 'SG', label: 'Location' },
] as const

/* ── hooks ─────────────────────────────────────────────────────────────── */

/** Typewriter effect — reveals text one character at a time with optional speed. */
function useTypewriter(text: string, speed = 55) {
  const [displayed, setDisplayed] = useState('')
  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      setDisplayed(text.slice(0, ++i))
      if (i >= text.length) clearInterval(timer)
    }, speed)
    return () => clearInterval(timer)
  }, [text, speed])
  return displayed
}

/** Live clock for Singapore timezone, updates every 30 s. */
function useSingaporeTime() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString('en-US', {
          timeZone: 'Asia/Singapore',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
      )
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])
  return time
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                                       */
/* ═══════════════════════════════════════════════════════════════════════ */
export default function Portfolio2Minimal() {
  const navigate = useNavigate()
  const location = useLocation()
  const [active, setActive] = useState<string>('about')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [hoveredProject, setHoveredProject] = useState<string | null>(null)
  const [showTop, setShowTop] = useState(false)
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  const typedRole = useTypewriter(HERO_ROLE)
  const sgTime = useSingaporeTime()

  /* ── Scroll progress ─────────────────────────────────────────────── */
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  /* ── IntersectionObserver for active nav ──────────────────────────── */
  const registerRef = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      sectionRefs.current[id] = el
    },
    [],
  )

  useEffect(() => {
    const els = Object.values(sectionRefs.current).filter(Boolean) as HTMLElement[]
    if (!els.length) return
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id) }),
      { rootMargin: '-40% 0px -55% 0px' },
    )
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  /* ── Back-to-top visibility ──────────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ── Title (re-set when returning from a nested case study) ──────── */
  useEffect(() => {
    if (location.pathname === '/portfolio-2') {
      document.title = 'EPOS V5 — Minimal Portfolio'
    }
  }, [location.pathname])

  const scrollTo = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth' })
    setMobileOpen(false)
  }

  /* ── derived data ────────────────────────────────────────────────── */
  const featured = PROJECTS.filter(p => p.featured)
  const otherProjects = PROJECTS.filter(p => !p.featured)

  const grouped = SKILLS_GRAPH.nodes.reduce<Record<SkillCategory, typeof SKILLS_GRAPH.nodes>>(
    (acc, n) => {
      ;(acc[n.category] ??= []).push(n)
      return acc
    },
    {} as Record<SkillCategory, typeof SKILLS_GRAPH.nodes>,
  )

  /* ═════════════════════════════════════════════════════════════════ */
  /*  RENDER                                                          */
  /* ═════════════════════════════════════════════════════════════════ */
  return (
    <div style={{ background: C.bg, color: C.text, minHeight: '100vh' }}>
      {/* ── scroll progress bar ──────────────────────────────────── */}
      <motion.div
        style={{
          scaleX,
          transformOrigin: '0%',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: C.accent,
          zIndex: 100,
        }}
      />

      {/* ── mobile header ────────────────────────────────────────── */}
      <header
        className="md:hidden fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: `${C.bg}ee`, backdropFilter: 'blur(10px)' }}
      >
        <span style={{ color: C.accent, fontFamily: 'monospace', fontWeight: 700, fontSize: 18 }}>
          {HERO_NAME}
        </span>
        <button onClick={() => setMobileOpen(o => !o)} aria-label="Toggle menu">
          {mobileOpen ? <X size={24} color={C.accent} /> : <Menu size={24} color={C.accent} />}
        </button>
      </header>

      {/* ── mobile nav drawer ────────────────────────────────────── */}
      {mobileOpen && (
        <nav
          className="md:hidden fixed inset-0 z-40 flex flex-col items-center justify-center gap-8"
          style={{ background: `${C.bgLight}f5` }}
        >
          {SECTIONS.map((s, i) => (
            <button
              key={s}
              onClick={() => scrollTo(s)}
              style={{
                fontFamily: 'monospace',
                fontSize: 14,
                color: active === s ? C.accent : C.muted,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <span style={{ color: C.accent }}>0{i + 1}.</span>{' '}
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </nav>
      )}

      {/* ── desktop split layout ─────────────────────────────────── */}
      <div className="flex">
        {/* ────────────────────────────────────────────────────────── */}
        {/*  LEFT SIDEBAR (fixed)                                     */}
        {/* ────────────────────────────────────────────────────────── */}
        <aside
          className="hidden md:flex flex-col justify-between fixed top-0 left-0 h-screen px-12 py-24"
          style={{ width: '40%' }}
        >
          <div>
            <h1 style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
              {HERO_NAME}
            </h1>

            {/* typewriter hero role */}
            <p
              style={{
                color: C.accent,
                fontSize: 18,
                fontFamily: 'monospace',
                marginBottom: 16,
                minHeight: 28,
              }}
            >
              {typedRole}
              <span className="typewriter-cursor" style={{ color: C.accent }}>
                |
              </span>
            </p>

            <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.6, maxWidth: 320 }}>
              I build mission-critical point-of-sale systems that process real money across
              multiple platforms — shipping enterprise software with zero financial incidents.
            </p>

            {/* availability badge */}
            <AvailabilityBadge />

            {/* nav links with animated sliding indicator */}
            <nav className="flex flex-col gap-3 mt-12">
              {SECTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => scrollTo(s)}
                  className="group flex items-center gap-3 relative"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    paddingBottom: 4,
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      height: 1,
                      width: active === s ? 64 : 32,
                      background: active === s ? C.accent : C.muted,
                      transition: 'all .3s',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'sans-serif',
                      fontSize: 13,
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: active === s ? C.accent : C.muted,
                      transition: 'color .3s',
                    }}
                  >
                    {s}
                  </span>
                  {active === s && (
                    <motion.div
                      layoutId="nav-indicator"
                      style={{
                        position: 'absolute',
                        left: 0,
                        bottom: 0,
                        height: 2,
                        width: '100%',
                        background: C.accent,
                        borderRadius: 1,
                      }}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </nav>

            {/* resume download button */}
            <a
              href="/resume.pdf"
              download
              className="inline-flex items-center gap-2 mt-8"
              style={{
                fontFamily: 'monospace',
                fontSize: 13,
                color: C.accent,
                border: `1px solid ${C.accent}`,
                borderRadius: 4,
                padding: '8px 16px',
                textDecoration: 'none',
                transition: 'background .2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = `${C.accent}15`)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Download size={14} /> Resume
            </a>
          </div>

          {/* social links with hover tooltips */}
          <div className="flex items-center gap-5">
            {SOCIAL_LINKS.map(l => (
              <div key={l.platform} className="relative group">
                <a
                  href={l.url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: C.muted, transition: 'color .2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = C.accent)}
                  onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
                >
                  {iconMap[l.platform]}
                </a>
                <span
                  className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{
                    background: C.bgLight,
                    color: C.accent,
                    fontFamily: 'monospace',
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 4,
                    whiteSpace: 'nowrap',
                    border: `1px solid ${C.border}`,
                  }}
                >
                  {l.platform}
                </span>
              </div>
            ))}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              style={{
                color: C.muted,
                fontFamily: 'monospace',
                fontSize: 13,
                transition: 'color .2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = C.accent)}
              onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </aside>

        {/* ────────────────────────────────────────────────────────── */}
        {/*  RIGHT SCROLLABLE CONTENT                                 */}
        {/* ────────────────────────────────────────────────────────── */}
        <main
          className="w-full md:ml-[40%] md:w-[60%] px-6 md:px-16 pt-24 md:pt-24 pb-32"
          style={{ maxWidth: 720 }}
        >
          {/* mobile availability badge (sidebar copy is desktop-only) */}
          <div className="md:hidden -mt-12 mb-10">
            <AvailabilityBadge />
          </div>

          {/* ── 01. About ────────────────────────────────────────── */}
          <section id="about" ref={registerRef('about')} className="mb-32">
            <SectionTitle num="01" title="About" />
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p style={{ color: C.muted, lineHeight: 1.7, marginBottom: 16 }}>
                I'm a software engineer who specialises in building enterprise-grade POS systems
                for Singapore retail. My journey started in {CAREER_CHAPTERS[0]?.year} at{' '}
                <Accent>{CAREER_CHAPTERS[0]?.company}</Accent>, where I shipped core transaction
                modules handling live money from day one.
              </p>
              <p style={{ color: C.muted, lineHeight: 1.7, marginBottom: 16 }}>
                Since then I've grown from building UI components to owning the entire money
                layer — <Accent>20+ payment strategies</Accent>, NETS terminal protocols, NTUC
                Linkpoints loyalty, and NEA government vouchers — with{' '}
                <Accent>zero financial incidents</Accent> across all integrations.
              </p>
              <p style={{ color: C.muted, lineHeight: 1.7, marginBottom: 24 }}>
                Today I lead the architecture of a <Accent>30+ module .NET 8 ecosystem</Accent>{' '}
                spanning 5 device types, 40+ gRPC microservices, and a payment telemetry pipeline
                — shipping enterprise software that processes real money every single day.
              </p>

              {/* tech highlight pills */}
              <div className="flex flex-wrap gap-3 mb-8">
                {TECH_PILLS.map(t => (
                  <span
                    key={t}
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 13,
                      color: C.accent,
                      border: `1px solid ${C.accent}`,
                      borderRadius: 9999,
                      padding: '5px 18px',
                      transition: 'box-shadow .2s, background .2s',
                      cursor: 'default',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = `0 0 14px ${C.accent}40`
                      e.currentTarget.style.background = `${C.accent}10`
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = 'none'
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* quick facts mini grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {QUICK_FACTS.map(f => (
                  <div
                    key={f.label}
                    style={{
                      background: C.bgLight,
                      borderRadius: 8,
                      padding: '16px 12px',
                      textAlign: 'center',
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 700,
                        color: C.accent,
                        fontFamily: 'monospace',
                      }}
                    >
                      {f.value}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: C.muted,
                        marginTop: 4,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {f.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* ── 02. Experience ────────────────────────────────────── */}
          <section id="experience" ref={registerRef('experience')} className="mb-32">
            <SectionTitle num="02" title="Experience" />
            <div className="relative" style={{ paddingLeft: 28 }}>
              {/* vertical connecting line */}
              <div
                style={{
                  position: 'absolute',
                  left: 7,
                  top: 8,
                  bottom: 8,
                  width: 2,
                  background: `${C.accent}25`,
                  borderRadius: 1,
                }}
              />

              <div className="flex flex-col gap-14">
                {CAREER_CHAPTERS.map((ch, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="relative"
                  >
                    {/* pulsing dot on the timeline */}
                    <span
                      style={{
                        position: 'absolute',
                        left: -24,
                        top: 8,
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: ch.color || C.accent,
                        border: `3px solid ${C.bg}`,
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          inset: -4,
                          borderRadius: '50%',
                          border: `2px solid ${ch.color || C.accent}50`,
                          animation: 'pulse-ring 2.5s ease-out infinite',
                        }}
                      />
                    </span>

                    {/* duration + details */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-6">
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: 13,
                          color: C.accent,
                          minWidth: 110,
                          paddingTop: 4,
                        }}
                      >
                        {ch.duration}
                      </span>

                      <div className="flex-1">
                        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 2 }}>
                          {ch.role}{' '}
                          <span style={{ color: C.accent }}>@ {ch.company}</span>
                        </h3>
                        <p
                          style={{
                            color: C.muted,
                            fontSize: 14,
                            lineHeight: 1.6,
                            marginBottom: 12,
                          }}
                        >
                          {ch.challenge}
                        </p>

                        {/* key metric stat pills */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {ch.metrics.map(m => (
                            <span
                              key={m.label}
                              style={{
                                fontFamily: 'monospace',
                                fontSize: 11,
                                color: C.text,
                                background: `${C.accent}12`,
                                border: `1px solid ${C.accent}30`,
                                borderRadius: 9999,
                                padding: '2px 10px',
                              }}
                            >
                              <strong style={{ color: C.accent }}>{m.value}</strong>{' '}
                              <span style={{ color: C.muted }}>{m.label}</span>
                            </span>
                          ))}
                        </div>

                        {/* skills pills */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {ch.skills.map(s => (
                            <span
                              key={s}
                              style={{
                                fontFamily: 'monospace',
                                fontSize: 12,
                                color: C.accent,
                                border: `1px solid ${C.accent}40`,
                                borderRadius: 9999,
                                padding: '2px 10px',
                              }}
                            >
                              {s}
                            </span>
                          ))}
                        </div>

                        {/* expandable project list */}
                        <button
                          onClick={() => setExpanded(expanded === i ? null : i)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontFamily: 'monospace',
                            fontSize: 13,
                            color: C.accent,
                            padding: 0,
                            marginTop: 4,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          {expanded === i
                            ? '− Hide projects'
                            : `+ ${ch.projects.length} projects`}
                        </button>

                        <AnimatePresence>
                          {expanded === i && (
                            <motion.ul
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: 'easeInOut' }}
                              className="overflow-hidden mt-4 flex flex-col gap-3"
                            >
                              {ch.projects.map((p, j) => (
                                <li
                                  key={j}
                                  style={{
                                    color: C.muted,
                                    fontSize: 13,
                                    lineHeight: 1.5,
                                    paddingLeft: 16,
                                    position: 'relative',
                                  }}
                                >
                                  <span
                                    style={{
                                      position: 'absolute',
                                      left: 0,
                                      top: 7,
                                      width: 6,
                                      height: 6,
                                      borderRadius: '50%',
                                      background: C.accent,
                                      opacity: 0.6,
                                    }}
                                  />
                                  <strong style={{ color: C.text }}>{p.name}</strong> — {p.desc}
                                  {p.badges && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {p.badges.map(b => (
                                        <span
                                          key={b}
                                          style={{
                                            fontFamily: 'monospace',
                                            fontSize: 10,
                                            color: C.accent,
                                            background: `${C.accent}10`,
                                            borderRadius: 4,
                                            padding: '1px 6px',
                                          }}
                                        >
                                          {b}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ── 03. Projects (featured) ──────────────────────────── */}
          <section id="projects" ref={registerRef('projects')} className="mb-32">
            <SectionTitle num="03" title="Projects" />

            {/* featured grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {featured.map((p, i) => (
                <motion.div
                  key={p.slug}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group relative"
                  style={{
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                    overflow: 'hidden',
                    cursor: 'default',
                    transition: 'border-color .2s, transform .2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = C.accent
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    setHoveredProject(p.slug)
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = C.border
                    e.currentTarget.style.transform = 'translateY(0)'
                    setHoveredProject(null)
                  }}
                >
                  {/* mock browser preview bar */}
                  <AnimatePresence>
                    {hoveredProject === p.slug && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 28, opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          background: C.bgLight,
                          borderBottom: `1px solid ${C.border}`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '0 10px',
                        }}
                      >
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f57' }} />
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#febc2e' }} />
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#28c840' }} />
                        <span
                          style={{
                            flex: 1,
                            marginLeft: 8,
                            background: C.bg,
                            borderRadius: 3,
                            fontSize: 10,
                            color: C.muted,
                            fontFamily: 'monospace',
                            padding: '2px 8px',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          epos.com.sg/{p.slug}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* hover image preview from the case study gallery */}
                  <AnimatePresence>
                    {hoveredProject === p.slug && p.caseStudy?.gallery?.[0] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 120, opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ overflow: 'hidden', borderBottom: `1px solid ${C.border}` }}
                      >
                        <img
                          src={p.caseStudy.gallery[0]}
                          alt={p.title}
                          loading="lazy"
                          style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div style={{ padding: 24 }}>
                    {/* featured badge */}
                    {p.featured && (
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: 10,
                          color: C.accent,
                          background: `${C.accent}15`,
                          border: `1px solid ${C.accent}40`,
                          borderRadius: 4,
                          padding: '2px 8px',
                          marginBottom: 12,
                          display: 'inline-block',
                          boxShadow: `0 0 8px ${C.accent}20`,
                        }}
                      >
                        ★ Featured
                      </span>
                    )}

                    <div className="flex items-start justify-between mb-3">
                      <h3
                        style={{
                          fontSize: 17,
                          fontWeight: 600,
                          lineHeight: 1.3,
                          flex: 1,
                          paddingRight: 8,
                        }}
                      >
                        {p.title}
                      </h3>
                      <ExternalLink
                        size={16}
                        style={{ color: C.muted, flexShrink: 0, marginTop: 2 }}
                      />
                    </div>

                    <p
                      style={{
                        color: C.muted,
                        fontSize: 13,
                        lineHeight: 1.6,
                        marginBottom: 12,
                      }}
                    >
                      {p.desc.length > 160 ? p.desc.slice(0, 160) + '…' : p.desc}
                    </p>

                    {/* case study metrics pills */}
                    {p.caseStudy?.metrics && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {p.caseStudy.metrics.slice(0, 3).map(m => (
                          <span
                            key={m.label}
                            style={{
                              fontFamily: 'monospace',
                              fontSize: 10,
                              color: C.accent,
                              background: `${C.accent}10`,
                              borderRadius: 4,
                              padding: '2px 8px',
                            }}
                          >
                            {m.value} {m.label.toLowerCase()}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {p.tags.slice(0, 4).map(t => (
                          <span
                            key={t}
                            style={{ fontFamily: 'monospace', fontSize: 11, color: C.muted }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <span
                        className="flex items-center gap-1"
                        style={{ color: C.muted, fontSize: 12 }}
                      >
                        <Star size={13} /> {p.stars}
                      </span>
                    </div>

                    {/* case study link */}
                    {p.caseStudy && (
                      <button
                        onClick={() => navigate(`/portfolio-2/project/${p.slug}`)}
                        className="flex items-center gap-1 mt-3"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontFamily: 'monospace',
                          fontSize: 12,
                          color: C.accent,
                          padding: 0,
                          transition: 'gap .2s',
                        }}
                      >
                        Case Study <ArrowUpRight size={12} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* other projects — compact list */}
            {otherProjects.length > 0 && (
              <div>
                <h3
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 14,
                    color: C.muted,
                    marginBottom: 12,
                  }}
                >
                  Other Noteworthy Projects
                </h3>
                <div className="flex flex-col gap-3">
                  {otherProjects.map((p, i) => (
                    <motion.div
                      key={p.slug}
                      variants={fadeUp}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                      className="flex items-center justify-between gap-4"
                      style={{
                        padding: '12px 16px',
                        borderRadius: 6,
                        border: `1px solid ${C.border}`,
                        transition: 'border-color .2s',
                        cursor: 'default',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = `${C.accent}60`)}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span style={{ fontSize: 14, fontWeight: 600 }}>{p.title}</span>
                          {p.caseStudy && (
                            <button
                              onClick={() => navigate(`/portfolio-2/project/${p.slug}`)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: C.accent,
                                padding: 0,
                              }}
                            >
                              <ArrowUpRight size={13} />
                            </button>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {p.tags.slice(0, 3).map(t => (
                            <span
                              key={t}
                              style={{ fontFamily: 'monospace', fontSize: 11, color: C.muted }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span
                        className="flex items-center gap-1"
                        style={{ color: C.muted, fontSize: 12, flexShrink: 0 }}
                      >
                        <Star size={13} /> {p.stars}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ── 04. Skills with animated bars ─────────────────────── */}
          <section id="skills" ref={registerRef('skills')} className="mb-32">
            <SectionTitle num="04" title="Skills" />
            <div className="flex flex-col gap-10">
              {(Object.keys(grouped) as SkillCategory[]).map((cat, ci) => (
                <motion.div
                  key={cat}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: ci * 0.1 }}
                >
                  <h3
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 14,
                      color: C.accent,
                      marginBottom: 14,
                      fontWeight: 600,
                    }}
                  >
                    {SKILL_CAT_LABELS[cat]}
                  </h3>
                  <div className="flex flex-col gap-3">
                    {grouped[cat].map((n, ni) => (
                      <div key={n.id} className="flex items-center gap-3">
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: 13,
                            color: C.text,
                            minWidth: 120,
                          }}
                        >
                          {n.label}
                        </span>
                        <div
                          style={{
                            flex: 1,
                            height: 6,
                            background: `${C.accent}12`,
                            borderRadius: 3,
                            overflow: 'hidden',
                          }}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${(n.level / 5) * 100}%` }}
                            viewport={{ once: true }}
                            transition={{
                              duration: 0.8,
                              delay: ci * 0.15 + ni * 0.05,
                              ease: 'easeOut',
                            }}
                            style={{
                              height: '100%',
                              background: C.accent,
                              borderRadius: 3,
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: 11,
                            color: C.muted,
                            minWidth: 24,
                            textAlign: 'right',
                          }}
                        >
                          {n.level}/5
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── 05. Testimonials ──────────────────────────────────── */}
          <section id="testimonials" ref={registerRef('testimonials')} className="mb-32">
            <SectionTitle num="05" title="Testimonials" />
            <div className="flex flex-col gap-6">
              {TESTIMONIALS_DATA.map((t, i) => (
                <motion.div
                  key={t.name}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  style={{
                    background: C.bgLight,
                    borderRadius: 8,
                    padding: '20px 24px',
                    border: `1px solid ${C.border}`,
                    borderLeft: `3px solid ${C.accent}`,
                  }}
                >
                  {/* header row: avatar / name / PR tag */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: `${C.accent}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'monospace',
                        fontSize: 13,
                        fontWeight: 700,
                        color: C.accent,
                        flexShrink: 0,
                      }}
                    >
                      {t.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>
                        {t.role} · {t.company}
                      </div>
                    </div>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: 11,
                        color: C.muted,
                        flexShrink: 0,
                      }}
                    >
                      PR #{t.pr} · {t.date}
                    </span>
                  </div>

                  {/* quote body */}
                  <p
                    style={{
                      color: C.muted,
                      fontSize: 14,
                      lineHeight: 1.7,
                      fontStyle: 'italic',
                      marginBottom: 12,
                    }}
                  >
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  {/* reactions bar */}
                  <div className="flex items-center gap-4">
                    <span
                      className="flex items-center gap-1"
                      style={{ fontSize: 12, color: C.muted }}
                    >
                      <ThumbsUp size={13} /> {t.reactions.thumbsUp}
                    </span>
                    <span
                      className="flex items-center gap-1"
                      style={{ fontSize: 12, color: C.muted }}
                    >
                      <Heart size={13} /> {t.reactions.heart}
                    </span>
                    <span
                      className="flex items-center gap-1"
                      style={{ fontSize: 12, color: C.muted }}
                    >
                      <Rocket size={13} /> {t.reactions.rocket}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── 06. Contact ──────────────────────────────────────── */}
          <section id="contact" ref={registerRef('contact')} className="mb-16">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center"
              style={{ maxWidth: 480, margin: '0 auto' }}
            >
              <p
                style={{
                  fontFamily: 'monospace',
                  fontSize: 14,
                  color: C.accent,
                  marginBottom: 12,
                }}
              >
                06. What's Next?
              </p>
              <h2 style={{ fontSize: 42, fontWeight: 700, marginBottom: 16 }}>Get In Touch</h2>
              <p
                style={{
                  color: C.muted,
                  fontSize: 15,
                  lineHeight: 1.7,
                  marginBottom: 20,
                }}
              >
                I'm always open to discussing new opportunities, interesting projects, or ways to
                collaborate on enterprise software challenges. Drop me a line!
              </p>

              {/* Singapore time chip + reply note */}
              <div className="flex items-center justify-center gap-4 mb-8 flex-wrap">
                <span
                  className="inline-flex items-center gap-2"
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 12,
                    color: C.muted,
                    background: C.bgLight,
                    border: `1px solid ${C.border}`,
                    borderRadius: 9999,
                    padding: '5px 14px',
                  }}
                >
                  <Clock size={13} color={C.accent} />
                  {sgTime} in Singapore
                </span>
                <span
                  className="inline-flex items-center gap-2"
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 12,
                    color: C.muted,
                    background: C.bgLight,
                    border: `1px solid ${C.border}`,
                    borderRadius: 9999,
                    padding: '5px 14px',
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#22c55e',
                      display: 'inline-block',
                    }}
                  />
                  Replies within 24h
                </span>
              </div>

              <a
                href={`mailto:${CONTACT_EMAIL}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontFamily: 'monospace',
                  fontSize: 15,
                  color: C.accent,
                  border: `2px solid ${C.accent}`,
                  borderRadius: 6,
                  padding: '14px 32px',
                  textDecoration: 'none',
                  transition: 'background .2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = `${C.accent}15`)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Mail size={16} /> Say Hello
              </a>

              {/* social links row */}
              <div className="flex items-center justify-center gap-5 mt-8">
                {SOCIAL_LINKS.map(l => (
                  <a
                    key={l.platform}
                    href={l.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: C.muted, transition: 'color .2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = C.accent)}
                    onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
                  >
                    {iconMap[l.platform]}
                  </a>
                ))}
              </div>
            </motion.div>
          </section>
        </main>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: `1px solid ${C.border}`,
          padding: '32px 24px',
          textAlign: 'center',
        }}
      >
        <div className="flex items-center justify-center gap-5 mb-4">
          {SOCIAL_LINKS.map(l => (
            <a
              key={l.platform}
              href={l.url || '#'}
              target="_blank"
              rel="noreferrer"
              style={{ color: C.muted, transition: 'color .2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = C.accent)}
              onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
            >
              {iconMap[l.platform]}
            </a>
          ))}
        </div>
        <div
          className="flex items-center justify-center gap-3 flex-wrap"
          style={{ fontSize: 12, color: C.muted, fontFamily: 'monospace' }}
        >
          <span className="inline-flex items-center gap-1">
            <MapPin size={12} /> Singapore
          </span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock size={12} /> {sgTime}
          </span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>Built with React + TypeScript</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>

      {/* ── back to top ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Back to top"
            style={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 90,
              width: 40,
              height: 40,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: C.bgLight,
              border: `1px solid ${C.accent}50`,
              color: C.accent,
              cursor: 'pointer',
            }}
          >
            <ArrowUp size={16} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── style switcher dock (press 0–4) ────────────────────────── */}
      <StyleSwitcher />

      {/* ── Outlet for case study overlays ─────────────────────────── */}
      <Outlet />

      {/* ── global styles ──────────────────────────────────────────── */}
      <style>{`
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: ${C.muted}; }
        ::selection { background: ${C.accent}30; color: ${C.text}; }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        .typewriter-cursor { animation: blink 1s step-end infinite; }
        @keyframes pulse-ring {
          0%   { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

/* ── helper components ──────────────────────────────────────────────────── */

function SectionTitle({ num, title }: { num: string; title: string }) {
  return (
    <h2
      className="flex items-center gap-3 mb-8"
      style={{ fontSize: 28, fontWeight: 700 }}
    >
      <span
        style={{
          fontFamily: 'monospace',
          fontSize: 18,
          color: C.accent,
          fontWeight: 400,
        }}
      >
        {num}.
      </span>
      {title}
      <span style={{ flex: 1, height: 1, background: C.border, marginLeft: 8 }} />
    </h2>
  )
}

function Accent({ children }: { children: React.ReactNode }) {
  return <span style={{ color: C.accent }}>{children}</span>
}

function AvailabilityBadge() {
  return (
    <div className="inline-flex items-center gap-2" style={{ marginTop: 12 }}>
      <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8 }}>
        <span
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: '#22c55e',
            animation: 'pulse-ring 2.5s ease-out infinite',
          }}
        />
        <span
          style={{
            position: 'relative',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#22c55e',
          }}
        />
      </span>
      <span style={{ fontFamily: 'monospace', fontSize: 12, color: C.accent }}>
        Available for new opportunities
      </span>
    </div>
  )
}
