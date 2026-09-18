import { useRef, useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react'
import { Link as RouterLink, Outlet } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useInView, useScroll, useTransform, animate, AnimatePresence } from 'framer-motion'
import { Mail, Globe, Link, Send, Copy, Check, ArrowUp, ChevronRight, ChevronDown, File, Folder, Star, GitBranch, X, ExternalLink } from 'lucide-react'
import GrafanaDashboard from '../components/GrafanaDashboard'
import ProjectVisual from '../components/ProjectVisual'
import ShortcutsHelp from '../components/ShortcutsHelp'
import GuestbookMarquee from '../components/GuestbookMarquee'
import KanbanBoard from '../components/KanbanBoard'
import ThemeToggle from '../components/ThemeToggle'
import CommandPalette from '../components/CommandPalette'
import InteractiveTerminal from '../components/InteractiveTerminal'
import CustomCursor from '../components/CustomCursor'
import StyleSwitcher from '../components/StyleSwitcher'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../contexts/ToastContext'
import { useEasterEggs, CrtOverlay } from '../hooks/useEasterEggs'
import { AchievementDrawer } from '../hooks/useAchievements'
import { CAREER_CHAPTERS, PROJECTS, TESTIMONIALS_DATA, SKILLS_GRAPH, SKILL_CAT_COLORS, SKILL_CAT_LABELS, SOCIAL_LINKS, CONTACT_EMAIL, HERO_NAME, HERO_ROLE, CONTENT_FLAGS } from './portfolio/content'
import SectionHeader from './portfolio/SectionHeader'
import MarqueeBand from './portfolio/MarqueeBand'
import type { SkillCategory, SkillNode } from './portfolio/content'
import { usePortfolioSEO } from './portfolio/seo'
import { downloadResume } from './portfolio/resume'
import { useI18n } from './portfolio/i18n'

// Heavy interactive sections are code-split — loaded only when the page mounts them
const ContributionGraph = lazy(() => import('../components/ContributionGraph'))
const CodePlayground = lazy(() => import('../components/CodePlayground'))
const TenderWall = lazy(() => import('./portfolio/TenderWall'))
const LoyaltyVault = lazy(() => import('./portfolio/LoyaltyVault'))
const SkillCheckout = lazy(() => import('./portfolio/SkillCheckout'))
const SelectedWorks = lazy(() => import('./portfolio/SelectedWorks'))

// Static gradient hero backdrop — zero-JS, GPU-friendly, keeps scrolling buttery
function ParticleFallback() {
  return <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0d1a12] to-[#0a0a0f]" aria-hidden />
}

function SectionFallback() {
  return <div className="h-[420px] rounded-2xl border border-slate-800/60 bg-slate-900/20 animate-pulse" aria-hidden />
}

// ─── Data ───────────────────────────────────────────────────────────────────
const SECTIONS = ['Hero', 'Skill Checkout', 'About', 'Chronicle', 'Money Layer', 'Loyalty Vault', 'Metrics', 'Activity', 'Skills', 'Works', 'Explorer', 'The Lab', 'Reviews', 'Kanban', 'Contact', 'Footer']

// Per-section accent colors — shared by headers, ambient glows and navigation
const SECTION_ACCENTS: Record<string, string> = {
  'Skill Checkout': '#ec4899',
  Chronicle: '#f59e0b',
  'Money Layer': '#10b981',
  'Loyalty Vault': '#14b8a6',
  Metrics: '#3b82f6',
  Activity: '#22c55e',
  Skills: '#8b5cf6',
  Works: '#eab308',
  Explorer: '#0ea5e9',
  'The Lab': '#f97316',
  Reviews: '#f43f5e',
  Kanban: '#06b6d4',
}

// SVG noise data-uri (extremely subtle grain)
const NOISE = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E\")"

// Section-specific ambient glows (index = active section). Crossfaded by opacity.
const SECTION_GLOWS = [
  // 0 Hero — emerald glow at top-center
  'radial-gradient(circle at 50% 12%, rgba(16,185,129,0.20), transparent 55%)',
  // 1 Skill Checkout — pink retail glow
  'radial-gradient(circle at 55% 35%, rgba(236,72,153,0.15), transparent 52%), radial-gradient(circle at 30% 70%, rgba(59,130,246,0.08), transparent 50%)',
  // 2 About — blue glow at center-left
  'radial-gradient(circle at 14% 50%, rgba(59,130,246,0.18), transparent 55%)',
  // 3 Chronicle — amber timeline glow
  'radial-gradient(circle at 62% 38%, rgba(245,158,11,0.14), transparent 55%), radial-gradient(circle at 25% 60%, rgba(139,92,246,0.10), transparent 50%)',
  // 4 Money Layer — emerald money glow
  'radial-gradient(circle at 50% 40%, rgba(16,185,129,0.16), transparent 52%)',
  // 5 Loyalty Vault — teal vault glow
  'radial-gradient(circle at 30% 55%, rgba(20,184,166,0.15), transparent 52%), radial-gradient(circle at 72% 30%, rgba(59,130,246,0.10), transparent 50%)',
  // 6 Metrics — blue dashboard glow
  'radial-gradient(circle at 40% 50%, rgba(59,130,246,0.15), transparent 50%), radial-gradient(circle at 75% 40%, rgba(16,185,129,0.10), transparent 48%)',
  // 7 Activity — green commit glow
  'radial-gradient(circle at 35% 45%, rgba(34,197,94,0.14), transparent 52%), radial-gradient(circle at 70% 55%, rgba(16,185,129,0.10), transparent 48%)',
  // 8 Skills — violet galaxy glow
  'radial-gradient(circle at 30% 40%, rgba(139,92,246,0.15), transparent 50%), radial-gradient(circle at 70% 60%, rgba(16,185,129,0.11), transparent 50%)',
  // 9 Works — golden editorial glow
  'radial-gradient(circle at 40% 45%, rgba(234,179,8,0.12), transparent 52%), radial-gradient(circle at 70% 40%, rgba(245,158,11,0.08), transparent 48%)',
  // 10 Explorer — sky-blue explorer glow
  'radial-gradient(circle at 22% 50%, rgba(14,165,233,0.15), transparent 48%), radial-gradient(circle at 78% 55%, rgba(59,130,246,0.13), transparent 48%)',
  // 11 The Lab — amber experiment glow
  'radial-gradient(circle at 45% 40%, rgba(249,115,22,0.13), transparent 52%), radial-gradient(circle at 75% 60%, rgba(245,158,11,0.10), transparent 48%)',
  // 12 Reviews — rose review glow
  'radial-gradient(circle at 50% 50%, rgba(244,63,94,0.12), transparent 55%)',
  // 13 Kanban — cyan board glow
  'radial-gradient(circle at 35% 45%, rgba(6,182,212,0.14), transparent 50%), radial-gradient(circle at 70% 55%, rgba(245,158,11,0.11), transparent 50%)',
  // 14 Contact — violet glow at bottom
  'radial-gradient(circle at 50% 88%, rgba(139,92,246,0.20), transparent 55%)',
  // 15 Footer — soft emerald at bottom
  'radial-gradient(circle at 50% 92%, rgba(16,185,129,0.12), transparent 55%)',
]

// ═══════════════════════════════════════════════════════════════════════════
// ─── SMALL FX HELPERS ────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

// Scroll-triggered reveal wrapper — fades + slides children in when they enter
// the viewport. Inspired by every top Awwwards portfolio (Brittany Chiang,
// Dennis Snellenberg, Brandon Bartram). Uses GPU-only properties for 60fps.
function RevealOnScroll({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  )
}

// Text scramble / decode effect
function ScrambleText({ text, className }: { text: string; className?: string }) {
  const [display, setDisplay] = useState(() => text.split('').map(() => ' ').join(''))
  useEffect(() => {
    const glyphs = '!<>-_\\/[]{}—=+*^?#01АБ▓░█'
    const reveal = text.split('').map((_, i) => 10 + i * 2.4 + Math.random() * 10)
    const max = Math.max(...reveal)
    let frame = 0
    let raf = 0
    const tick = () => {
      let out = ''
      for (let i = 0; i < text.length; i++) {
        if (text[i] === ' ') out += ' '
        else if (frame >= reveal[i]) out += text[i]
        else out += glyphs[Math.floor(Math.random() * glyphs.length)]
      }
      setDisplay(out)
      frame++
      if (frame <= max + 1) raf = requestAnimationFrame(tick)
      else setDisplay(text)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [text])
  return (
    <span className={className} aria-label={text}>
      {display.split('').map((c, i) => (
        <span key={i} className="inline-block">{c === ' ' ? '\u00A0' : c}</span>
      ))}
    </span>
  )
}

// Owner-local time chip — "3:42 PM in Singapore" + response expectation.
// The trust-building staple of Brittany Chiang / Lee Robinson style portfolios.
function SingaporeTimeChip() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(t)
  }, [])
  const { time, awake } = useMemo(() => {
    const time = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Singapore', hour: 'numeric', minute: '2-digit', hour12: true })
    const hour = Number(now.toLocaleTimeString('en-US', { timeZone: 'Asia/Singapore', hour: 'numeric', hour12: false }))
    return { time, awake: hour >= 9 && hour < 23 }
  }, [now])
  return (
    <div className="inline-flex flex-wrap items-center gap-2.5 px-3.5 py-2 rounded-lg border border-slate-700/50 bg-slate-900/40 font-mono text-xs text-slate-400">
      <span
        className={`w-1.5 h-1.5 rounded-full ${awake ? 'bg-emerald-400' : 'bg-amber-400'}`}
        style={awake ? { boxShadow: '0 0 8px rgba(16,185,129,.8)' } : undefined}
      />
      <span className="text-slate-300">{time} in Singapore</span>
      <span className="text-slate-600">·</span>
      <span>replies within 24h</span>
    </div>
  )
}

// Animated package.json card that types itself out line by line — with 3D tilt on hover
function PackageJsonCard() {
  const cardRef = useRef<HTMLDivElement>(null)
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const springRotateX = useSpring(rotateX, { stiffness: 200, damping: 20 })
  const springRotateY = useSpring(rotateY, { stiffness: 200, damping: 20 })
  const LINES: React.ReactNode[] = [
    <><span className="text-slate-400">{'{'}</span></>,
    <><span className="text-blue-300">{'  "name"'}</span><span className="text-slate-400">: </span><span className="text-emerald-300">"leo-phucvu"</span><span className="text-slate-400">,</span></>,
    <><span className="text-blue-300">{'  "version"'}</span><span className="text-slate-400">: </span><span className="text-emerald-300">"5.0.0"</span><span className="text-slate-400">,</span></>,
    <><span className="text-blue-300">{'  "description"'}</span><span className="text-slate-400">: </span><span className="text-emerald-300">"Senior Full-Stack Developer"</span><span className="text-slate-400">,</span></>,
    <><span className="text-blue-300">{'  "location"'}</span><span className="text-slate-400">: </span><span className="text-emerald-300">"Singapore 🇸🇬"</span><span className="text-slate-400">,</span></>,
    <><span className="text-blue-300">{'  "experience"'}</span><span className="text-slate-400">: </span><span className="text-emerald-300">"5+ years"</span><span className="text-slate-400">,</span></>,
    <><span className="text-blue-300">{'  "main"'}</span><span className="text-slate-400">: [</span><span className="text-emerald-300">"React"</span><span className="text-slate-400">, </span><span className="text-emerald-300">"TypeScript"</span><span className="text-slate-400">, </span><span className="text-emerald-300">"Node.js"</span><span className="text-slate-400">],</span></>,
    <><span className="text-blue-300">{'  "available"'}</span><span className="text-slate-400">: </span><span className="text-amber-300">true</span></>,
    <><span className="text-slate-400">{'}'}</span></>,
  ]
  const [visible, setVisible] = useState(0)
  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = []
    const start = setTimeout(() => {
      const reveal = (i: number) => {
        setVisible(i + 1)
        if (i + 1 < LINES.length) {
          timeouts.push(setTimeout(() => reveal(i + 1), 200))
        }
      }
      reveal(0)
    }, 2000)
    timeouts.push(start)
    return () => timeouts.forEach(clearTimeout)
  }, [])
  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.6 }}
      style={{ perspective: 800, rotateX: springRotateX, rotateY: springRotateY }}
      onMouseMove={(e) => {
        const rect = cardRef.current?.getBoundingClientRect()
        if (!rect) return
        const x = (e.clientX - rect.left) / rect.width - 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5
        rotateX.set(-y * 12)
        rotateY.set(x * 12)
      }}
      onMouseLeave={() => { rotateX.set(0); rotateY.set(0) }}
      className="mt-8 mx-auto max-w-md rounded-xl border border-slate-700/50 bg-[#0d1117] shadow-lg shadow-emerald-500/10 overflow-hidden text-left"
      data-cursor="pointer"
    >
      {/* Top bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-700/50 bg-white/[0.02]">
        <span className="w-3 h-3 rounded-full bg-red-500/90" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/90" />
        <span className="w-3 h-3 rounded-full bg-green-500/90" />
        <span className="ml-2 font-mono text-xs text-slate-400">package.json</span>
      </div>
      {/* Content */}
      <div className="px-4 py-3 font-mono text-xs sm:text-sm leading-relaxed">
        {LINES.slice(0, visible).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="whitespace-pre"
          >
            {line}
            {i === visible - 1 && <span className="animate-pulse text-emerald-400">▌</span>}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// Hero stat strip — big count-up numbers (fades in after the boot sequence).
// Reuses CountUpValue (hoisted function declaration) for the number animation.
function HeroStatStrip() {
  const stats = [
    { value: '5+', label: 'Years Experience', accent: '#10b981' },
    { value: '30+', label: 'POS Modules', accent: '#3b82f6' },
    { value: '$200K+', label: 'Transactions', accent: '#8b5cf6' },
    { value: '50K+', label: 'Daily Users', accent: '#f59e0b' },
  ]
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.1, duration: 0.7, ease: 'easeOut' }}
      className="mt-14 mx-auto max-w-3xl grid grid-cols-2 md:grid-cols-4 rounded-2xl border border-slate-800/60 bg-slate-900/25 backdrop-blur-sm overflow-hidden"
    >
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={`group relative px-4 py-5 text-center transition-colors duration-300 hover:bg-white/[0.03] ${i > 0 ? 'border-l border-slate-800/60' : ''} ${i >= 2 ? 'border-t md:border-t-0 border-slate-800/60' : ''}`}
        >
          <span className="pointer-events-none absolute inset-x-4 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(to right, transparent, ${s.accent}66, transparent)` }} />
          <p className="font-display text-2xl md:text-4xl font-bold tracking-tight" style={{ color: s.accent }}>
            <CountUpValue value={s.value} />
          </p>
          <p className="mt-1 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.18em] text-slate-500">{s.label}</p>
        </div>
      ))}
    </motion.div>
  )
}

// Live clock + timezone
function LiveClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const tz = useMemo(() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone } catch { return 'Local' }
  }, [])
  return (
    <span className="font-mono text-xs text-slate-500">
      {now.toLocaleTimeString('en-US', { hour12: false })} <span className="text-emerald-500/70">·</span> {tz}
    </span>
  )
}

/** Language toggle button for the footer. */
function LangToggle() {
  const { lang, toggle } = useI18n()
  return (
    <button
      onClick={toggle}
      className="px-2 py-1 rounded border border-slate-700/50 text-xs font-mono text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-colors"
      title="Switch language"
    >
      {lang === 'en' ? '🌐 EN' : '🌐 VI'}
    </button>
  )
}

// Magnetic wrapper
function Magnetic({ children, strength = 0.4, className }: { children: React.ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 15 })
  const sy = useSpring(y, { stiffness: 200, damping: 15 })
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - r.left - r.width / 2) * strength)
    y.set((e.clientY - r.top - r.height / 2) * strength)
  }
  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={() => { x.set(0); y.set(0) }} style={{ x: sx, y: sy }} className={className}>
      {children}
    </motion.div>
  )
}

// CONTACT — "Network Topology": SVG nodes + animated dashed connections (data flow)
function NetworkGraph() {
  const nodes = useMemo(() => [
    { x: 20, y: 30, label: 'Client' },
    { x: 50, y: 20, label: 'API' },
    { x: 80, y: 35, label: 'DB' },
    { x: 35, y: 60, label: 'Auth' },
    { x: 65, y: 55, label: 'Cache' },
    { x: 50, y: 80, label: 'CDN' },
    { x: 15, y: 70, label: 'Queue' },
    { x: 85, y: 70, label: 'Storage' },
  ], [])
  const connections = [[0, 1], [1, 2], [1, 3], [1, 4], [2, 4], [3, 5], [4, 5], [0, 6], [2, 7]]
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.08]" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
      {connections.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
          stroke="#10b981" strokeWidth="0.3" strokeDasharray="2 2"
          style={{ animation: `dash 3s linear infinite`, animationDelay: `${i * 0.3}s` }}
        />
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r="1.5" fill="#10b981" style={{ animation: `pulse-node 2s ease-in-out infinite`, animationDelay: `${i * 0.4}s` }} />
          <text x={n.x} y={n.y + 4} textAnchor="middle" fill="#94a3b8" fontSize="2.5" fontFamily="monospace">{n.label}</text>
        </g>
      ))}
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── NAV DOTS + WAVE DIVIDER ──────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function NavDots({ active, onNav }: { active: number; onNav: (i: number) => void }) {
  return (
    <nav aria-label="Section navigation" className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-end gap-2">
      {SECTIONS.map((s, i) => {
        const isActive = active === i
        const accent = SECTION_ACCENTS[s]
        return (
          <button key={s} onClick={() => onNav(i)} className="group relative flex items-center gap-2.5">
            <span
              className={`font-mono text-[10px] tracking-wider whitespace-nowrap px-2 py-0.5 rounded-md border transition-all duration-300 ${
                isActive
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 text-slate-300 border-slate-700/50 bg-slate-800/90'
              }`}
              style={
                isActive && accent
                  ? { color: accent, borderColor: `${accent}55`, background: `${accent}14` }
                  : undefined
              }
            >
              {String(i).padStart(2, '0')} · {s}
            </span>
            <span
              className={`block rounded-full transition-all duration-300 ${
                isActive
                  ? 'w-2.5 h-2.5 bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.7)]'
                  : 'w-1.5 h-1.5 bg-slate-600 group-hover:bg-slate-300'
              }`}
              style={
                isActive && accent
                  ? { background: accent, boxShadow: `0 0 10px ${accent}b3` }
                  : undefined
              }
            />
          </button>
        )
      })}
    </nav>
  )
}

// Mobile section dock — thumb-reach wayfinding for small screens (desktop uses
// NavDots). Horizontally scrollable chips highlight the active section and
// auto-center it; the ⌘K button opens the command palette (only mobile access).
function MobileSectionDock({ active, onNav, ready }: { active: number; onNav: (i: number) => void; ready: boolean }) {
  const listRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const list = listRef.current
    const chip = list?.querySelector<HTMLElement>(`[data-dock-idx="${active}"]`)
    if (!list || !chip) return
    list.scrollTo({ left: chip.offsetLeft - (list.clientWidth - chip.clientWidth) / 2, behavior: 'smooth' })
  }, [active])
  if (!ready) return null
  return (
    <motion.nav
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4, ease: 'easeOut' }}
      aria-label="Section navigation"
      className="fixed bottom-4 left-4 right-[5.5rem] z-[60] md:hidden"
    >
      <div className="flex items-center gap-1 rounded-full border border-slate-700/60 bg-[#0d1117]/90 backdrop-blur-md p-1 shadow-xl shadow-black/40">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('leo-palette-open'))}
          aria-label="Open command palette"
          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:bg-white/5 transition-colors"
        >
          <span className="font-mono text-[10px] font-bold">⌘K</span>
        </button>
        <div className="w-px h-5 bg-slate-700/60 shrink-0" />
        <div ref={listRef} className="no-scrollbar flex items-center gap-1 overflow-x-auto">
          {SECTIONS.map((s, i) => {
            const isActive = active === i
            const accent = SECTION_ACCENTS[s]
            return (
              <button
                key={s}
                data-dock-idx={i}
                onClick={() => onNav(i)}
                className={`shrink-0 h-9 px-3 rounded-full font-mono text-[10px] tracking-wider whitespace-nowrap transition-colors duration-300 ${
                  isActive ? 'text-slate-100 bg-white/[0.07]' : 'text-slate-500 hover:text-slate-300'
                }`}
                style={isActive && accent ? { color: accent, background: `${accent}1a` } : undefined}
              >
                {String(i).padStart(2, '0')} {s}
              </button>
            )
          })}
        </div>
      </div>
    </motion.nav>
  )
}

function WaveDivider({ flip = false }: { flip?: boolean }) {
  return (
    <div className={`relative w-full leading-[0] ${flip ? 'rotate-180' : ''}`} aria-hidden>
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-12 md:h-16">
        <path d="M0,40 C240,90 480,0 720,40 C960,80 1200,10 1440,40 L1440,80 L0,80 Z" fill="rgba(16,185,129,0.05)" />
        <path d="M0,50 C360,10 720,90 1080,50 C1260,30 1350,60 1440,50 L1440,80 L0,80 Z" fill="rgba(59,130,246,0.04)" />
      </svg>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── GLOBAL BACKGROUND EFFECTS (aurora blobs + dot grid + particles) ──────────
// ═══════════════════════════════════════════════════════════════════════════

function BackgroundEffects() {
  const particles = useMemo(() => {
    const colors = ['16,185,129', '59,130,246', '139,92,246'] // emerald / blue / violet
    return Array.from({ length: 26 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 2 + Math.random() * 2,
      color: colors[i % colors.length],
      duration: 15 + Math.random() * 25,
      delay: -Math.random() * 30,
      drift: (Math.random() - 0.5) * 90,
      op: 0.05 + Math.random() * 0.1,
    }))
  }, [])

  const blobs = [
    { pos: 'top-[-10%] left-[-5%]', size: '45vw', rgb: '16,185,129', blur: 100, op: 0.22, anim: 'blob-drift-1 34s' },
    { pos: 'top-[28%] right-[-10%]', size: '40vw', rgb: '59,130,246', blur: 110, op: 0.20, anim: 'blob-drift-2 28s' },
    { pos: 'bottom-[-10%] left-[15%]', size: '42vw', rgb: '139,92,246', blur: 120, op: 0.18, anim: 'blob-drift-3 40s' },
    { pos: 'top-[55%] left-[38%]', size: '34vw', rgb: '16,185,129', blur: 90, op: 0.15, anim: 'blob-drift-4 24s' },
  ]

  return (
    <>
      {/* Aurora gradient blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden>
        {blobs.map((b, i) => (
          <div
            key={i}
            className={`absolute ${b.pos} rounded-full`}
            style={{
              width: b.size,
              height: b.size,
              background: `radial-gradient(circle, rgba(${b.rgb},0.5), transparent 70%)`,
              filter: `blur(${b.blur}px)`,
              opacity: b.op,
              willChange: 'transform',
              animation: `${b.anim} ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      {/* Animated dot grid */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        aria-hidden
        style={{
          backgroundImage: 'radial-gradient(rgba(148,163,184,1) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
          animation: 'dot-pulse 8s ease-in-out infinite',
        }}
      />

      {/* Floating particles */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden>
        {particles.map((p) => (
          <span
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.left}%`,
              bottom: '-12px',
              width: p.size,
              height: p.size,
              background: `rgb(${p.color})`,
              willChange: 'transform',
              animation: `particle-rise ${p.duration}s linear infinite`,
              animationDelay: `${p.delay}s`,
              ['--drift' as string]: `${p.drift}px`,
              ['--pop' as string]: p.op,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </>
  )
}

// ─── Terminal Boot Sequence preloader ────────────────────────────────────────
const BOOT_LINES = [
  '> initializing portfolio.exe...',
  '> loading career_modules [████████████] done',
  '> fetching projects from ./workspace... 4 found',
  '> compiling animations.............. ✓',
  '> connecting design_system........... ✓',
  '> mounting scroll_engine............. ✓',
  '> injecting creativity_module........ ✓',
  '> running final checks............... ✓',
  '> ',
  '> ✨ All systems operational',
  '> Welcome, visitor.',
]

function TerminalBoot({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState<string[]>([])

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    BOOT_LINES.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setVisible((prev) => [...prev, BOOT_LINES[i]])
          if (i === BOOT_LINES.length - 1) {
            timers.push(setTimeout(onComplete, 600))
          }
        }, i === 0 ? 250 : 250 + i * 300),
      )
    })
    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  const progress = Math.round((visible.length / BOOT_LINES.length) * 100)
  const filled = Math.min(23, Math.max(0, Math.round((progress / 100) * 23)))
  const bar = '█'.repeat(filled) + '░'.repeat(23 - filled)

  return (
    <motion.div
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(8px)', transition: { duration: 0.5 } }}
      className="fixed inset-0 z-[120] bg-[#0a0a0f] flex items-center justify-center"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: [0, 1, 0.6, 1], scale: 1 }}
        transition={{ duration: 0.5, times: [0, 0.4, 0.7, 1] }}
        className="relative max-w-lg w-[90vw] rounded-xl bg-[#0d1117] border border-slate-700/50 shadow-2xl shadow-emerald-500/10 overflow-hidden"
      >
        {/* Top bar */}
        <div className="h-8 bg-[#161b22] flex items-center px-3 gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500/90" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/90" />
          <span className="w-3 h-3 rounded-full bg-green-500/90" />
          <span className="ml-2 font-mono text-xs text-slate-400">portfolio.sh</span>
        </div>
        {/* Terminal body */}
        <div className="relative p-5 font-mono text-sm text-emerald-400 leading-relaxed min-h-[280px]" style={{ textShadow: '0 0 5px rgba(16,185,129,0.6)' }}>
          {visible.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap">
              {line}
              {i === visible.length - 1 && (
                <span style={{ animation: 'blink-cursor 1s step-end infinite' }}>▌</span>
              )}
            </div>
          ))}
          <div className="mt-4 text-emerald-300/90">{`[${bar}] ${progress}%`}</div>
          {/* Scanline overlay */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(16,185,129,0.06) 0px, rgba(16,185,129,0.06) 1px, transparent 1px, transparent 3px)' }}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── INTERACTIVE SKILLS GRAPH ─────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function SkillsGraph() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  // Map id → category for quick lookups
  const nodeCat = useMemo(() => {
    const m: Record<string, SkillCategory> = {}
    SKILLS_GRAPH.nodes.forEach((n) => { m[n.id] = n.category })
    return m
  }, [])

  // Pre-computed force-layout-style positions (deterministic golden-angle spiral per cluster)
  const positions = useMemo(() => {
    const clusters: Record<SkillCategory, { cx: number; cy: number }> = {
      frontend: { cx: 205, cy: 180 }, // top-left
      backend: { cx: 595, cy: 180 },  // top-right
      devops: { cx: 205, cy: 430 },   // bottom-left
      design: { cx: 595, cy: 430 },   // bottom-right
    }
    const byCat: Record<string, SkillNode[]> = {}
    SKILLS_GRAPH.nodes.forEach((n) => { (byCat[n.category] ||= []).push(n) })

    const golden = Math.PI * (3 - Math.sqrt(5))
    const pos: Record<string, { x: number; y: number }> = {}
    ;(Object.keys(byCat) as SkillCategory[]).forEach((cat) => {
      const { cx, cy } = clusters[cat]
      byCat[cat].forEach((n, i) => {
        // spiral outward from cluster center; radius grows with sqrt to keep even spacing
        const r = i === 0 ? 0 : Math.sqrt(i) * 52 + 14
        const a = i * golden
        pos[n.id] = { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r }
      })
    })
    return pos
  }, [])

  // Adjacency map for hover highlighting
  const adjacency = useMemo(() => {
    const m: Record<string, Set<string>> = {}
    SKILLS_GRAPH.edges.forEach(([a, b]) => {
      (m[a] ||= new Set()).add(b)
      ;(m[b] ||= new Set()).add(a)
    })
    return m
  }, [])

  const anyHover = hoveredNode !== null
  const isNodeActive = (id: string) => !anyHover || id === hoveredNode || !!adjacency[hoveredNode!]?.has(id)

  const edgePath = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const mx = (a.x + b.x) / 2
    const my = (a.y + b.y) / 2
    const dx = b.x - a.x
    const dy = b.y - a.y
    const norm = Math.hypot(dx, dy) || 1
    const off = 26
    const cx = mx - (dy / norm) * off
    const cy = my + (dx / norm) * off
    return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="relative w-full"
    >
      <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet" className="w-full h-auto">
        <defs>
          {(Object.keys(SKILL_CAT_COLORS) as SkillCategory[]).map((cat) => (
            <radialGradient id={`skill-grad-${cat}`} key={cat} cx="38%" cy="35%" r="70%">
              <stop offset="0%" stopColor={SKILL_CAT_COLORS[cat]} stopOpacity="0.95" />
              <stop offset="60%" stopColor={SKILL_CAT_COLORS[cat]} stopOpacity="0.55" />
              <stop offset="100%" stopColor={SKILL_CAT_COLORS[cat]} stopOpacity="0.18" />
            </radialGradient>
          ))}
        </defs>

        {/* Edges */}
        {SKILLS_GRAPH.edges.map(([a, b], i) => {
          const pa = positions[a]
          const pb = positions[b]
          if (!pa || !pb) return null
          const active = anyHover && (a === hoveredNode || b === hoveredNode)
          const dimmed = anyHover && !active
          const color = active ? SKILL_CAT_COLORS[nodeCat[a]] : '#64748b'
          return (
            <path
              key={`${a}-${b}-${i}`}
              d={edgePath(pa, pb)}
              fill="none"
              stroke={color}
              strokeWidth={active ? 2.2 : 1}
              strokeDasharray="4 6"
              strokeLinecap="round"
              style={{
                opacity: dimmed ? 0.04 : active ? 0.9 : 0.15,
                transition: 'opacity 0.3s ease, stroke 0.3s ease',
                animation: 'edge-flow 1s linear infinite',
              }}
            />
          )
        })}

        {/* Nodes */}
        {SKILLS_GRAPH.nodes.map((n, i) => {
          const p = positions[n.id]
          if (!p) return null
          const r = 12 + n.level * 4
          const color = SKILL_CAT_COLORS[n.category]
          const isHover = hoveredNode === n.id
          const active = isNodeActive(n.id)
          const dimmed = anyHover && !active
          return (
            <g
              key={n.id}
              onMouseEnter={() => setHoveredNode(n.id)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ cursor: 'pointer', transition: 'opacity 0.3s ease', opacity: dimmed ? 0.28 : 1 }}
            >
              {/* pulsing glow halo */}
              <circle
                cx={p.x}
                cy={p.y}
                r={r + 7}
                fill={color}
                style={{
                  opacity: isHover ? 0.4 : 0.16,
                  animation: `node-pulse ${3 + (i % 5) * 0.5}s ease-in-out ${(i * 0.17).toFixed(2)}s infinite`,
                  transition: 'opacity 0.3s ease',
                }}
              />
              {/* main node */}
              <circle
                cx={p.x}
                cy={p.y}
                r={r}
                fill={`url(#skill-grad-${n.category})`}
                stroke={color}
                strokeWidth={isHover ? 2.6 : 1.3}
                style={{
                  transform: isHover ? 'scale(1.14)' : 'scale(1)',
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                  transition: 'transform 0.3s ease, stroke-width 0.3s ease, filter 0.3s ease',
                  filter: active && anyHover ? `drop-shadow(0 0 8px ${color})` : 'none',
                }}
              />
              {/* label */}
              <text
                x={p.x}
                y={p.y + r + 15}
                textAnchor="middle"
                fill={dimmed ? '#475569' : '#e2e8f0'}
                style={{
                  fontSize: '12px',
                  fontFamily: "'JetBrains Mono', monospace",
                  pointerEvents: 'none',
                  transition: 'fill 0.3s ease',
                }}
              >
                {n.label}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Category legend */}
      <div className="flex flex-wrap justify-center gap-6 mt-6">
        {(Object.keys(SKILL_CAT_LABELS) as SkillCategory[]).map((cat) => (
          <div key={cat} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: SKILL_CAT_COLORS[cat], boxShadow: `0 0 8px ${SKILL_CAT_COLORS[cat]}` }}
            />
            <span className="text-sm text-slate-400 font-mono">{SKILL_CAT_LABELS[cat]}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── NEOFETCH ABOUT ─────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

const NEOFETCH_ASCII = [
  '        ████████████        ',
  '      ██            ██      ',
  '    ██    ██    ██    ██    ',
  '    ██                ██    ',
  '    ██  ██        ██  ██    ',
  '    ██    ████████    ██    ',
  '      ██            ██      ',
  '        ████████████        ',
  '      ██████████████████    ',
  '      ██              ██    ',
  '      ██████████████████    ',
]

const NEOFETCH_INFO: { key: string; value: string }[] = [
  { key: '', value: 'leo@portfolio.dev' },
  { key: '', value: '─────────────────────────' },
  { key: 'OS', value: 'Full-Stack Developer v5.0' },
  { key: 'Host', value: 'EPOS Singapore 🇸🇬' },
  { key: 'Kernel', value: 'React + TypeScript + Node.js' },
  { key: 'Uptime', value: '5 years, 3 months' },
  { key: 'Packages', value: '40+ projects shipped' },
  { key: 'Shell', value: 'VS Code + zsh' },
  { key: 'Resolution', value: 'Pixel-perfect' },
  { key: 'DE', value: 'Dark Mode Enthusiast' },
  { key: 'Terminal', value: 'iTerm2 + tmux' },
  { key: 'CPU', value: 'Passion × Coffee ☕' },
  { key: 'GPU', value: 'Three.js + WebGL + GSAP' },
  { key: 'Memory', value: '25+ happy clients' },
  { key: 'Disk', value: 'Always learning (∞)' },
]

const PALETTE_COLORS = ['#1e1e2e', '#f38ba8', '#a6e3a1', '#f9e2af', '#89b4fa', '#cba6f7', '#94e2d5', '#cdd6f4']

function NeofetchAbout() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="rounded-2xl border border-slate-700/50 overflow-hidden"
      style={{ background: '#0d1117' }}
    >
      {/* Terminal chrome bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/50 bg-[#161b22]">
        <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
        <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
        <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
        <span className="ml-4 text-sm font-mono text-slate-400">visitor@leo:~$ neofetch</span>
      </div>

      {/* Terminal body */}
      <div className="p-6 md:p-8 overflow-hidden font-mono text-sm leading-relaxed" style={{ textShadow: '0 0 4px rgba(16,185,129,0.3)' }}>
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* ASCII art */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="shrink-0"
          >
            <pre className="text-emerald-400 whitespace-pre text-xs md:text-sm leading-tight select-none">
              {NEOFETCH_ASCII.join('\n')}
            </pre>
          </motion.div>

          {/* Info lines */}
          <div className="flex flex-col gap-0.5">
            {NEOFETCH_INFO.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.08 }}
              >
                {i === 0 ? (
                  <span className="text-emerald-400 font-bold">{line.value}</span>
                ) : i === 1 ? (
                  <span className="text-slate-600">{line.value}</span>
                ) : (
                  <span>
                    <span className="text-blue-300 font-bold">{line.key}</span>
                    <span className="text-slate-500">: </span>
                    <span className="text-slate-200">{line.value}</span>
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Color palette */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.5 + NEOFETCH_INFO.length * 0.08 + 0.2, type: 'spring', stiffness: 200 }}
          className="mt-6 flex gap-1 pl-0 md:pl-[calc(theme(spacing.6)+theme(spacing.8))] md:ml-[11ch]"
        >
          {PALETTE_COLORS.map((color, i) => (
            <span key={i} className="text-2xl" style={{ color }}>●</span>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── ASCII FOOTER ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function ASCIIFooter() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [visibleLines, setVisibleLines] = useState(0)

  const ASCII_ART = [
    '╔══════════════════════════════════════════════════════════╗',
    '║                                                          ║',
    '║   ████████╗██╗  ██╗ █████╗ ███╗   ██╗██╗  ██╗███████╗  ║',
    '║   ╚══██╔══╝██║  ██║██╔══██╗████╗  ██║██║ ██╔╝██╔════╝  ║',
    '║      ██║   ███████║███████║██╔██╗ ██║█████╔╝ ███████╗  ║',
    '║      ██║   ██╔══██║██╔══██║██║╚██╗██║██╔═██╗ ╚════██║  ║',
    '║      ██║   ██║  ██║██║  ██║██║ ╚████║██║  ██╗███████║  ║',
    '║      ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝  ║',
    '║                                                          ║',
    '║          FOR SCROLLING THIS FAR! 🚀                      ║',
    '║                                                          ║',
    '║   visitor@leo:~$ echo "Let\'s build something amazing"   ║',
    '║   > Let\'s build something amazing                       ║',
    '║   visitor@leo:~$ exit                                    ║',
    '║   > Connection closed. See you soon! 👋                  ║',
    '║                                                          ║',
    '╚══════════════════════════════════════════════════════════╝',
  ]

  useEffect(() => {
    if (!inView) return
    let i = 0
    const interval = setInterval(() => {
      i++
      setVisibleLines(i)
      if (i >= ASCII_ART.length) clearInterval(interval)
    }, 80)
    return () => clearInterval(interval)
  }, [inView])

  return (
    <div ref={ref} className="text-center">
      <pre className="inline-block text-left font-mono text-[10px] sm:text-xs md:text-sm text-emerald-400/80 leading-relaxed overflow-x-auto max-w-full" style={{ textShadow: '0 0 8px rgba(16,185,129,0.4)' }}>
        {ASCII_ART.slice(0, visibleLines).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
          >
            {line}
          </motion.div>
        ))}
        {visibleLines >= ASCII_ART.length && (
          <span className="inline-block w-[8px] h-[1em] bg-emerald-400 ml-1 align-middle" style={{ animation: 'blink-cursor 1s step-end infinite' }} />
        )}
      </pre>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── MAIN PORTFOLIO PAGE ──────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

export default function PortfolioPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeSection, setActiveSection] = useState(0)
  const [copied, setCopied] = useState(false)
  const [ready, setReady] = useState(false)
  const [scrambleKey, setScrambleKey] = useState(0)

  // Professional mode: hides playful chrome
  const [professionalMode, setProfessionalMode] = useState(() => {
    try { return localStorage.getItem('pf-professional-mode') === 'true' } catch { return false }
  })
  const toggleProfessionalMode = useCallback(() => {
    setProfessionalMode(prev => {
      const next = !prev
      try { localStorage.setItem('pf-professional-mode', String(next)) } catch { /* ignore */ }
      return next
    })
  }, [])

  // Interactive-mode hint chip dismissal
  const [hintDismissed, setHintDismissed] = useState(() => {
    try { return localStorage.getItem('pf-hint-dismissed') === 'true' } catch { return false }
  })
  const dismissHint = useCallback(() => {
    setHintDismissed(true)
    try { localStorage.setItem('pf-hint-dismissed', 'true') } catch { /* ignore */ }
  }, [])

  usePortfolioSEO()

  const { showToast } = useToast()
  const { crtActive } = useEasterEggs((ev) => {
    if (ev === 'konami') {
      showToast('🕹️ KONAMI! CRT mode engaged — 30 free credits', 'success')
      window.dispatchEvent(new CustomEvent('leo-achievement', { detail: 'konami' }))
    }
    if (ev === 'leo-typed') {
      window.dispatchEvent(new CustomEvent('leo-achievement', { detail: 'scrambler' }))
    }
  })

  // "leo" typed anywhere → replay the hero scramble
  useEffect(() => {
    const handler = () => {
      setScrambleKey(k => k + 1)
      showToast("👋 hey — that's my name!", 'info')
    }
    window.addEventListener('leo-scramble', handler)
    return () => window.removeEventListener('leo-scramble', handler)
  }, [showToast])

  const { setTheme, theme } = useTheme()
  const cycleTheme = useCallback(() => {
    const themes = ['romantic', 'light', 'dark'] as const
    const idx = themes.indexOf(theme)
    setTheme(themes[(idx + 1) % themes.length])
  }, [theme, setTheme])

  const { scrollYProgress } = useScroll()
  const progressScale = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  const scrollToSection = (i: number) => {
    const el = containerRef.current?.querySelector(`[data-section-idx="${i}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Section observer
  useEffect(() => {
    const sectionEls = containerRef.current?.querySelectorAll('[data-section]')
    if (!sectionEls) return
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActiveSection(Number(e.target.getAttribute('data-section-idx'))) })
    }, { threshold: 0.3 })
    sectionEls.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  // ── Hash deep-linking (#works, #contact...) ──────────────────────────────
  // Sections get stable ids so links like /portfolio#works land on the section.
  // The URL hash is kept in sync on scroll via replaceState (no history spam).
  const SECTION_IDS = useMemo(() => SECTIONS.map(s => s.toLowerCase().replace(/\s+/g, '-')), [])
  useEffect(() => {
    containerRef.current?.querySelectorAll('[data-section]').forEach((el) => {
      const i = Number(el.getAttribute('data-section-idx'))
      if (SECTION_IDS[i]) el.id = SECTION_IDS[i]
    })
  }, [SECTION_IDS])
  // Jump to the hashed section once the boot sequence finishes
  useEffect(() => {
    if (!ready) return
    const hash = decodeURIComponent(window.location.hash.replace('#', ''))
    if (!hash) return
    const idx = SECTION_IDS.indexOf(hash)
    if (idx >= 0) {
      containerRef.current?.querySelector(`[data-section-idx="${idx}"]`)
        ?.scrollIntoView({ behavior: 'auto', block: 'start' })
    }
  }, [ready, SECTION_IDS])
  // Keep the hash in sync while scrolling (only on the plain portfolio route —
  // never rewrite the URL while the case-study overlay route is active)
  useEffect(() => {
    if (!ready) return
    if (window.location.pathname !== '/portfolio') return
    const id = SECTION_IDS[activeSection]
    if (id && window.location.hash !== `#${id}`) {
      window.history.replaceState(null, '', `/portfolio#${id}`)
    }
  }, [activeSection, ready, SECTION_IDS])

  const copyEmail = () => {
    navigator.clipboard.writeText(CONTACT_EMAIL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div ref={containerRef} className="portfolio-page relative bg-[#0a0a0f] text-slate-50 overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .font-display { font-family: 'Space Grotesk', sans-serif; font-weight: 700; letter-spacing: -0.02em; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0a0f; }
        ::-webkit-scrollbar-thumb { background: #10b981; border-radius: 3px; }
        @property --angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
        @keyframes rotate-angle { to { --angle: 360deg; } }
        @keyframes orbit { 0% { transform: rotate(0deg) translateX(120px) rotate(0deg); } 100% { transform: rotate(360deg) translateX(120px) rotate(-360deg); } }
        @keyframes gradient-shift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes shine { 0% { background-position: 150% 0; } 100% { background-position: -50% 0; } }
        @keyframes aurora { 0%,100% { transform: translate(-10%,-10%) rotate(0deg); } 50% { transform: translate(10%,10%) rotate(20deg); } }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes flow { 0% { top: -8%; opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } 100% { top: 108%; opacity: 0; } }
        @keyframes blob { 0%,100% { border-radius: 42% 58% 63% 37%/42% 44% 56% 58%; } 50% { border-radius: 63% 37% 42% 58%/58% 56% 44% 42%; } }
        @keyframes glowpulse { 0%,100% { box-shadow: 0 0 8px rgba(16,185,129,.5); } 50% { box-shadow: 0 0 22px rgba(16,185,129,.9); } }
        @keyframes blink-cursor { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes dash { to { stroke-dashoffset: -20; } }
        @keyframes pulse-node { 0%, 100% { r: 1.5; opacity: 0.6; } 50% { r: 2; opacity: 1; } }
        @keyframes commit-pop { 0%, 100% { opacity: 0.2; transform: scale(0.6); } 50% { opacity: 1; transform: scale(1); } }
        @keyframes blob-drift-1 { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(8vw,6vh) scale(1.18); } 66% { transform: translate(-6vw,10vh) scale(0.9); } }
        @keyframes blob-drift-2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-11vw,-8vh) scale(1.22); } }
        @keyframes blob-drift-3 { 0%,100% { transform: translate(0,0) scale(1); } 40% { transform: translate(7vw,-11vh) scale(1.12); } 70% { transform: translate(-9vw,5vh) scale(0.94); } }
        @keyframes blob-drift-4 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(9vw,9vh) scale(1.1); } }
        @keyframes particle-rise { 0% { transform: translateY(0) translateX(0); opacity: 0; } 10% { opacity: var(--pop, 0.12); } 90% { opacity: var(--pop, 0.12); } 100% { transform: translateY(-108vh) translateX(var(--drift, 20px)); opacity: 0; } }
        @keyframes dot-pulse { 0%,100% { opacity: 0.04; } 50% { opacity: 0.06; } }
        @keyframes node-pulse { 0%,100% { opacity: 0.7; } 50% { opacity: 1; } }
        @keyframes edge-flow { to { stroke-dashoffset: -20; } }
        .orbit-tag { animation: orbit var(--duration) linear infinite; }
        .gradient-animate { background-size: 200% 200%; animation: gradient-shift 4s ease infinite; }
        .grad-border { position: relative; }
        .grad-border::before { content: ''; position: absolute; inset: -1px; border-radius: inherit; padding: 1.5px; background: conic-gradient(from var(--angle), #10b981, #3b82f6, #8b5cf6, #10b981); animation: rotate-angle 6s linear infinite; -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; opacity: .35; transition: opacity .4s; pointer-events: none; }
        .grad-border:hover::before { opacity: 1; }
        .holo-shine { position: absolute; inset: 0; border-radius: inherit; background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,.12) 45%, rgba(255,255,255,.28) 50%, rgba(255,255,255,.12) 55%, transparent 60%); background-size: 250% 250%; background-position: 150% 0; opacity: 0; transition: opacity .3s; pointer-events: none; }
        .group:hover .holo-shine { opacity: 1; animation: shine 1.1s ease; }
        .stroke-title { -webkit-text-stroke: 1px rgba(16,185,129,.55); color: transparent; transition: all .45s ease; }
        .group:hover .stroke-title { -webkit-text-stroke: 1px transparent; background: linear-gradient(90deg, #10b981, #3b82f6, #8b5cf6); -webkit-background-clip: text; background-clip: text; }
        .glitch:hover { animation: none; }
        .glitch:hover .glitch-layer { opacity: 1; }
        .liquid-btn:hover { animation: blob 2.5s ease-in-out infinite; }
        .hero-name-letters > span { transition: transform .3s cubic-bezier(.34,1.56,.64,1), color .3s ease, text-shadow .3s ease; cursor: default; }
        .hero-name-letters > span:hover { transform: translateY(-.09em) scale(1.06); color: #10b981; text-shadow: 0 0 28px rgba(16,185,129,.5); }
        .role-gradient { background: linear-gradient(90deg, #34d399, #3b82f6, #a78bfa, #34d399); background-size: 200% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; animation: gradient-shift 6s ease infinite; }
        .watermark-outline { -webkit-text-stroke: 1.5px rgba(148,163,184,.16); }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Global animated background: aurora blobs, dot grid, floating particles */}
      <BackgroundEffects />

      {/* Section-specific ambient glows (crossfade by active section) */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden>
        {SECTION_GLOWS.map((bg, i) => (
          <motion.div
            key={i}
            className="absolute inset-0"
            style={{ background: bg }}
            animate={{ opacity: activeSection === i ? 1 : 0 }}
            transition={{ duration: 1.1, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Global noise / grain overlay */}
      <div className="pointer-events-none fixed inset-0 z-[90] opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: NOISE, backgroundSize: '180px 180px' }} />

      {/* CRT retro mode (Konami code) */}
      <CrtOverlay active={crtActive} />

      {/* Scroll progress bar — enhanced with glow shadow */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] z-[95] origin-left bg-gradient-to-r from-emerald-400 via-blue-400 to-violet-400"
        style={{ scaleX: progressScale, boxShadow: '0 0 12px rgba(16,185,129,0.5), 0 0 24px rgba(59,130,246,0.3)' }}
      />

      {/* Custom cursor — Dennis Snellenberg inspired soft trailing blob */}
      <CustomCursor />

      <NavDots active={activeSection} onNav={scrollToSection} />
      <MobileSectionDock active={activeSection} onNav={scrollToSection} ready={ready} />
      <ShortcutsHelp />
      {/* Desktop hint chip — press ? anywhere for shortcuts */}
      {ready && (
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('leo-help-open'))}
          className="hidden md:flex fixed bottom-5 left-6 z-[60] items-center gap-2 px-3 py-1.5 rounded-full border border-slate-800/80 bg-[#0d1117]/80 backdrop-blur-md font-mono text-[11px] text-slate-500 hover:text-slate-300 hover:border-slate-600/60 transition-colors"
          aria-label="Keyboard shortcuts"
        >
          press
          <kbd className="inline-flex items-center justify-center min-w-[1.3rem] h-[1.3rem] px-1 rounded border border-slate-700/60 bg-slate-800/80 text-[10px] text-slate-400">?</kbd>
          for shortcuts
        </button>
      )}

      <ThemeToggle />
      <CommandPalette onNavigate={scrollToSection} onToggleTheme={cycleTheme} onToggleProfessional={toggleProfessionalMode} />
      <InteractiveTerminal onNavigate={scrollToSection} professionalMode={professionalMode} />
      <AchievementDrawer suppressToasts={professionalMode} />

      {/* Back-to-top FAB — appears once you scroll past the hero + checkout */}
      <AnimatePresence>
        {activeSection >= 2 && (
          <motion.button
            key="back-to-top"
            initial={{ opacity: 0, scale: 0.6, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={() => scrollToSection(0)}
            aria-label="Back to top"
            className="fixed bottom-24 right-6 z-[70] w-11 h-11 rounded-full bg-[#0d1117]/90 border border-slate-700/60 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(16,185,129,0.25)] backdrop-blur-md flex items-center justify-center transition-all duration-300"
          >
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Sticky "Hire me" CTA — always visible, one click to email */}
      <a
        href={`mailto:${CONTACT_EMAIL}?subject=Opportunity%20at%20${encodeURIComponent('Your Company')}&body=Hi,%0A%0AI came across your portfolio and would love to discuss an opportunity.%0A%0ABest,`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Hire me — send email"
        data-cursor="pointer"
        className="fixed bottom-20 right-6 z-[75] flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-mono text-xs font-semibold tracking-wider shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40 hover:-translate-y-0.5 transition-all duration-300"
      >
        <Mail size={14} />
        <span>HIRE ME</span>
      </a>

      {/* Interactive-mode hint chip — hidden in professional mode or if dismissed */}
      {!professionalMode && !hintDismissed && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.5 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-emerald-500/30 backdrop-blur-sm"
          style={{ animation: 'glowpulse 3s ease-in-out infinite' }}
        >
          <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-[10px] text-emerald-300 font-mono">Ctrl+K</kbd>
          <span className="text-[11px] text-slate-400 font-mono">— this site has secrets</span>
          <button
            onClick={dismissHint}
            className="ml-1 p-0.5 rounded-full text-slate-500 hover:text-slate-300 hover:bg-white/10 transition-colors"
            aria-label="Dismiss hint"
          >
            <X size={12} />
          </button>
        </motion.div>
      )}

      {/* Preloader: terminal boot sequence */}
      <AnimatePresence>
        {!ready && <TerminalBoot onComplete={() => setReady(true)} />}
      </AnimatePresence>

      {/* ═══ SECTION 1: HERO ═══ */}
      <section data-section data-section-idx="0" aria-label="Hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Static gradient backdrop + static scan lines — zero scroll cost */}
        <div className="absolute inset-0">
          <ParticleFallback />
        </div>
        <div className="absolute inset-0 pointer-events-none opacity-[0.07]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, #10b981 3px, #10b981 4px)' }} />

        {/* Floating gradient orbs — slow drifting aurora effect */}
        <motion.div
          className="absolute top-[15%] left-[10%] w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.15), transparent 70%)', filter: 'blur(60px)' }}
          animate={{ x: [0, 40, -30, 0], y: [0, -30, 20, 0], scale: [1, 1.15, 0.95, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-[30%] right-[8%] w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%)', filter: 'blur(70px)' }}
          animate={{ x: [0, -50, 30, 0], y: [0, 25, -40, 0], scale: [1, 0.9, 1.1, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[20%] left-[30%] w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.1), transparent 70%)', filter: 'blur(65px)' }}
          animate={{ x: [0, 35, -25, 0], y: [0, -20, 35, 0], scale: [1, 1.08, 0.92, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="relative z-10 text-center px-4">
          {/* Availability badge — status-first, like premium portfolios */}
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
            className="mb-6 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/[0.05] backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="font-mono text-[10px] md:text-[11px] tracking-[0.22em] text-emerald-300">OPEN&nbsp;TO&nbsp;OPPORTUNITIES</span>
          </motion.div>
          <h1 className="font-display text-7xl md:text-9xl font-bold tracking-tighter mb-6">
            <ScrambleText key={scrambleKey} text={HERO_NAME} className="hero-name-letters" />
          </h1>
          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 1 }} className="hero-subtitle text-xl md:text-2xl font-light tracking-wide mb-8">
            <span className="role-gradient">{HERO_ROLE}</span><span className="animate-pulse ml-1">|</span>
          </motion.p>
          <PackageJsonCard />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8 }} className="mt-12 flex items-center justify-center gap-4 flex-wrap">
            <Magnetic strength={0.5} className="inline-block">
              <button onClick={() => scrollToSection(1)} data-cursor="pointer" className="grad-border relative px-8 py-3 rounded-full text-emerald-400 hover:text-white bg-[#0a0a0f] hover:bg-emerald-500/10 transition-all duration-300 font-mono text-sm tracking-wider">
                EXPLORE MY WORK
              </button>
            </Magnetic>
            <Magnetic strength={0.5} className="inline-block">
              <button onClick={downloadResume} data-cursor="pointer" className="grad-border relative px-8 py-3 rounded-full text-blue-400 hover:text-white bg-[#0a0a0f] hover:bg-blue-500/10 transition-all duration-300 font-mono text-sm tracking-wider">
                DOWNLOAD RESUME
              </button>
            </Magnetic>
          </motion.div>
          <HeroStatStrip />
          {/* TL;DR for recruiters — 3 metric bullets, skimmable in 5 seconds */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.3, duration: 0.6 }}
            className="mt-10 mx-auto max-w-2xl grid grid-cols-1 md:grid-cols-3 gap-3 text-center"
          >
            <div className="px-4 py-3 rounded-lg border border-slate-800/60 bg-slate-900/20 backdrop-blur-sm">
              <p className="font-mono text-lg font-bold text-emerald-400">30+</p>
              <p className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">modules shipped</p>
            </div>
            <div className="px-4 py-3 rounded-lg border border-slate-800/60 bg-slate-900/20 backdrop-blur-sm">
              <p className="font-mono text-lg font-bold text-blue-400">$200K+</p>
              <p className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">transactions processed</p>
            </div>
            <div className="px-4 py-3 rounded-lg border border-slate-800/60 bg-slate-900/20 backdrop-blur-sm">
              <p className="font-mono text-lg font-bold text-violet-400">0</p>
              <p className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">financial incidents</p>
            </div>
          </motion.div>
          {/* "Now" status — shows you're active and employed */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="mt-6 font-mono text-xs text-slate-500"
          >
            <span className="text-slate-600">currently:</span>{' '}
            <span className="text-slate-400">Leading .NET 8 migration at EPOS Singapore</span>
          </motion.div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-5 h-8 border-2 border-slate-600 rounded-full flex justify-center pt-1"><div className="w-1 h-2 bg-emerald-400 rounded-full" /></div>
        </div>
      </section>

      <WaveDivider />

      {/* ═══ SECTION 2: SKILL CHECKOUT — SIGNATURE DEMO ═══ */}
      <section data-section data-section-idx="1" aria-label="Skill Checkout" className="relative py-32 px-6 md:px-16">
        <div className="max-w-6xl mx-auto">
          <SectionHeader index={1} eyebrow="signature demo" title="The Self-Checkout" subtitle="I build POS systems all day — so scan my skills and run a transaction yourself" accent="#ec4899" />
          <Suspense fallback={<SectionFallback />}>
            <SkillCheckout onContact={() => scrollToSection(14)} />
          </Suspense>
        </div>
      </section>

      <MarqueeBand phrases={['Self-Checkout', 'Skills In Stock', 'GST 9%', 'Zero Incidents', 'Always Shipping']} accent="#ec4899" tilt={-1.5} />

      {/* ═══ SECTION 3: ABOUT ═══ */}
      <section data-section data-section-idx="2" aria-label="About" className="about-section relative min-h-screen flex items-center py-32 px-6 md:px-16">
        {/* subtle background blobs */}
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" style={{ animation: 'aurora 18s ease-in-out infinite' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" style={{ animation: 'aurora 22s ease-in-out infinite reverse' }} />
        <div className="max-w-4xl mx-auto relative z-10 w-full">
          <NeofetchAbout />
        </div>
      </section>

      <WaveDivider flip />

      {/* ═══ SECTION 4: CAREER CHRONICLE ═══ */}
      <section data-section data-section-idx="3" aria-label="Career Chronicle" className="relative">
        <div className="py-20">
          <SectionHeader index={2} eyebrow="scroll to explore" title="The Career Chronicle" subtitle="My professional journey, told one scroll at a time" accent="#f59e0b" className="mb-0" />
        </div>
        {CAREER_CHAPTERS.map((chapter, i) => (
          <CareerChapter key={chapter.year} chapter={chapter} index={i} />
        ))}
      </section>

      {/* ═══ SECTION 5: THE MONEY LAYER (TENDER WALL) ═══ */}
      <section data-section data-section-idx="4" aria-label="The Money Layer" className="relative py-32 px-6 md:px-16">
        <div className="max-w-6xl mx-auto">
          <SectionHeader index={3} eyebrow="tender screen" title="The Money Layer" subtitle="Tap a tender — every payment strategy I wired for Singapore retail" accent="#10b981" />
          <Suspense fallback={<SectionFallback />}>
            <TenderWall />
          </Suspense>
        </div>
      </section>

      {/* ═══ SECTION 6: THE LOYALTY VAULT ═══ */}
      <section data-section data-section-idx="5" aria-label="The Loyalty Vault" className="relative py-32 px-6 md:px-16">
        <div className="max-w-6xl mx-auto">
          <SectionHeader index={4} eyebrow="membership core" title="The Loyalty Vault" subtitle="Points, tiers, store credit floors and on-account — poke the actual rules" accent="#14b8a6" />
          <Suspense fallback={<SectionFallback />}>
            <LoyaltyVault />
          </Suspense>
        </div>
      </section>

      <MarqueeBand phrases={['Payment Systems', 'Loyalty Core', 'Offline-First', 'gRPC Microservices', '$200K+ Processed']} accent="#14b8a6" tilt={1.5} />

      {/* ═══ SECTION 7: METRICS DASHBOARD ═══ */}
      <section data-section data-section-idx="6" aria-label="Dev Metrics" className="relative py-32 px-6 md:px-16">
        <div className="max-w-6xl mx-auto">
          <SectionHeader index={5} eyebrow="monitoring" title="Dev Metrics" subtitle="Real-time performance indicators" accent="#3b82f6" />
          <RevealOnScroll delay={0.15}>
            <GrafanaDashboard />
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══ SECTION 8: ACTIVITY / CONTRIBUTION GRAPH ═══ */}
      <section data-section data-section-idx="7" aria-label="Activity" className="relative py-32 px-6 md:px-16">
        <div className="max-w-6xl mx-auto">
          <SectionHeader index={6} eyebrow="commit history" title="Always Shipping" subtitle="365 days of green squares — consistency is a feature" accent="#22c55e" />
          <RevealOnScroll delay={0.15}>
            <Suspense fallback={<SectionFallback />}>
              <ContributionGraph />
            </Suspense>
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══ SECTION 9: SKILLS GALAXY ═══ */}
      <section data-section data-section-idx="8" aria-label="Skills" className="relative py-32 px-6 md:px-16">
        <div className="max-w-6xl mx-auto">
          <SectionHeader index={7} eyebrow="Technical Arsenal" title="Skills Galaxy" subtitle="Hover to explore connections between technologies" accent="#8b5cf6" className="mb-16" />
          <RevealOnScroll delay={0.15}>
            <SkillsGraph />
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══ SECTION 10: SELECTED WORKS — EDITORIAL INDEX ═══ */}
      <section data-section data-section-idx="9" aria-label="Selected Works" className="relative py-32 px-6 md:px-16">
        <div className="max-w-6xl mx-auto">
          <SectionHeader index={8} eyebrow="editorial index" title="Selected Works" subtitle="Flagship projects, editorial style — hover to preview, click for the full case study" accent="#eab308" />
          <Suspense fallback={<SectionFallback />}>
            <SelectedWorks />
          </Suspense>
        </div>
      </section>

      {/* ═══ SECTION 11: PROJECTS — VS CODE EXPLORER ═══ */}
      <section data-section data-section-idx="10" aria-label="Projects" className="relative py-32 px-6 md:px-16">
        <div className="max-w-6xl mx-auto">
          <SectionHeader index={9} eyebrow="workspace" title="The Showcase" subtitle="Open the explorer to browse my projects" accent="#0ea5e9" />
          <RevealOnScroll delay={0.15}>
            <VSCodeExplorer />
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══ SECTION 12: THE LAB (CODE PLAYGROUND) ═══ */}
      <section data-section data-section-idx="11" aria-label="The Lab" className="relative py-32 px-6 md:px-16">
        <div className="max-w-6xl mx-auto">
          <SectionHeader index={10} eyebrow="the lab" title="Break Things Here" subtitle="Live code snippets — edit, remix, watch it run" accent="#f97316" />
          <RevealOnScroll delay={0.15}>
            <Suspense fallback={<SectionFallback />}>
              <CodePlayground />
            </Suspense>
          </RevealOnScroll>
        </div>
      </section>

      <WaveDivider />

      {/* ═══ SECTION 13: TESTIMONIALS ═══ */}
      <section data-section data-section-idx="12" aria-label="Testimonials" className="relative py-32 px-6 md:px-16">
        <div className="max-w-4xl mx-auto">
          <SectionHeader index={11} eyebrow="peer reviews" title="Code Reviews" subtitle="Pull requests approved by colleagues across the industry" accent="#f43f5e" badge={CONTENT_FLAGS.showSampleDataBadges ? 'Sample data' : undefined} />
          <PRStyleTestimonials />
        </div>
      </section>

      {/* ═══ SECTION 14: KANBAN BOARD ═══ */}
      <section data-section data-section-idx="13" aria-label="Kanban Board" className="relative py-32 px-6 md:px-16">
        <div className="max-w-6xl mx-auto">
          <SectionHeader index={12} eyebrow="sprint board" title="Currently Working On" subtitle="My active sprint — dragging ideas to production" accent="#06b6d4" />
          <RevealOnScroll delay={0.15}>
            <KanbanBoard />
          </RevealOnScroll>
        </div>
      </section>

      <MarqueeBand reverse phrases={['Available for Hire', 'Full-Stack', '.NET 8', 'React & TypeScript', 'Singapore']} accent="#8b5cf6" tilt={-1.5} />

      {/* ═══ SECTION 15: CONTACT ═══ */}
      <section data-section data-section-idx="14" aria-label="Contact" className="contact-section relative min-h-screen flex items-center py-32 px-6 md:px-16">
        <div className="absolute inset-0 hidden md:block pointer-events-none">
          <NetworkGraph />
        </div>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 relative z-10 w-full">
          <div className="flex flex-col justify-center">
            <h2 className="font-display text-5xl md:text-6xl font-bold tracking-tight mb-6">
              {"Let's Connect".split('').map((ch, i) => <motion.span key={i} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03, duration: 0.6 }} className="contact-char inline-block">{ch === ' ' ? '\u00A0' : ch}</motion.span>)}
              <span className="inline-block w-[3px] h-[0.9em] ml-2 align-middle bg-emerald-400 animate-pulse" />
            </h2>
            <p className="text-slate-400 text-lg mb-6">Have an exciting project in mind? Let's turn your vision into reality.</p>
            <div className="mb-8">
              <SingaporeTimeChip />
            </div>
            <div className="space-y-4">
              <button onClick={copyEmail} className="flex items-center gap-3 text-slate-300 hover:text-emerald-400 transition-colors group">
                <Mail size={18} /> <span className="font-mono text-sm">{CONTACT_EMAIL}</span>
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
              </button>
              {(() => { const ICON_MAP: Record<string, typeof Globe> = { GitHub: Globe, LinkedIn: Link, Twitter: Send }; const visible = SOCIAL_LINKS.filter(l => l.url !== ''); return visible.length > 0 ? (
              <div className="flex gap-4 mt-6">
                {visible.map(({ platform, url }) => { const Icon = ICON_MAP[platform] || Globe; return (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="group relative w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(16,185,129,0.2)] transition-all duration-300">
                    <Icon size={18} />
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300 whitespace-nowrap">{platform}</span>
                  </a>
                ) })}
              </div>
              ) : null })()}
              <button onClick={downloadResume} className="mt-6 grad-border relative px-6 py-2.5 rounded-full text-blue-400 hover:text-white bg-[#0a0a0f] hover:bg-blue-500/10 transition-all duration-300 font-mono text-sm tracking-wider">
                Download Resume
              </button>
            </div>
          </div>
          <TerminalContactForm />
        </div>
      </section>

      {/* Marquee above footer */}
      <div className="relative overflow-hidden border-y border-slate-800/50 py-5 bg-[#080810]">
        <div className="flex whitespace-nowrap" style={{ animation: 'marquee 22s linear infinite' }}>
          {Array.from({ length: 2 }).map((_, r) => (
            <div key={r} className="flex whitespace-nowrap">
              {['Let\'s Build Something Amazing', 'Open to Opportunities', 'Available for Freelance'].map((t, k) => (
                <span key={k} className="font-display text-3xl md:text-5xl font-bold text-slate-100/20 mx-8 flex items-center gap-8">
                  {t} <span className="text-emerald-500 text-2xl">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ═══ SECTION 14: FOOTER ═══ */}
      <section data-section data-section-idx="15" aria-label="Footer" className="relative py-24 px-6 border-t border-slate-800/50 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
        {/* Giant outlined watermark — typographic signature (Awwwards footer staple) */}
        <div aria-hidden className="pointer-events-none select-none absolute inset-x-0 -bottom-4 md:-bottom-8 text-center leading-none">
          <span className="watermark-outline font-display font-bold text-[24vw] md:text-[18rem] leading-[0.78] whitespace-nowrap text-transparent">EPOS&nbsp;V5</span>
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <ASCIIFooter />
          <div className="relative">
            {!professionalMode && <GuestbookMarquee />}
            {!professionalMode && CONTENT_FLAGS.showSampleDataBadges && <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-mono text-slate-500 border border-slate-700/40 rounded opacity-70 z-10">Sample data</span>}
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-slate-800/30">
            <div className="flex flex-col items-center md:items-start gap-1">
              <p className="text-slate-500 text-sm font-mono">© 2024 leo.dev — All rights reserved.</p>
              <LiveClock />
            </div>
            <p className="text-slate-500 text-sm flex items-center gap-1 font-mono">
              Built with <span className="text-emerald-400">React</span> + <span className="text-blue-400">TypeScript</span> + <span className="text-violet-400">Framer Motion</span>
            </p>
            <div className="flex items-center gap-4">
              <LangToggle />
              <button onClick={() => scrollToSection(0)} className="group flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors text-sm font-mono">
                Back to top <ArrowUp size={16} className="transition-all duration-300 group-hover:-translate-y-2 group-hover:scale-125 group-hover:rotate-[20deg]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Case-study route renders as a full-screen overlay via this Outlet.
          The portfolio stays mounted underneath — the browser back button
          returns here instantly with the exact scroll position preserved. */}
      <Outlet />

      {/* Floating dock to jump between portfolio style variants (keys 0-4) */}
      <StyleSwitcher />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── TERMINAL CONTACT FORM ────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

type TerminalLineType = 'system' | 'prompt' | 'input' | 'success' | 'error'
interface TerminalLine { text: string; type: TerminalLineType }

const TERMINAL_LINE_COLORS: Record<TerminalLineType, string> = {
  system: 'text-slate-500',
  prompt: 'text-emerald-400',
  input: 'text-slate-200',
  success: 'text-emerald-300',
  error: 'text-red-400',
}

function TerminalContactForm() {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [lines, setLines] = useState<TerminalLine[]>([])
  const [sending, setSending] = useState(false)
  const [progress, setProgress] = useState(0)
  const [input, setInput] = useState('')

  const containerRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const started = useRef(false)
  const isInView = useInView(containerRef, { once: true, amount: 0.3 })

  const appendLines = useCallback((newLines: TerminalLine[]) => {
    setLines((prev) => [...prev, ...newLines])
  }, [])

  // Auto-display the initial output once the section scrolls into view
  useEffect(() => {
    if (!isInView || started.current) return
    started.current = true
    setLines([
      { text: '┌─────────────────────────────────────┐', type: 'system' },
      { text: '│  CONTACT TERMINAL v2.0              │', type: 'system' },
      { text: '│  Secure connection established      │', type: 'system' },
      { text: '└─────────────────────────────────────┘', type: 'system' },
      { text: '', type: 'system' },
      { text: '> Initializing contact protocol...', type: 'system' },
      { text: '> Connection secured ✓', type: 'success' },
      { text: '', type: 'system' },
      { text: 'Enter your name:', type: 'prompt' },
    ])
  }, [isInView])

  // Auto-scroll the terminal body to the bottom as new lines appear
  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines, sending, progress])

  // Auto-focus the input whenever a new input step begins
  useEffect(() => {
    if (started.current && step < 3) inputRef.current?.focus()
  }, [step])

  const runSending = useCallback(async (visitorName: string, _visitorEmail: string, _visitorMessage: string) => {
    setSending(true)
    setProgress(0)
    appendLines([{ text: '> Processing request...', type: 'system' }])

    // Simulated send — no backend, purely client-side demo
    let pct = 0
    const interval = setInterval(() => {
      pct += 5
      setProgress(Math.min(pct, 100))
      if (pct >= 100) {
        clearInterval(interval)
        setSending(false)
        appendLines([
          { text: '> ████████████████████ 100%', type: 'success' },
          { text: '>', type: 'system' },
          { text: '> ✨ Message transmitted successfully!', type: 'success' },
          { text: `> Thank you, ${visitorName}. I'll respond within 24h.`, type: 'success' },
          { text: '> (demo mode — message not delivered)', type: 'system' },
          { text: '>', type: 'system' },
          { text: 'visitor@leo:~$ exit', type: 'input' },
          { text: '> Connection closed.', type: 'system' },
        ])
        window.dispatchEvent(new CustomEvent('leo-achievement', { detail: 'sign-here' }))
        setStep(4)
      }
    }, 75)
  }, [appendLines])

  const handleEnter = useCallback(() => {
    const value = input.trim()
    if (!value || sending || step >= 3) return

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (step === 0) {
      setName(value)
      appendLines([
        { text: `visitor@leo:~$ ${value}`, type: 'input' },
        { text: `> Hello, ${value}! ✓`, type: 'success' },
        { text: 'Enter your email:', type: 'prompt' },
      ])
      setStep(1)
    } else if (step === 1) {
      if (!EMAIL_REGEX.test(value)) {
        appendLines([
          { text: `visitor@leo:~$ ${value}`, type: 'input' },
          { text: '> ✗ Invalid email format. Please enter a valid email address.', type: 'error' },
          { text: 'Enter your email:', type: 'prompt' },
        ])
        setInput('')
        return
      }
      setEmail(value)
      appendLines([
        { text: `visitor@leo:~$ ${value}`, type: 'input' },
        { text: '> Email registered ✓', type: 'success' },
        { text: 'Enter your message:', type: 'prompt' },
      ])
      setStep(2)
    } else if (step === 2) {
      setMessage(value)
      appendLines([{ text: `visitor@leo:~$ ${value}`, type: 'input' }])
      setStep(3)
      runSending(name, email, value)
    }
    setInput('')
  }, [input, sending, step, name, email, appendLines, runSending])

  const inputLabel = step === 0 ? 'Enter your name' : step === 1 ? 'Enter your email' : 'Enter your message'
  const filled = Math.floor(progress / 5)

  return (
    <div
      ref={containerRef}
      onClick={() => inputRef.current?.focus()}
      className="relative bg-[#0d1117] border border-slate-700/50 rounded-2xl overflow-hidden font-mono text-sm shadow-[0_0_40px_rgba(16,185,129,0.08)]"
    >
      {/* window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/50">
        <span className="w-3 h-3 rounded-full bg-red-500" />
        <span className="w-3 h-3 rounded-full bg-yellow-500" />
        <span className="w-3 h-3 rounded-full bg-green-500" />
        <span className="ml-3 text-slate-400 text-xs select-none">contact@leo:~$</span>
      </div>

      {/* subtle scanline overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.04]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, #10b981 0px, #10b981 1px, transparent 1px, transparent 3px)' }}
      />

      {/* scrollable content */}
      <div
        ref={bodyRef}
        className="relative h-[360px] overflow-y-auto p-4 leading-relaxed"
        style={{ textShadow: '0 0 5px rgba(16,185,129,0.5)' }}
      >
        {/* accessible live summary of captured input */}
        <span className="sr-only" aria-live="polite">
          {step >= 1 && `Name captured: ${name}. `}
          {step >= 2 && `Email captured: ${email}. `}
          {step >= 4 && `Message captured: ${message}. Message sent.`}
        </span>

        {lines.map((line, i) => (
          <div key={i} className={`${TERMINAL_LINE_COLORS[line.type]} whitespace-pre-wrap break-words`}>
            {line.text === '' ? '\u00A0' : line.text}
          </div>
        ))}

        {sending && (
          <div className="text-emerald-300 whitespace-pre">
            {`> ${'█'.repeat(filled)}${'░'.repeat(Math.max(0, 20 - filled))} ${progress}%`}
          </div>
        )}

        {step < 3 && (
          <div className="flex items-center text-slate-200">
            <span className="text-emerald-400 mr-2 shrink-0 select-none">visitor@leo:~$</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleEnter() } }}
              disabled={sending || step >= 3}
              aria-label={inputLabel}
              autoComplete="off"
              spellCheck={false}
              className="bg-transparent outline-none text-slate-200 caret-transparent font-mono"
              style={{ width: `${Math.max(input.length, 1)}ch` }}
            />
            <span
              className="inline-block w-[8px] h-[1.05em] bg-emerald-400 align-middle"
              style={{ animation: 'blink-cursor 1s step-end infinite' }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── PR REVIEW-STYLE TESTIMONIALS ─────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

const AVATAR_GRADIENTS = [
  'from-emerald-500 to-emerald-700',
  'from-blue-500 to-blue-700',
  'from-violet-500 to-violet-700',
  'from-amber-500 to-amber-700',
  'from-pink-500 to-pink-700',
]

const REACTION_EMOJI = { thumbsUp: '👍', heart: '❤️', rocket: '🚀' } as const

function PRStyleTestimonials() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const inView = useInView(wrapRef, { once: true, margin: '-100px' })

  return (
    <div ref={wrapRef} className="space-y-6 max-w-3xl mx-auto">
      {TESTIMONIALS_DATA.map((t, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: i * 0.2, duration: 0.5, ease: 'easeOut' }}
          className="bg-[#0d1117] border border-slate-700/60 rounded-xl overflow-hidden font-mono hover:border-emerald-500/30 transition-all duration-300"
        >
          {/* Card header (top bar) */}
          <div className="flex items-center justify-between gap-3 bg-[#161b22] px-4 py-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" style={{ boxShadow: '0 0 6px rgba(16,185,129,0.6)' }} />
              <span className="text-slate-300 font-mono text-sm truncate">#{t.pr} Review: "Working with Leo"</span>
            </div>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-3 py-0.5 text-xs font-bold font-mono shrink-0">APPROVED</span>
          </div>

          {/* Card body */}
          <div className="p-5">
            {/* Author row */}
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]} flex items-center justify-center text-white font-semibold text-sm shrink-0`}>
                {t.avatar}
              </div>
              <div className="min-w-0">
                <div className="text-sm">
                  <span className="text-slate-200 font-semibold">{t.name}</span>
                  <span className="text-slate-400"> approved this pull request</span>
                </div>
                <div className="text-sm mt-0.5">
                  <span className="text-slate-500">{t.role} @ {t.company}</span>
                  <span className="text-slate-600"> • {t.date}</span>
                </div>
              </div>
            </div>

            {/* Quote block */}
            <div className="bg-[#1c2128] border-l-4 border-emerald-500/50 rounded-r-lg px-4 py-3 mt-4 mb-4">
              <p className="text-slate-200 text-sm italic leading-relaxed">"{t.quote}"</p>
            </div>

            {/* Reactions row */}
            <div className="flex flex-wrap items-center gap-2">
              {(Object.keys(t.reactions) as Array<keyof typeof t.reactions>).map((key) => (
                <span key={key} className="bg-slate-800/60 border border-slate-700/50 rounded-full px-2.5 py-1 text-xs flex items-center gap-1.5">
                  <span>{REACTION_EMOJI[key]}</span>
                  <span className="text-slate-300">{t.reactions[key]}</span>
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── VS CODE EXPLORER — PROJECTS SHOWCASE ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function VSCodeExplorer() {
  const [activeProject, setActiveProject] = useState(0)
  const [openTabs, setOpenTabs] = useState<number[]>([0])
  const [folders, setFolders] = useState({ projects: true, featured: true, openSource: true })
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false)

  const toggle = (key: keyof typeof folders) => setFolders((f) => ({ ...f, [key]: !f[key] }))

  const openFile = (idx: number) => {
    setActiveProject(idx)
    setOpenTabs((prev) => {
      if (prev.includes(idx)) return prev
      const next = [...prev, idx]
      return next.length > 4 ? next.slice(next.length - 4) : next
    })
  }

  const closeTab = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setOpenTabs((prev) => {
      const next = prev.filter((t) => t !== idx)
      if (idx === activeProject && next.length) setActiveProject(next[next.length - 1])
      return next
    })
  }

  const featuredIdx = PROJECTS.map((_, i) => i).filter((i) => PROJECTS[i].featured)
  const openSourceIdx = PROJECTS.map((_, i) => i).filter((i) => !PROJECTS[i].featured)
  const hasOpen = openTabs.length > 0
  const project = PROJECTS[activeProject]

  // syntax colors
  const kw = 'text-violet-400', str = 'text-amber-300', typ = 'text-emerald-300'
  const num = 'text-blue-300', cm = 'text-slate-500 italic', vr = 'text-slate-200', pn = 'text-slate-400'

  const pascal = project.title.replace(/[^a-zA-Z0-9]/g, ' ').split(' ').filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join('')
  const features = project.desc.replace(/\.$/, '').split(/,| and | with /).map((s) => s.trim()).filter(Boolean)

  const codeLines: React.ReactNode[] = [
    <span key="c0" className={cm}>// {project.title}</span>,
    <span key="c1" className={cm}>// {project.desc}</span>,
    <span key="c2">&nbsp;</span>,
    <span key="c3"><span className={kw}>import</span> <span className={pn}>{'{'}</span> <span className={vr}>{project.tags.join(', ')}</span> <span className={pn}>{'}'}</span> <span className={kw}>from</span> <span className={str}>'@stack'</span></span>,
    <span key="c4">&nbsp;</span>,
    <span key="c5"><span className={kw}>interface</span> <span className={typ}>ProjectConfig</span> <span className={pn}>{'{'}</span></span>,
    <span key="c6">{'  '}<span className={vr}>name</span><span className={pn}>:</span> <span className={str}>'{project.title}'</span></span>,
    <span key="c7">{'  '}<span className={vr}>status</span><span className={pn}>:</span> <span className={str}>'shipped'</span> <span className={pn}>|</span> <span className={str}>'in-progress'</span></span>,
    <span key="c8">{'  '}<span className={vr}>stars</span><span className={pn}>:</span> <span className={num}>{project.stars}</span></span>,
    <span key="c9">{'  '}<span className={vr}>featured</span><span className={pn}>:</span> <span className={num}>{String(project.featured)}</span></span>,
    <span key="c10"><span className={pn}>{'}'}</span></span>,
    <span key="c11">&nbsp;</span>,
    <span key="c12"><span className={kw}>export default function</span> <span className={typ}>{pascal}</span><span className={pn}>() {'{'}</span></span>,
    <span key="c13">{'  '}<span className={cm}>// Core Features</span></span>,
    <span key="c14">{'  '}<span className={kw}>const</span> <span className={vr}>features</span> <span className={pn}>=</span> <span className={pn}>[</span></span>,
    ...features.map((f, k) => (
      <span key={`f${k}`}>{'    '}<span className={str}>'{f}'</span><span className={pn}>,</span></span>
    )),
    <span key="c15">{'  '}<span className={pn}>]</span></span>,
    <span key="c16">&nbsp;</span>,
    <span key="c17">{'  '}<span className={kw}>return</span> <span className={pn}>&lt;</span><span className={typ}>Production</span> <span className={pn}>/&gt;</span></span>,
    <span key="c18"><span className={pn}>{'}'}</span></span>,
  ]

  const FileRow = ({ idx, showStar }: { idx: number; showStar?: boolean }) => {
    const p = PROJECTS[idx]
    const active = idx === activeProject
    return (
      <button
        onClick={() => openFile(idx)}
        className={`w-full flex items-center gap-2 pl-10 pr-3 py-1 text-left transition-colors ${active ? 'bg-[#2a2a3c]' : 'hover:bg-[#22222f]'}`}
        style={{ borderLeft: active ? `2px solid ${p.color}` : '2px solid transparent' }}
      >
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: p.color }} />
        <span className={`truncate ${active ? 'text-slate-200' : 'text-slate-400'}`}>{p.file}.tsx</span>
        {showStar && <Star size={11} className="ml-auto text-amber-400 shrink-0" fill="currentColor" />}
      </button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
      className="border border-slate-700/60 rounded-xl overflow-hidden shadow-2xl shadow-black/30 min-h-[550px] flex flex-col font-mono"
      style={{ background: '#1e1e2e' }}
    >
      {/* ── Title bar ── */}
      <div className="h-9 flex items-center px-4 justify-between shrink-0" style={{ background: '#181825' }}>
        <div className="flex gap-2">
          <span className="w-3 h-3 rounded-full" style={{ background: '#ff5f56' }} />
          <span className="w-3 h-3 rounded-full" style={{ background: '#ffbd2e' }} />
          <span className="w-3 h-3 rounded-full" style={{ background: '#27c93f' }} />
        </div>
        <div className="text-slate-500 text-xs font-mono">portfolio — ~/projects</div>
        <div className="flex gap-1.5 text-slate-600">
          <span className="w-3 h-[2px] bg-slate-600 self-center" />
          <span className="w-2.5 h-2.5 border border-slate-600" />
          <X size={12} />
        </div>
      </div>

      {/* ── Main ── */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-60 border-r border-slate-700/40 shrink-0" style={{ background: '#181825' }}>
          <div className="text-[10px] uppercase tracking-widest text-slate-500 px-4 py-2">EXPLORER</div>
          <div className="flex-1 overflow-y-auto text-sm pb-2">
            <button onClick={() => toggle('projects')} className="w-full flex items-center gap-1 px-2 py-1 text-slate-300 hover:bg-[#22222f]">
              {folders.projects ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <Folder size={14} className="text-blue-300" />
              <span>projects</span>
            </button>
            {folders.projects && (
              <>
                <button onClick={() => toggle('featured')} className="w-full flex items-center gap-1 pl-6 pr-2 py-1 text-slate-300 hover:bg-[#22222f]">
                  {folders.featured ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  <Folder size={14} className="text-amber-300" />
                  <span>featured</span>
                </button>
                {folders.featured && featuredIdx.map((idx) => <FileRow key={idx} idx={idx} showStar />)}
                <button onClick={() => toggle('openSource')} className="w-full flex items-center gap-1 pl-6 pr-2 py-1 text-slate-300 hover:bg-[#22222f]">
                  {folders.openSource ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  <Folder size={14} className="text-emerald-300" />
                  <span>open-source</span>
                </button>
                {folders.openSource && openSourceIdx.map((idx) => <FileRow key={idx} idx={idx} />)}
              </>
            )}
          </div>
        </aside>

        {/* Editor pane */}
        <div className="flex-1 flex flex-col min-w-0" style={{ background: '#1e1e2e' }}>
          {/* Mobile file selector — custom dropdown */}
          <div className="md:hidden border-b border-slate-700/40 px-3 py-2 relative" style={{ background: '#181825' }}>
            <button
              onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
              className="w-full flex items-center justify-between gap-2 bg-[#1e1e2e] text-slate-200 text-sm font-mono border border-slate-700/60 rounded-lg px-3 py-2.5 outline-none hover:border-slate-500/80 transition-all duration-200"
              style={{ boxShadow: mobileDropdownOpen ? `0 0 12px ${project.color}20` : 'none', borderColor: mobileDropdownOpen ? `${project.color}60` : undefined }}
            >
              <span className="flex items-center gap-2 truncate">
                <File size={14} style={{ color: project.color }} />
                <span className="truncate">{project.file}.tsx</span>
              </span>
              <motion.span
                animate={{ rotate: mobileDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-slate-500"
              >
                <ChevronDown size={16} />
              </motion.span>
            </button>
            <AnimatePresence>
              {mobileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="absolute left-3 right-3 top-full mt-1 z-50 rounded-xl border border-slate-700/60 overflow-hidden backdrop-blur-xl"
                  style={{ background: 'rgba(24,24,37,0.95)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                >
                  {PROJECTS.map((p, i) => (
                    <motion.button
                      key={p.file}
                      onClick={() => { openFile(i); setMobileDropdownOpen(false) }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 ${
                        i === activeProject
                          ? 'bg-white/[0.06] text-white'
                          : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                      }`}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${p.color}15`, border: `1px solid ${p.color}30` }}>
                        <File size={14} style={{ color: p.color }} />
                      </span>
                      <span className="flex flex-col min-w-0">
                        <span className="text-sm font-mono truncate">{p.file}.tsx</span>
                        <span className="text-[10px] text-slate-600 truncate">{p.title}</span>
                      </span>
                      {i === activeProject && (
                        <span className="ml-auto w-2 h-2 rounded-full shrink-0" style={{ background: p.color, boxShadow: `0 0 6px ${p.color}` }} />
                      )}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tab bar */}
          {hasOpen && (
            <div className="hidden md:flex items-stretch border-b border-slate-700/40 overflow-x-auto shrink-0" style={{ background: '#181825' }}>
              {openTabs.map((idx) => {
                const p = PROJECTS[idx]
                const active = idx === activeProject
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveProject(idx)}
                    className={`group flex items-center gap-2 px-3 py-2 text-xs border-r border-slate-700/40 whitespace-nowrap ${active ? 'text-slate-200' : 'text-slate-500'}`}
                    style={{ background: active ? '#1e1e2e' : '#181825', borderBottom: active ? `2px solid ${p.color}` : '2px solid transparent' }}
                  >
                    <File size={12} style={{ color: p.color }} />
                    <span>{p.file}.tsx</span>
                    <span onClick={(e) => closeTab(idx, e)} className="ml-1 rounded hover:bg-slate-700/60 p-0.5 opacity-60 group-hover:opacity-100">
                      <X size={11} />
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Content + minimap */}
          <div className="flex flex-1 min-h-0">
            <div className="flex-1 overflow-auto py-4 text-[13px] leading-6">
              {hasOpen ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeProject}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {codeLines.map((line, i) => (
                      <div key={i} className="flex">
                        <span className="text-slate-600 text-right pr-4 pl-3 select-none w-12 shrink-0">{i + 1}</span>
                        <span className="whitespace-pre pr-4">{line}</span>
                      </div>
                    ))}
                    {/* Project visual thumbnails from the V5 codebase */}
                    {project.caseStudy && project.caseStudy.gallery.length > 0 && (
                      <div className="mt-4 ml-12 flex flex-wrap gap-2">
                        {project.caseStudy.gallery.slice(0, 3).map((g) => (
                          <img key={g} src={g} alt="" loading="lazy"
                            className="h-20 w-auto max-w-[150px] rounded-lg border border-slate-700/50 bg-white object-contain p-1.5 transition-transform duration-300 hover:scale-110 hover:-translate-y-1" />
                        ))}
                      </div>
                    )}
                    {/* View Project action */}
                    <div className="mt-6 ml-12 flex items-center gap-3">
                      <RouterLink
                        to={`/portfolio/project/${project.slug}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        style={{ background: `${project.color}20`, color: project.color, border: `1px solid ${project.color}40` }}
                      >
                        <File size={13} />
                        Case Study
                      </RouterLink>
                      {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        style={{ background: `${project.color}20`, color: project.color, border: `1px solid ${project.color}40` }}
                      >
                        <ExternalLink size={13} />
                        View Live Project
                      </a>
                      )}
                      {project.sourceUrl && (
                      <a
                        href={project.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800/60 text-slate-300 border border-slate-700/50 transition-all duration-300 hover:scale-105 hover:bg-slate-700/60"
                      >
                        <GitBranch size={13} />
                        Source Code
                      </a>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-600 gap-3 px-6">
                  <Folder size={40} className="text-slate-700" />
                  <p className="text-sm">No file open</p>
                  <p className="text-xs text-slate-700">Select a project from the explorer to view its source</p>
                </div>
              )}
            </div>

            {/* Minimap */}
            {hasOpen && (
              <div className="hidden md:flex flex-col gap-[3px] w-[30px] py-4 px-1 shrink-0 border-l border-slate-800/60">
                {Array.from({ length: 60 }).map((_, i) => {
                  const colors = ['#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#64748b']
                  const c = colors[i % colors.length]
                  const w = 20 + ((i * 37) % 70)
                  return <div key={i} className="h-[2px] rounded-full" style={{ width: `${w}%`, background: c, opacity: 0.25 }} />
                })}
              </div>
            )}
          </div>

          {/* Status bar */}
          <div className="h-7 flex items-center justify-between px-3 text-xs text-slate-500 shrink-0" style={{ background: '#181825' }}>
            <div className="flex items-center gap-1">
              <GitBranch size={12} />
              <span>main</span>
            </div>
            <div className="hidden sm:block">Ln 1, Col 1</div>
            <div className="flex items-center gap-3">
              <span>TypeScript React</span>
              <span>UTF-8</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════
// ─── CAREER CHRONICLE — PINNED SCROLLYTELLING ─────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════════════════

// ─── CI/CD pipeline stage names (mapped to metrics by index) ───
const PIPELINE_STAGES = ['Build', 'Test', 'Deploy', 'Monitor', 'Scale']

// ─── Animated metric value — counts up the first numeric group when scrolled into view ───
function CountUpValue({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const mv = useMotionValue(0)
  const parsed = useMemo(() => {
    const m = value.match(/^([^0-9]*)([0-9][0-9.,]*)(.*)$/)
    if (!m) return null
    return { prefix: m[1], target: parseFloat(m[2].replace(/,/g, '')), decimals: (m[2].split('.')[1] ?? '').length, suffix: m[3] }
  }, [value])
  const text = useTransform(mv, (v) => (parsed ? `${parsed.prefix}${v.toFixed(parsed.decimals)}${parsed.suffix}` : value))
  useEffect(() => {
    if (!inView || !parsed) return
    const controls = animate(mv, parsed.target, { duration: 1.3, ease: [0.16, 1, 0.3, 1] })
    return () => controls.stop()
  }, [inView, parsed, mv])
  return (
    <span ref={ref}>
      <motion.span>{text}</motion.span>
    </span>
  )
}

function CareerChapter({ chapter, index }: { chapter: typeof CAREER_CHAPTERS[number]; index: number }) {
  const isLast = index === CAREER_CHAPTERS.length - 1
  const hash = chapter.company.split('').reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) & 0xfffffff, 0).toString(16).slice(0, 7)
  const slug = chapter.company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '')

  // Scroll progress of this chapter — drives the branch-rail fill
  const chapterRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: chapterRef, offset: ['start end', 'end center'] })
  const railScale = useSpring(scrollYProgress, { stiffness: 90, damping: 25, mass: 0.4 })

  return (
    <div ref={chapterRef} className="relative py-24 md:py-32 pl-10 md:pl-24">
      {/* Background gradient per chapter */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 30%, ${chapter.color}15, transparent 70%)` }} />

      {/* ─── Git branch timeline (left rail) ─── */}
      <div className="absolute left-4 md:left-12 top-0 bottom-0 pointer-events-none">
        {/* Main branch — vertical dashed line spanning the whole chapter */}
        <div className="absolute top-0 bottom-0 left-0 w-px border-l border-dashed border-slate-600/70" />
        {/* Scroll progress — the branch fills with color as the chapter is read */}
        <motion.div className="absolute top-0 bottom-0 -left-[1px] w-[3px] origin-top rounded-full"
          style={{ scaleY: railScale, background: `linear-gradient(to bottom, ${chapter.color}, ${chapter.color}55)`, boxShadow: `0 0 6px ${chapter.color}66` }} />

        {/* Commit node + horizontal branch, aligned with the chapter header */}
        <div className="absolute top-24 md:top-32 left-0">
          {/* Commit node (12px circle, glows on the current chapter) */}
          <motion.div
            className="absolute -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
            style={{ backgroundColor: chapter.color }}
            animate={isLast
              ? { boxShadow: [`0 0 0 2px ${chapter.color}40`, `0 0 0 7px ${chapter.color}00`, `0 0 0 2px ${chapter.color}40`] }
              : { boxShadow: `0 0 0 2px ${chapter.color}30` }}
            transition={isLast ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
          />
          {/* Horizontal branch line (40px) — hidden on mobile */}
          <div className="hidden md:block absolute top-0 left-0 -translate-y-1/2 h-px" style={{ width: '40px', background: `linear-gradient(to right, ${chapter.color}, ${chapter.color}40)` }} />
          {/* Branch label — hidden on mobile to prevent overlap */}
          <div className="hidden md:flex absolute top-0 -translate-y-1/2 whitespace-nowrap font-mono text-xs items-center gap-2" style={{ left: '48px' }}>
            <span style={{ color: chapter.color }}>feature/{slug}</span>
            {isLast
              ? <span className="text-amber-400 animate-pulse">in progress...</span>
              : <span className="text-emerald-400">merged ✓</span>}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-12">
        {/* Chapter Header */}
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7 }}
          className="text-center mb-16">
          <div className="font-mono text-xs mb-4 flex items-center justify-center gap-2 flex-wrap">
            <span className="text-amber-400">{hash}</span>
            <span className="text-slate-500">—</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] border" style={{ color: chapter.color, borderColor: `${chapter.color}50` }}>
              feature/{slug}
            </span>
            {index < CAREER_CHAPTERS.length - 1
              ? <span className="text-emerald-400 text-[10px]">merged ✓</span>
              : <span className="text-amber-400 text-[10px] animate-pulse">in progress...</span>}
          </div>
          <h2 className="font-display text-6xl md:text-8xl font-bold mb-3 bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(135deg, ${chapter.color} 20%, ${chapter.color}bb 55%, ${chapter.color}55 100%)`, filter: `drop-shadow(0 0 30px ${chapter.color}33)` }}>{chapter.year}</h2>
          <h3 className="font-display text-2xl md:text-3xl font-bold text-slate-100">{chapter.company}</h3>
          <div className="mt-3">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium" style={{ color: chapter.color, borderColor: `${chapter.color}40`, background: `${chapter.color}0f` }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: chapter.color, boxShadow: `0 0 8px ${chapter.color}` }} />
              {chapter.role}
            </span>
          </div>
          <span className="font-mono text-xs text-slate-600 mt-3 block">{chapter.duration}</span>
        </motion.div>

        {/* The Mission — emotional pull-quote */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6 }}
          className="text-center mb-16 max-w-3xl mx-auto">
          <span className="font-mono text-xs text-slate-500 uppercase tracking-widest mb-6 block">The Mission</span>
          <div className="relative px-8 md:px-14">
            <span aria-hidden className="absolute -top-4 left-0 md:-left-2 text-7xl leading-none font-serif select-none pointer-events-none" style={{ color: `${chapter.color}33` }}>&ldquo;</span>
            <p className="text-xl md:text-2xl text-slate-200 font-light leading-relaxed">{chapter.challenge}</p>
            <span aria-hidden className="absolute -bottom-6 right-0 md:-right-2 text-7xl leading-none font-serif select-none pointer-events-none" style={{ color: `${chapter.color}33` }}>&rdquo;</span>
          </div>
          <div className="mt-8 mx-auto h-px w-24" style={{ background: `linear-gradient(to right, transparent, ${chapter.color}80, transparent)` }} />
        </motion.div>

        {/* What I Built */}
        <div className="mb-16">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="font-mono text-xs text-slate-500 uppercase tracking-widest mb-6 block text-center">What I Built</motion.span>
          <div className="grid md:grid-cols-2 gap-5">
            {chapter.projects.map((p, i) => (
              <motion.div key={p.name} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: (i % 2) * 0.1, duration: 0.5 }}
                className="group relative p-6 rounded-2xl bg-slate-900/50 border backdrop-blur-sm overflow-hidden transition-[translate,border-color,box-shadow] duration-300 hover:-translate-y-1.5"
                style={{ borderColor: `${chapter.color}30` }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${chapter.color}90`; e.currentTarget.style.boxShadow = `0 12px 40px -12px ${chapter.color}50` }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${chapter.color}30`; e.currentTarget.style.boxShadow = 'none' }}
                onMouseMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect()
                  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
                  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
                }}>
                {/* Feature illustration or technical diagram — bleeds to the card edges */}
                {p.visual ? (
                  <div className="relative -mx-6 -mt-6 mb-5 h-40 overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-200 border-b border-slate-800/60">
                    <div className="w-full h-full p-4 transition-transform duration-500 ease-out group-hover:scale-105">
                      <ProjectVisual type={p.visual} color={chapter.color} />
                    </div>
                    <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(to top, ${chapter.color}14, transparent 60%)` }} />
                  </div>
                ) : p.image && (
                  <div className="relative -mx-6 -mt-6 mb-5 h-40 overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-200 border-b border-slate-800/60">
                    <img src={p.image} alt={p.name} loading="lazy"
                      className="w-full h-full object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-110" />
                    <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(to top, ${chapter.color}14, transparent 60%)` }} />
                    {/* Light sheen — sweeps across the illustration on hover */}
                    <div className="absolute top-[-30%] bottom-[-30%] w-1/3 -left-1/3 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-0 group-hover:translate-x-[450%] transition-transform duration-[1100ms] ease-out pointer-events-none" />
                  </div>
                )}
                {/* Title with index chip */}
                <div className="flex items-start gap-3 mb-2">
                  <span className="shrink-0 mt-0.5 w-6 h-6 rounded-md flex items-center justify-center font-mono text-[11px] font-bold"
                    style={{ color: chapter.color, background: `${chapter.color}18`, border: `1px solid ${chapter.color}45` }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h4 className="font-semibold text-base leading-snug" style={{ color: chapter.color }}>{p.name}</h4>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">{p.desc}</p>
                {/* Punchy stat chips replacing long paragraphs */}
                {p.badges && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {p.badges.map((b, j) => (
                      <motion.span key={b} initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: j * 0.08, type: 'spring', stiffness: 300 }}
                        className="px-2.5 py-1 rounded-full font-mono text-[10px] tracking-wide"
                        style={{ color: chapter.color, background: `${chapter.color}12`, border: `1px solid ${chapter.color}45` }}>
                        {b}
                      </motion.span>
                    ))}
                  </div>
                )}
                {/* Brand / payment logo strip */}
                {p.logos && p.logos.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {p.logos.map((l) => (
                      <img key={l} src={l} alt="" loading="lazy"
                        className="h-7 w-auto max-w-[52px] object-contain rounded-md bg-white px-1.5 py-1 shadow-sm border border-slate-200/80 transition-transform duration-300 hover:scale-125 hover:-translate-y-0.5" />
                    ))}
                    {p.logos.length > 6 && <span className="font-mono text-[10px] text-slate-500">+{p.logos.length - 6} more</span>}
                  </div>
                )}
                {/* Cursor spotlight — follows the mouse across the card */}
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(320px circle at var(--mx, 50%) var(--my, 50%), ${chapter.color}14, transparent 70%)` }} />
                {/* Corner glow accent */}
                <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-[80px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at top right, ${chapter.color}25, transparent 70%)` }} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* The Impact — CI/CD deployment pipeline */}
        <div className="mb-16">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="font-mono text-xs text-slate-500 uppercase tracking-widest mb-8 block text-center">The Impact</motion.span>
          <div className="flex flex-col md:flex-row items-center justify-center gap-0">
            {chapter.metrics.map((m, i) => {
              const stage = PIPELINE_STAGES[i] ?? PIPELINE_STAGES[PIPELINE_STAGES.length - 1]
              return (
                <div key={m.label} className="flex flex-col md:flex-row items-center">
                  <motion.div
                    initial={{ opacity: 0.4, scale: 0.95, borderColor: 'rgba(100,116,139,0.5)' }}
                    whileInView={{ opacity: 1, scale: 1, borderColor: chapter.color }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ delay: i * 0.2, duration: 0.45, ease: 'easeOut' }}
                    className="relative w-44 md:w-36 bg-[#0d1117] border rounded-lg px-4 pt-3 pb-5 text-center">
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2">{stage}</span>
                    <p className="font-mono text-3xl md:text-4xl font-bold leading-none" style={{ color: chapter.color }}><CountUpValue value={m.value} /></p>
                    <p className="text-xs text-slate-500 mt-2 leading-tight">{m.label}</p>
                    <span className="absolute bottom-1.5 right-2 text-emerald-400 text-xs">✓</span>
                  </motion.div>
                  {/* Connecting arrow */}
                  {i < chapter.metrics.length - 1 && (
                    <motion.div
                      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.2 + 0.15 }}
                      className="flex items-center justify-center text-slate-600 font-mono select-none px-2">
                      <span className="hidden md:inline tracking-tighter">╌╌▶</span>
                      <span className="md:hidden py-1">▼</span>
                    </motion.div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Skills Acquired */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.5 }}>
          <span className="font-mono text-xs text-slate-500 uppercase tracking-widest mb-5 block text-center">Skills Acquired</span>
          <div className="flex flex-wrap justify-center gap-2">
            {chapter.skills.map((s, i) => (
              <motion.span key={s} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05, type: 'spring' }}
                className="px-3 py-1.5 rounded-full border text-xs font-mono" style={{ borderColor: `${chapter.color}60`, color: chapter.color }}>
                {s}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Connector to next chapter */}
      {index < CAREER_CHAPTERS.length - 1 && (
        <div className="flex justify-center mt-20">
          <div className="h-20 w-px" style={{ background: `linear-gradient(to bottom, ${chapter.color}60, transparent)` }} />
        </div>
      )}
    </div>
  )
}
