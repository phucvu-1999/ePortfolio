import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  Monitor, Server, Cloud, Palette, MapPin, Mail, ExternalLink, Clock,
  Briefcase, Star, Quote, ChevronRight, ChevronDown, Terminal,
  GitBranch, Code, Activity, Box, CreditCard, ArrowUp,
  Tablet, Flame, Smartphone, Package, ScanLine, Zap,
  Tag, Calculator, Receipt, PackageMinus, ChefHat, Radio,
  ArrowRight, Wifi, WifiOff, CheckCircle, Database, Gift,
} from 'lucide-react'
import {
  CAREER_CHAPTERS, PROJECTS, TESTIMONIALS_DATA, SKILLS_GRAPH,
  SKILL_CAT_COLORS, SKILL_CAT_LABELS, SOCIAL_LINKS, CONTACT_EMAIL,
  HERO_NAME, HERO_ROLE,
} from './portfolio/content'
import type { SkillCategory } from './portfolio/content'
import StyleSwitcher from '../components/StyleSwitcher'

/* ── Brand SVG icons (not in lucide-react v1) ─────────────────────────────── */

const GithubSvg = ({ size = 20, className }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
)
const LinkedinSvg = ({ size = 20, className }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)
const TwitterSvg = ({ size = 20, className }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

/* ─── Shared Constants ────────────────────────────────────────────────────── */

const CARD_BASE = 'rounded-[20px] border border-[#1a1a2e] overflow-hidden relative group/card bento-card'
const CARD_BG = 'bg-[#111113]'
const GLASS = 'bg-[rgba(17,17,19,0.8)] backdrop-blur-xl'

const cardMotion = (i: number) => ({
  initial: { opacity: 0, y: 20 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: '-40px' } as const,
  transition: { duration: 0.45, delay: i * 0.05, ease: [0.25, 0.46, 0.45, 0.94] as const },
  whileHover: { y: -5, scale: 1.012, transition: { type: 'spring', stiffness: 420, damping: 26, delay: 0 } } as const,
  whileTap: { scale: 0.99, transition: { duration: 0.12, delay: 0 } } as const,
})

const glowShadow = (color: string) =>
  `0 4px 24px ${color}22, 0 0 48px ${color}11`

const CAT_ICONS: Record<SkillCategory, typeof Monitor> = {
  frontend: Monitor, backend: Server, devops: Cloud, design: Palette,
}

const SOCIAL_ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> = {
  GitHub: GithubSvg, LinkedIn: LinkedinSvg, Twitter: TwitterSvg,
}

/* ─── useCountUp — animated number on scroll ──────────────────────────────── */

function useCountUp(end: number, duration = 1200) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * end))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [inView, end, duration])

  return { ref, value }
}

/* ─── useCursorGlow — spotlight following mouse (GPU transform, no re-render) ─ */

function useCursorGlow() {
  const ref = useRef<HTMLDivElement>(null)
  const lastCard = useRef<HTMLElement | null>(null)

  const clearCard = useCallback(() => {
    const el = lastCard.current
    if (!el) return
    el.style.removeProperty('--mx')
    el.style.removeProperty('--my')
    lastCard.current = null
  }, [])

  const onMove = useCallback((e: React.MouseEvent) => {
    const glow = ref.current
    if (glow) {
      glow.style.transform = `translate3d(${e.clientX - 300}px, ${e.clientY - 300}px, 0)`
    }
    // feed the per-card spotlight inside whichever card is hovered
    const target = (e.target as HTMLElement).closest('.bento-card') as HTMLElement | null
    if (lastCard.current && lastCard.current !== target) clearCard()
    if (target) {
      const rect = target.getBoundingClientRect()
      target.style.setProperty('--mx', `${e.clientX - rect.left}px`)
      target.style.setProperty('--my', `${e.clientY - rect.top}px`)
      lastCard.current = target
    }
  }, [clearCard])

  const onLeave = useCallback(() => clearCard(), [clearCard])

  return { onMove, onLeave, ref }
}

/* ─── Contribution heatmap data (deterministic pseudo-random) ─────────────── */

const HEATMAP_DATA = (() => {
  const data: number[][] = []
  let s = 42
  for (let col = 0; col < 15; col++) {
    const week: number[] = []
    for (let row = 0; row < 7; row++) {
      s = (s * 16807 + 7) % 2147483647
      const v = s % 100
      week.push(v < 30 ? 0 : v < 55 ? 1 : v < 75 ? 2 : v < 90 ? 3 : 4)
    }
    data.push(week)
  }
  return data
})()

const HEATMAP_COLORS = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353']

/* ─── Weekly commit data for activity chart ───────────────────────────────── */

const ACTIVITY_DATA = [3, 7, 5, 12, 8, 15, 10, 18, 6, 14, 9, 11]

/* ─── Animated rotating border overlay ────────────────────────────────────── */

function AnimatedBorder() {
  return (
    <>
      <div
        className="absolute inset-0 rounded-[20px] opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
        style={{
          background: 'conic-gradient(from var(--border-angle, 0deg), transparent 40%, #10b981 50%, #3b82f6 60%, #8b5cf6 70%, transparent 80%)',
          padding: '1px',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          animation: 'border-spin 3s linear infinite',
        }}
      />
      {/* cursor-tracking sheen fed by --mx / --my set on the card root */}
      <div
        className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(320px circle at var(--mx, 50%) var(--my, 50%), rgba(228,228,231,0.07), rgba(16,185,129,0.07) 45%, transparent 72%)',
        }}
      />
    </>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CARD COMPONENTS
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/* ─── Hero Card (2×2) ─────────────────────────────────────────────────────── */

const HERO_PILLS = ['React', '.NET 8', 'gRPC', 'Singapore', 'WPF', 'TypeScript']

function HeroCard() {
  return (
    <motion.div
      {...cardMotion(0)}
      style={{ boxShadow: glowShadow('#10b981') }}
      className={`${CARD_BASE} ${CARD_BG} p-8 flex flex-col justify-end col-span-1 row-span-2 md:col-span-2 md:row-span-2 min-h-[320px]`}
    >
      <AnimatedBorder />
      {/* animated gradient mesh */}
      <div
        className="absolute inset-0 pointer-events-none animate-gradient-shift"
        style={{
          background:
            'radial-gradient(ellipse at 30% 20%, rgba(16,185,129,0.15) 0%, transparent 60%), ' +
            'radial-gradient(ellipse at 80% 70%, rgba(59,130,246,0.10) 0%, transparent 60%), ' +
            'radial-gradient(ellipse at 60% 40%, rgba(139,92,246,0.08) 0%, transparent 50%)',
          backgroundSize: '200% 200%',
        }}
      />
      {/* floating pill badges */}
      <div className="absolute top-6 right-6 flex flex-wrap gap-2 max-w-[200px] justify-end">
        {HERO_PILLS.map((pill, idx) => (
          <motion.span
            key={pill}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + idx * 0.1, duration: 0.4 }}
            whileHover={{ scale: 1.1, y: -2, transition: { duration: 0.15 } }}
            className="text-[10px] px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 backdrop-blur-sm cursor-default"
          >
            {pill}
          </motion.span>
        ))}
      </div>
      <div className="relative z-10 mt-auto">
        <div className="flex items-center gap-2 mb-6">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-emerald-400 text-xs font-medium tracking-wide uppercase">Available for opportunities</span>
        </div>
        <h1 className="bento-hero-title text-4xl md:text-5xl lg:text-6xl font-bold text-[#e4e4e7] tracking-tight leading-none mb-3">
          {HERO_NAME}
        </h1>
        <p className="text-[#71717a] text-base md:text-lg max-w-md">{HERO_ROLE}</p>
      </div>
    </motion.div>
  )
}

/* ─── Stat Card (1×1) with animated count-up ──────────────────────────────── */

function StatCard({ value, label, color, i }: { value: string; label: string; color: string; i: number }) {
  const numericMatch = value.match(/^(\d+)/)
  const numEnd = numericMatch ? parseInt(numericMatch[1], 10) : 0
  const suffix = value.replace(/^\d+/, '')
  const { ref, value: count } = useCountUp(numEnd)

  return (
    <motion.div
      {...cardMotion(i)}
      style={{ boxShadow: glowShadow(color) }}
      className={`${CARD_BASE} ${CARD_BG} p-6 flex flex-col justify-between min-h-[140px]`}
    >
      <AnimatedBorder />
      <span ref={ref} className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color }}>
        {numEnd > 0 ? count : value}{numEnd > 0 ? suffix : ''}
      </span>
      <span className="text-[#71717a] text-sm mt-2">{label}</span>
    </motion.div>
  )
}

/* ─── Location Card (1×1) ─────────────────────────────────────────────────── */

function LocationCard() {
  return (
    <motion.div
      {...cardMotion(5)}
      style={{ boxShadow: glowShadow('#10b981') }}
      className={`${CARD_BASE} ${CARD_BG} p-6 flex flex-col justify-between min-h-[140px]`}
    >
      <AnimatedBorder />
      <div className="absolute inset-0 pointer-events-none opacity-[0.06]" style={{
        backgroundImage: 'radial-gradient(circle, #e4e4e7 1px, transparent 1px)',
        backgroundSize: '16px 16px',
      }} />
      <MapPin size={18} className="text-emerald-500" />
      <div className="relative z-10">
        <p className="text-[#e4e4e7] text-lg font-semibold">Singapore</p>
        <p className="text-[#71717a] text-xs mt-1">UTC +8 · Southeast Asia</p>
      </div>
    </motion.div>
  )
}

/* ─── Clock Card (1×1) ────────────────────────────────────────────────────── */

function ClockCard() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  const sgTime = now.toLocaleTimeString('en-SG', { timeZone: 'Asia/Singapore', hour: '2-digit', minute: '2-digit', hour12: false })
  const h = parseInt(now.toLocaleString('en-SG', { timeZone: 'Asia/Singapore', hour: 'numeric', hour12: false }), 10)
  const isAwake = h >= 8 && h < 23

  return (
    <motion.div
      {...cardMotion(6)}
      style={{ boxShadow: glowShadow('#3b82f6') }}
      className={`${CARD_BASE} ${CARD_BG} p-6 flex flex-col justify-between min-h-[140px]`}
    >
      <AnimatedBorder />
      <Clock size={18} className="text-blue-500" />
      <div>
        <p className="text-[#e4e4e7] text-2xl font-bold tabular-nums tracking-tight">{sgTime}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className={`h-2 w-2 rounded-full ${isAwake ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <span className="text-[#71717a] text-xs">{isAwake ? 'Awake · Working hours' : 'Sleeping · Off hours'}</span>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Mini Contribution Heatmap Card (1×1) ────────────────────────────────── */

function HeatmapCard() {
  return (
    <motion.div
      {...cardMotion(7)}
      style={{ boxShadow: glowShadow('#26a641') }}
      className={`${CARD_BASE} ${CARD_BG} p-5 flex flex-col justify-between min-h-[140px]`}
    >
      <AnimatedBorder />
      <p className="text-[#e4e4e7] text-xs font-semibold mb-2">365 days of shipping</p>
      <div className="flex gap-[3px]">
        {HEATMAP_DATA.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((level, di) => (
              <motion.div
                key={di}
                className="hm-cell w-[7px] h-[7px] rounded-[2px]"
                style={{ background: HEATMAP_COLORS[level] }}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.005 * (wi * 7 + di), duration: 0.15 }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 mt-2">
        <span className="text-[#71717a] text-[9px]">Less</span>
        {HEATMAP_COLORS.map((c, i) => (
          <div key={i} className="w-[7px] h-[7px] rounded-[2px]" style={{ background: c }} />
        ))}
        <span className="text-[#71717a] text-[9px]">More</span>
      </div>
    </motion.div>
  )
}

/* ─── Now Playing / Status Card (1×1) ─────────────────────────────────────── */

function NowPlayingCard() {
  return (
    <motion.div
      {...cardMotion(8)}
      style={{ boxShadow: glowShadow('#8b5cf6') }}
      className={`${CARD_BASE} ${GLASS} p-6 flex flex-col justify-between min-h-[140px]`}
    >
      <AnimatedBorder />
      <div className="flex items-center justify-between">
        {/* pulsing indicator dot */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        {/* CSS equalizer bars */}
        <div className="flex items-end gap-[2px] h-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className="w-[3px] rounded-full bg-violet-500 animate-equalizer"
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: `${0.6 + i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="text-[#e4e4e7] text-sm font-semibold">Currently building</p>
        <p className="text-violet-400 text-xs mt-0.5">.NET 8 Migration</p>
        <p className="text-[#71717a] text-[10px] mt-1">& exploring distributed systems</p>
      </div>
    </motion.div>
  )
}

/* ─── About Card (2×1) ────────────────────────────────────────────────────── */

function AboutCard() {
  return (
    <motion.div
      {...cardMotion(9)}
      style={{ boxShadow: glowShadow('#10b981') }}
      className={`${CARD_BASE} ${CARD_BG} p-7 col-span-1 md:col-span-2`}
    >
      <AnimatedBorder />
      <h2 className="text-[#e4e4e7] text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
        <Briefcase size={14} className="text-emerald-500" /> About
      </h2>
      <p className="text-[#a1a1aa] text-sm leading-relaxed">
        Systems engineer with 5+ years building mission-critical POS software for Singapore retail.
        I own the payment layer — 20+ methods including NETS, PayNow, Alipay+, and GrabPay — plus
        loyalty engines, offline-first sync, and a 30-module .NET 8 ecosystem with explicit
        idempotency, recovery, and reconciliation paths.
      </p>
    </motion.div>
  )
}

/* ─── Enhanced Tech Stack Card (2×1) ──────────────────────────────────────── */

function TechStackCard() {
  const grouped = useMemo(() => {
    const map: Record<SkillCategory, typeof SKILLS_GRAPH.nodes> = {
      frontend: [], backend: [], devops: [], design: [],
    }
    SKILLS_GRAPH.nodes.forEach(n => map[n.category].push(n))
    return map
  }, [])

  const levelDots = (level: number) => {
    const filled = Math.round((level * 3) / 5)
    return Array.from({ length: 3 }, (_, i) => (i < filled ? '\u25CF' : '\u25CB')).join(' ')
  }

  return (
    <motion.div
      {...cardMotion(10)}
      style={{ boxShadow: glowShadow('#3b82f6') }}
      className={`${CARD_BASE} ${CARD_BG} p-7 col-span-1 md:col-span-2`}
    >
      <AnimatedBorder />
      <h2 className="text-[#e4e4e7] text-sm font-semibold uppercase tracking-wider mb-4">Tech Stack</h2>
      <div className="space-y-3">
        {(Object.keys(grouped) as SkillCategory[]).map(cat => {
          const CatIcon = CAT_ICONS[cat]
          const catColor = SKILL_CAT_COLORS[cat]
          return (
            <div key={cat}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <CatIcon size={12} style={{ color: catColor }} />
                <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: catColor }}>
                  {SKILL_CAT_LABELS[cat]}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {grouped[cat].map(node => (
                  <span
                    key={node.id}
                    className="text-xs px-2.5 py-1 rounded-full border cursor-default transition-all duration-300 hover:shadow-lg"
                    style={{
                      color: catColor,
                      borderColor: `${catColor}33`,
                      background: `${catColor}0d`,
                    }}
                    title={`Level: ${levelDots(node.level)}`}
                    onMouseEnter={e => {
                      const el = e.currentTarget
                      el.style.boxShadow = `0 0 12px ${catColor}44`
                      el.style.background = `${catColor}1a`
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget
                      el.style.boxShadow = 'none'
                      el.style.background = `${catColor}0d`
                    }}
                  >
                    {node.label}{' '}
                    <span className="text-[8px] ml-0.5 opacity-60">{levelDots(node.level)}</span>
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

/* ─── Interactive Experience Card (2×2) ───────────────────────────────────── */

function ExperienceCard() {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <motion.div
      {...cardMotion(11)}
      style={{ boxShadow: glowShadow('#8b5cf6') }}
      className={`${CARD_BASE} ${CARD_BG} p-7 col-span-1 row-span-1 md:col-span-2 lg:row-span-2 overflow-y-auto max-h-[600px]`}
    >
      <AnimatedBorder />
      <h2 className="text-[#e4e4e7] text-sm font-semibold uppercase tracking-wider mb-5">Experience</h2>
      <div className="relative pl-5">
        {/* vertical timeline line */}
        <div className="absolute left-[7px] top-1 bottom-1 w-px bg-[#1a1a2e]" />
        {CAREER_CHAPTERS.map(ch => {
          const isOpen = expanded === ch.year
          return (
            <div key={ch.year} className="relative mb-5 last:mb-0">
              <div
                className="absolute -left-5 top-[3px] h-3.5 w-3.5 rounded-full border-2"
                style={{ borderColor: ch.color, background: `${ch.color}33` }}
              />
              <button
                onClick={() => setExpanded(isOpen ? null : ch.year)}
                className="flex items-center gap-2 mb-1 w-full text-left"
              >
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-md"
                  style={{ color: ch.color, background: `${ch.color}1a` }}
                >
                  {ch.year}
                </span>
                <span className="text-[#e4e4e7] text-sm font-semibold flex-1">{ch.company}</span>
                <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={14} className="text-[#71717a]" />
                </motion.span>
              </button>
              <p className="text-[#71717a] text-xs mb-2">{ch.role} · {ch.duration}</p>
              {/* key metrics always visible */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {ch.metrics.slice(0, 3).map(m => (
                  <span key={m.label} className="text-[10px] px-2 py-0.5 rounded-full border border-[#1a1a2e] text-[#a1a1aa]">
                    {m.value} {m.label}
                  </span>
                ))}
              </div>
              {/* expandable detail */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 pb-1 space-y-2.5">
                      <p className="text-[#a1a1aa] text-xs italic leading-relaxed">{ch.challenge}</p>
                      <div className="flex flex-wrap gap-1">
                        {ch.skills.map(s => (
                          <span
                            key={s}
                            className="text-[10px] px-2 py-0.5 rounded-full border text-[#a1a1aa]"
                            style={{ borderColor: `${ch.color}33` }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {ch.projects.slice(0, 4).map(p => (
                          <div
                            key={p.name}
                            className="text-[10px] text-[#71717a] p-2 rounded-lg bg-[#0a0a0c] border border-[#1a1a2e]"
                          >
                            <p className="text-[#a1a1aa] font-medium truncate">{p.name}</p>
                            {p.badges && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {p.badges.slice(0, 2).map(b => (
                                  <span key={b} className="text-[9px] text-[#71717a]">{b}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

/* ─── Enhanced Project Card (2×1) ─────────────────────────────────────────── */

function ProjectCard({ project, i }: { project: typeof PROJECTS[number]; i: number }) {
  const cs = project.caseStudy

  const card = (
    <motion.div
      {...cardMotion(i)}
      style={{ boxShadow: glowShadow(project.color) }}
      className={`${CARD_BASE} ${CARD_BG} col-span-1 md:col-span-2 overflow-hidden cursor-pointer`}
    >
      <AnimatedBorder />
      {/* gradient top strip */}
      <div
        className="h-1.5"
        style={{ background: `linear-gradient(90deg, ${project.color}, ${project.color}44, transparent)` }}
      />
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-[#e4e4e7] text-sm font-semibold leading-snug pr-4">{project.title}</h3>
          <div className="flex items-center gap-1 shrink-0 text-[#71717a]">
            <Star size={12} className="fill-current" />
            <span className="text-xs">{project.stars}</span>
          </div>
        </div>
        <p className="text-[#71717a] text-xs leading-relaxed mb-3 line-clamp-2">{project.desc}</p>
        {/* case study metrics */}
        {cs && (
          <div className="flex flex-wrap gap-2 mb-3">
            {cs.metrics.slice(0, 3).map(m => (
              <div key={m.label} className="text-[10px] px-2 py-1 rounded-lg bg-[#0a0a0c] border border-[#1a1a2e]">
                <span className="font-bold" style={{ color: project.color }}>{m.value}</span>
                <span className="text-[#71717a] ml-1">{m.label}</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {project.tags.slice(0, 4).map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full border border-[#1a1a2e] text-[#a1a1aa]">
                {tag}
              </span>
            ))}
            {project.featured && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Featured
              </span>
            )}
          </div>
          {/* gallery thumbnail dots */}
          {cs?.gallery && cs.gallery.length > 0 && (
            <div className="flex -space-x-1.5">
              {cs.gallery.slice(0, 4).map((img, idx) => (
                <div
                  key={idx}
                  className="h-5 w-5 rounded-full border border-[#1a1a2e] bg-[#0a0a0c] overflow-hidden"
                >
                  <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          )}
        </div>
        {/* hover CTA */}
        <div className="mt-3 overflow-hidden h-0 group-hover/card:h-6 transition-all duration-300">
          <span className="text-xs font-medium flex items-center gap-1" style={{ color: project.color }}>
            Read Case Study <ChevronRight size={12} />
          </span>
        </div>
      </div>
    </motion.div>
  )

  return cs ? (
    <Link
      to={`/portfolio-4/project/${project.slug}`}
      className="col-span-1 md:col-span-2 block rounded-[20px] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50"
      aria-label={`${project.title} — read the case study`}
    >
      {card}
    </Link>
  ) : (
    <div className="col-span-1 md:col-span-2">{card}</div>
  )
}

/* ─── Device Fleet Card (2×1) — multi-device ecosystem ─────────────────── */

const FLEET_DEVICES = [
  { icon: Monitor, label: 'Terminal', platform: 'Windows' },
  { icon: Tablet, label: 'Kiosk', platform: 'Android' },
  { icon: Flame, label: 'KDS', platform: 'Android' },
  { icon: Smartphone, label: 'Display', platform: 'iOS' },
  { icon: Package, label: 'Warehouse', platform: 'Android' },
]

const FLEET_METRICS = ['5 Device Types', '4 Android Apps', '2 iOS Apps', 'Shared Core']

function DeviceFleetCard() {
  return (
    <motion.div
      {...cardMotion(13)}
      style={{ boxShadow: glowShadow('#10b981') }}
      className={`${CARD_BASE} ${CARD_BG} p-6 col-span-1 md:col-span-2`}
    >
      <AnimatedBorder />
      <h2 className="text-[#e4e4e7] text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
        <Monitor size={14} className="text-emerald-500" /> Device Fleet
      </h2>
      <div className="flex items-center justify-between gap-3 mb-4">
        {FLEET_DEVICES.map((d, idx) => (
          <motion.div
            key={d.label}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 + idx * 0.08, duration: 0.35 }}
            className="flex flex-col items-center gap-1.5"
          >
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <d.icon size={18} className="text-emerald-400" />
            </div>
            <span className="text-[10px] text-[#e4e4e7] font-medium">{d.label}</span>
            <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-[#1a1a2e] text-[#71717a]">{d.platform}</span>
          </motion.div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {FLEET_METRICS.map(m => (
          <span key={m} className="text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
            {m}
          </span>
        ))}
      </div>
    </motion.div>
  )
}

/* ─── Kiosk Card (1×1) — self-service kiosk highlight ──────────────────── */

const KIOSK_STEPS = ['Browse', 'Order', 'Pay']

function KioskCard() {
  return (
    <motion.div
      {...cardMotion(14)}
      style={{ boxShadow: glowShadow('#06b6d4') }}
      className={`${CARD_BASE} ${CARD_BG} p-6 flex flex-col justify-between min-h-[140px]`}
    >
      <AnimatedBorder />
      <Tablet size={18} className="text-cyan-500" />
      <div>
        <p className="text-[#e4e4e7] text-sm font-semibold mb-2">Self-Service Kiosk</p>
        <div className="flex items-center gap-1 mb-3">
          {KIOSK_STEPS.map((s, idx) => (
            <div key={s} className="flex items-center gap-1">
              <span className="h-4 w-4 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-[7px] text-cyan-400 font-bold">
                {idx + 1}
              </span>
              <span className="text-[9px] text-[#a1a1aa]">{s}</span>
              {idx < KIOSK_STEPS.length - 1 && <span className="text-[#71717a] text-[8px] mx-0.5">{"\u2192"}</span>}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">10&quot; Android Tablet</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Offline-capable</span>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Stock Take Card (1×1) — inventory management ─────────────────────── */

function StockTakeCard() {
  const { ref: itemsRef, value: itemsCount } = useCountUp(4200, 1400)
  const { ref: accRef, value: accCount } = useCountUp(992, 1200)

  return (
    <motion.div
      {...cardMotion(15)}
      style={{ boxShadow: glowShadow('#84cc16') }}
      className={`${CARD_BASE} ${CARD_BG} p-6 flex flex-col justify-between min-h-[140px]`}
    >
      <AnimatedBorder />
      <ScanLine size={18} className="text-lime-500" />
      <div>
        <p className="text-[#e4e4e7] text-sm font-semibold mb-1">Stock Take</p>
        <div className="flex items-baseline gap-3 mb-1">
          <span ref={itemsRef} className="text-2xl font-bold text-lime-400 tabular-nums tracking-tight">
            {itemsCount.toLocaleString()}
          </span>
          <span className="text-[10px] text-[#71717a]">items scanned</span>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span ref={accRef} className="text-lg font-bold text-lime-400 tabular-nums">
            {(accCount / 10).toFixed(1)}%
          </span>
          <span className="text-[10px] text-[#71717a]">accuracy</span>
        </div>
        <p className="text-[#71717a] text-[10px]">Barcode scanning &middot; batch sync</p>
      </div>
    </motion.div>
  )
}

/* ─── Kitchen Display Card (2×1) — KDS streaming visualization ─────────── */

const KDS_TICKETS = [
  { id: '#041', status: 'new', color: '#3b82f6' },
  { id: '#042', status: 'cooking', color: '#f59e0b' },
  { id: '#043', status: 'ready', color: '#10b981' },
  { id: '#044', status: 'new', color: '#3b82f6' },
]

const KDS_SOURCES = ['POS', 'Kiosk', 'Foodpanda', 'Hawk']

function KitchenDisplayCard() {
  return (
    <motion.div
      {...cardMotion(16)}
      style={{ boxShadow: glowShadow('#ef4444') }}
      className={`${CARD_BASE} ${CARD_BG} p-6 col-span-1 md:col-span-2`}
    >
      <AnimatedBorder />
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[#e4e4e7] text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
          <Flame size={14} className="text-red-500" /> Kitchen Display
        </h2>
        <span className="flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          gRPC Stream
        </span>
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {KDS_TICKETS.map((ticket, idx) => (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 + idx * 0.1, duration: 0.35 }}
            className="flex-shrink-0 w-[72px] p-2.5 rounded-lg bg-[#0a0a0c] border border-[#1a1a2e]"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-[#e4e4e7] font-bold">{ticket.id}</span>
              <span className="h-2 w-2 rounded-full" style={{ background: ticket.color }} />
            </div>
            <span className="text-[8px] capitalize" style={{ color: ticket.color }}>{ticket.status}</span>
          </motion.div>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {KDS_SOURCES.map(s => (
          <span key={s} className="text-[9px] px-2 py-0.5 rounded-full bg-[#1a1a2e] text-[#71717a]">
            {s}
          </span>
        ))}
      </div>
    </motion.div>
  )
}

/* ─── Ecosystem Card (2×1) — mini architecture diagram ──────────────────── */

const ECO_NODES = [
  { id: 'core', label: 'Core', cx: 140, cy: 50, color: '#8b5cf6', r: 18 },
  { id: 'pos', label: 'POS', cx: 40, cy: 50, color: '#3b82f6', r: 12 },
  { id: 'kiosk', label: 'Kiosk', cx: 80, cy: 14, color: '#06b6d4', r: 12 },
  { id: 'kds', label: 'KDS', cx: 200, cy: 20, color: '#f97316', r: 12 },
  { id: 'stock', label: 'Stock', cx: 80, cy: 86, color: '#84cc16', r: 12 },
  { id: 'ext', label: 'Ext', cx: 220, cy: 72, color: '#ec4899', r: 12 },
]

const ECO_LINKS = [
  { from: 'pos', to: 'core' },
  { from: 'kiosk', to: 'core' },
  { from: 'core', to: 'kds' },
  { from: 'stock', to: 'core' },
  { from: 'ext', to: 'core' },
]

function EcosystemCard() {
  return (
    <motion.div
      {...cardMotion(17)}
      style={{ boxShadow: glowShadow('#a855f7') }}
      className={`${CARD_BASE} ${CARD_BG} p-6 col-span-1 md:col-span-2`}
    >
      <AnimatedBorder />
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[#e4e4e7] text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
          <Zap size={14} className="text-violet-500" /> Ecosystem
        </h2>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
          10 services
        </span>
      </div>

      {/* Mini architecture SVG */}
      <svg viewBox="0 0 260 100" className="w-full" style={{ height: 120 }}>
        <defs>
          <linearGradient id="eco-line-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.3} />
          </linearGradient>
        </defs>

        {/* Connection lines with animated dash flow */}
        {ECO_LINKS.map((link, i) => {
          const from = ECO_NODES.find(n => n.id === link.from)!
          const to = ECO_NODES.find(n => n.id === link.to)!
          return (
            <line
              key={i}
              x1={from.cx} y1={from.cy} x2={to.cx} y2={to.cy}
              stroke="url(#eco-line-grad)" strokeWidth={1.5}
              strokeDasharray="4 6" opacity={0.7}
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0" to="-10"
                dur="1.5s" repeatCount="indefinite"
              />
            </line>
          )
        })}

        {/* Animated dots flowing along connection lines */}
        {ECO_LINKS.map((link, i) => {
          const from = ECO_NODES.find(n => n.id === link.from)!
          const to = ECO_NODES.find(n => n.id === link.to)!
          return (
            <circle key={`dot-${i}`} r={2} fill="#a855f7" opacity={0.8}>
              <animateMotion
                dur={`${2 + i * 0.4}s`}
                repeatCount="indefinite"
                path={`M${from.cx},${from.cy} L${to.cx},${to.cy}`}
              />
            </circle>
          )
        })}

        {/* Nodes */}
        {ECO_NODES.map(node => (
          <g key={node.id}>
            <circle
              cx={node.cx} cy={node.cy} r={node.r}
              fill={`${node.color}20`} stroke={`${node.color}60`} strokeWidth={1.5}
            />
            {node.id === 'core' && (
              <circle cx={node.cx} cy={node.cy} r={node.r + 4}
                fill="none" stroke={`${node.color}30`} strokeWidth={1}
              >
                <animate
                  attributeName="r" values={`${node.r + 4};${node.r + 8};${node.r + 4}`}
                  dur="3s" repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity" values="0.4;0;0.4"
                  dur="3s" repeatCount="indefinite"
                />
              </circle>
            )}
            <text
              x={node.cx} y={node.cy + 1}
              textAnchor="middle" dominantBaseline="middle"
              fill={node.color} fontSize={node.id === 'core' ? 9 : 7}
              fontWeight={600} fontFamily="ui-monospace, monospace"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>

      <p className="text-[#71717a] text-[10px] mt-2">
        POS · Kiosk · KDS · Stock Take · Webhooks · Telemetry — all connected via gRPC
      </p>
    </motion.div>
  )
}

/* ─── Transaction Pipeline Card (2×1) — sale pipeline visualization ─────── */

const PIPELINE_STEPS = [
  { icon: ScanLine, label: 'Scan', color: '#f43f5e' },
  { icon: Tag, label: 'Promote', color: '#f43f5e' },
  { icon: Calculator, label: 'Total', color: '#f43f5e' },
  { icon: CreditCard, label: 'Pay', color: '#f43f5e' },
  { icon: Receipt, label: 'Receipt', color: '#f43f5e' },
  { icon: PackageMinus, label: 'Inventory', color: '#f43f5e' },
  { icon: ChefHat, label: 'Kitchen', color: '#f43f5e' },
  { icon: Radio, label: 'Telemetry', color: '#f43f5e' },
]

function TransactionPipelineCard() {
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setActiveStep(s => (s + 1) % PIPELINE_STEPS.length), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <motion.div
      {...cardMotion(18)}
      style={{ boxShadow: glowShadow('#f43f5e') }}
      className={`${CARD_BASE} ${CARD_BG} p-6 col-span-1 md:col-span-2`}
    >
      <AnimatedBorder />
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[#e4e4e7] text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
          <Activity size={14} className="text-rose-500" /> Transaction Pipeline
        </h2>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
          8 stages
        </span>
      </div>

      {/* Pipeline row */}
      <div className="flex items-center justify-between gap-0.5">
        {PIPELINE_STEPS.map((step, idx) => {
          const isActive = idx === activeStep
          const isPast = idx < activeStep
          const StepIcon = step.icon
          return (
            <div key={step.label} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <motion.div
                  animate={{
                    scale: isActive ? 1.15 : 1,
                    boxShadow: isActive ? `0 0 12px ${step.color}66, 0 0 24px ${step.color}33` : '0 0 0px transparent',
                  }}
                  transition={{ duration: 0.3 }}
                  className="h-8 w-8 rounded-full flex items-center justify-center border transition-colors duration-300"
                  style={{
                    borderColor: isActive || isPast ? `${step.color}80` : '#1a1a2e',
                    background: isActive ? `${step.color}25` : isPast ? `${step.color}10` : '#0a0a0c',
                  }}
                >
                  <StepIcon
                    size={14}
                    style={{ color: isActive || isPast ? step.color : '#71717a' }}
                  />
                </motion.div>
                <span
                  className="text-[8px] font-medium transition-all duration-300 h-3"
                  style={{
                    color: isActive ? step.color : isPast ? `${step.color}99` : '#71717a',
                    opacity: isActive ? 1 : isPast ? 0.7 : 0.4,
                  }}
                >
                  {step.label}
                </span>
              </div>
              {/* Connecting dashed line */}
              {idx < PIPELINE_STEPS.length - 1 && (
                <svg width="16" height="2" className="mx-0.5 mt-[-10px]" viewBox="0 0 16 2">
                  <line
                    x1="0" y1="1" x2="16" y2="1"
                    stroke={isPast ? step.color : '#1a1a2e'}
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    opacity={isPast ? 0.8 : 0.5}
                  >
                    {isPast && (
                      <animate
                        attributeName="stroke-dashoffset"
                        from="0" to="-6"
                        dur="0.8s" repeatCount="indefinite"
                      />
                    )}
                  </line>
                </svg>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-[#71717a] text-[10px] mt-3">
        Scan &rarr; Promote &rarr; Total &rarr; Pay &rarr; Receipt &rarr; Inventory &rarr; Kitchen &rarr; Telemetry
      </p>
    </motion.div>
  )
}

/* ─── Skills Constellation Card (2×1) — 3D skills preview ────────────────── */

const CONSTELLATION_CATEGORIES: { key: SkillCategory; color: string; cx: number; cy: number }[] = [
  { key: 'frontend', color: SKILL_CAT_COLORS.frontend, cx: 60, cy: 35 },
  { key: 'backend', color: SKILL_CAT_COLORS.backend, cx: 200, cy: 35 },
  { key: 'devops', color: SKILL_CAT_COLORS.devops, cx: 60, cy: 85 },
  { key: 'design', color: SKILL_CAT_COLORS.design, cx: 200, cy: 85 },
]

const CONSTELLATION_STARS = (() => {
  const stars: { x: number; y: number; r: number; color: string; cat: string }[] = []
  let seed = 137
  CONSTELLATION_CATEGORIES.forEach(cat => {
    for (let i = 0; i < 5; i++) {
      seed = (seed * 16807 + 11) % 2147483647
      const angle = (seed % 360) * (Math.PI / 180)
      const dist = 12 + (seed % 30)
      stars.push({
        x: cat.cx + Math.cos(angle) * dist,
        y: cat.cy + Math.sin(angle) * dist,
        r: 1.5 + (seed % 3) * 0.5,
        color: cat.color,
        cat: cat.key,
      })
    }
  })
  return stars
})()

const CONSTELLATION_LINES = (() => {
  const lines: { x1: number; y1: number; x2: number; y2: number; color: string }[] = []
  CONSTELLATION_CATEGORIES.forEach(cat => {
    const catStars = CONSTELLATION_STARS.filter(s => s.cat === cat.key)
    for (let i = 0; i < catStars.length - 1; i++) {
      lines.push({
        x1: catStars[i].x, y1: catStars[i].y,
        x2: catStars[i + 1].x, y2: catStars[i + 1].y,
        color: cat.color,
      })
    }
  })
  return lines
})()

function SkillsConstellationCard() {
  return (
    <motion.div
      {...cardMotion(19)}
      style={{ boxShadow: glowShadow('#8b5cf6') }}
      className={`${CARD_BASE} ${CARD_BG} p-6 col-span-1 md:col-span-2`}
    >
      <AnimatedBorder />
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[#e4e4e7] text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
          <Star size={14} className="text-violet-500" /> Skills Constellation
        </h2>
        <span className="text-[10px] text-[#71717a]">23 skills &middot; 4 categories</span>
      </div>

      {/* Star field SVG */}
      <svg viewBox="0 0 260 120" className="w-full" style={{ height: 120 }}>
        <defs>
          <linearGradient id="shooting-star-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0} />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Faint constellation lines */}
        {CONSTELLATION_LINES.map((line, i) => (
          <line
            key={i}
            x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
            stroke={line.color} strokeWidth={0.5} opacity={0.25}
          />
        ))}

        {/* Star dots with pulse animation */}
        {CONSTELLATION_STARS.map((star, i) => (
          <circle
            key={i}
            cx={star.x} cy={star.y} r={star.r}
            fill={star.color} opacity={0.7}
          >
            <animate
              attributeName="opacity" values="0.4;0.9;0.4"
              dur={`${2 + (i % 3)}s`} repeatCount="indefinite"
              begin={`${(i * 0.3) % 2}s`}
            />
            <animate
              attributeName="r" values={`${star.r};${star.r + 0.8};${star.r}`}
              dur={`${2.5 + (i % 4) * 0.5}s`} repeatCount="indefinite"
              begin={`${(i * 0.2) % 2}s`}
            />
          </circle>
        ))}

        {/* Shooting star trace */}
        <line
          x1="0" y1="30" x2="30" y2="25"
          stroke="url(#shooting-star-grad)" strokeWidth={1.5}
          strokeLinecap="round"
        >
          <animateMotion
            dur="4s" repeatCount="indefinite"
            path="M0,30 L260,90"
          />
        </line>
      </svg>

      {/* Category legend */}
      <div className="flex items-center gap-4 mt-2">
        {CONSTELLATION_CATEGORIES.map(cat => (
          <div key={cat.key} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: cat.color }} />
            <span className="text-[10px] text-[#71717a]">{SKILL_CAT_LABELS[cat.key]}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

/* ─── Promotion Engine Card (2×1) — IF → THEN rule builder ────────────────── */

const PROMO_RULES = [
  { qual: 'Min Spend $30', reward: '10% Off Order' },
  { qual: 'Buy 3+ Items', reward: 'Cheapest Free' },
  { qual: 'Specific Product', reward: '$5 Flat Discount' },
]

function PromotionEngineCard() {
  const [ruleIdx, setRuleIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setRuleIdx(p => (p + 1) % PROMO_RULES.length), 2500)
    return () => clearInterval(id)
  }, [])

  return (
    <motion.div
      {...cardMotion(20)}
      style={{ boxShadow: glowShadow('#f59e0b') }}
      className={`${CARD_BASE} ${CARD_BG} p-6 col-span-1 md:col-span-2`}
    >
      <AnimatedBorder />
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[#e4e4e7] text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
          <Gift size={14} className="text-amber-500" /> Promotion Engine
        </h2>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
          IF → THEN
        </span>
      </div>

      {/* Rule display */}
      <div className="relative h-14 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={ruleIdx}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="absolute inset-0 flex items-center justify-center gap-3"
          >
            {/* Qualification badge */}
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
              <Tag size={12} /> {PROMO_RULES[ruleIdx].qual}
            </span>
            {/* Arrow */}
            <ArrowRight size={16} className="text-amber-500/60 shrink-0" />
            {/* Reward badge */}
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              <Zap size={12} /> {PROMO_RULES[ruleIdx].reward}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 mt-3 mb-3">
        {PROMO_RULES.map((_, i) => (
          <span
            key={i}
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width: i === ruleIdx ? 16 : 6,
              background: i === ruleIdx ? '#f59e0b' : '#27272a',
            }}
          />
        ))}
      </div>

      <p className="text-[#71717a] text-[10px] text-center">
        14 reward types &middot; JSON-parameterized vouchers
      </p>
    </motion.div>
  )
}

/* ─── Offline Sync Card (2×1) — offline sync status preview ───────────────── */

const SYNC_STATES = [
  { label: 'Online', sub: 'gRPC active', color: '#22c55e', icon: 'wifi' as const },
  { label: 'Offline', sub: 'SQLite queuing', color: '#ef4444', icon: 'wifi-off' as const, queue: 3 },
  { label: 'Synced', sub: 'Zero data loss', color: '#10b981', icon: 'check' as const },
]

function OfflineSyncCard() {
  const [stateIdx, setStateIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setStateIdx(p => (p + 1) % SYNC_STATES.length), 2500)
    return () => clearInterval(id)
  }, [])

  const IconMap = { wifi: Wifi, 'wifi-off': WifiOff, check: CheckCircle }

  return (
    <motion.div
      {...cardMotion(21)}
      style={{ boxShadow: glowShadow('#06b6d4') }}
      className={`${CARD_BASE} ${CARD_BG} p-6 col-span-1 md:col-span-2`}
    >
      <AnimatedBorder />
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[#e4e4e7] text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
          <Database size={14} className="text-cyan-500" /> Offline Sync
        </h2>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          resilient
        </span>
      </div>

      {/* Status indicators */}
      <div className="flex flex-col gap-2">
        {SYNC_STATES.map((st, i) => {
          const Icon = IconMap[st.icon]
          const active = i === stateIdx
          return (
            <motion.div
              key={st.label}
              animate={{
                opacity: active ? 1 : 0.35,
                scale: active ? 1 : 0.97,
              }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors"
              style={{
                background: active ? `${st.color}08` : 'transparent',
                borderColor: active ? `${st.color}30` : '#1a1a2e',
              }}
            >
              {/* Status dot / icon */}
              <span className="relative flex h-5 w-5 items-center justify-center">
                <Icon size={14} style={{ color: st.color }} />
                {active && (
                  <motion.span
                    className="absolute inset-0 rounded-full"
                    style={{ background: st.color }}
                    animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </span>

              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium" style={{ color: active ? st.color : '#71717a' }}>
                  {st.label}
                </span>
                <span className="text-[10px] text-[#52525b] ml-2">{st.sub}</span>
              </div>

              {/* Queue counter for offline state */}
              {st.queue && active && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/20"
                >
                  {st.queue} queued
                </motion.span>
              )}
            </motion.div>
          )
        })}
      </div>

      <p className="text-[#71717a] text-[10px] mt-3 text-center">
        Seamless offline → online reconciliation
      </p>
    </motion.div>
  )
}

/* ─── Payment Wall Card (2×1) — integrated payment methods ────────────────── */

const PAYMENT_LOGOS = [
  { src: '/epos/ic_nets_no_background.png', name: 'NETS' },
  { src: '/epos/paynow_logo.png', name: 'PayNow' },
  { src: '/epos/alipay_plus_logo.png', name: 'Alipay+' },
  { src: '/epos/grab_pay_logo.png', name: 'GrabPay' },
  { src: '/epos/wechat_pay_logo.png', name: 'WeChat Pay' },
  { src: '/epos/master_card_logo.png', name: 'Mastercard' },
  { src: '/epos/visa_logo.png', name: 'Visa' },
  { src: '/epos/shopee_pay_logo.png', name: 'ShopeePay' },
  { src: '/epos/touch_n_go_ewallet_logo.png', name: 'Touch n Go' },
  { src: '/epos/true_money_logo.png', name: 'TrueMoney' },
  { src: '/epos/kakao_pay_logo.png', name: 'KakaoPay' },
  { src: '/epos/link_points_logo.png', name: 'LinkPoints' },
]

function PaymentWallCard() {
  return (
    <motion.div
      {...cardMotion(17)}
      style={{ boxShadow: glowShadow('#f59e0b') }}
      className={`${CARD_BASE} ${CARD_BG} p-6 col-span-1 md:col-span-2`}
    >
      <AnimatedBorder />
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[#e4e4e7] text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
          <CreditCard size={14} className="text-amber-500" /> Payment Wall
        </h2>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
          20+ methods
        </span>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {PAYMENT_LOGOS.map((p, idx) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.04, duration: 0.3 }}
            className="h-10 rounded-lg bg-[#0a0a0c] border border-[#1a1a2e] flex items-center justify-center p-1.5 hover:border-amber-500/40 transition-colors"
            title={p.name}
          >
            <img src={p.src} alt={p.name} className="max-h-full max-w-full object-contain" loading="lazy" />
          </motion.div>
        ))}
      </div>
      <p className="text-[#71717a] text-[10px] mt-3">
        Every integration uses provider-specific validation, idempotency, and recovery behavior.
      </p>
    </motion.div>
  )
}

/* ─── Terminal Card (2×1) — auto-typing build log ─────────────────────────── */

const TERMINAL_LINES = [
  { text: '$ dotnet publish -c Release', color: '#e4e4e7' },
  { text: '✓ 30 modules targeted — net8.0', color: '#10b981' },
  { text: '$ grpc services list', color: '#e4e4e7' },
  { text: '✓ 40+ service endpoints discovered', color: '#10b981' },
  { text: '$ reliability verify --offline', color: '#e4e4e7' },
  { text: '✓ queue · retry · reconcile', color: '#3b82f6' },
]

function TerminalCard() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [lines, setLines] = useState<string[]>([])
  const [current, setCurrent] = useState('')

  useEffect(() => {
    if (!inView) return
    let li = 0
    let ci = 0
    const id = setInterval(() => {
      const line = TERMINAL_LINES[li]
      ci++
      setCurrent(line.text.slice(0, ci))
      if (ci >= line.text.length) {
        setLines(prev => [...prev, line.text])
        setCurrent('')
        ci = 0
        li++
        if (li >= TERMINAL_LINES.length) {
          clearInterval(id)
        }
      }
    }, 24)
    return () => clearInterval(id)
  }, [inView])

  const colorOf = (text: string) =>
    TERMINAL_LINES.find(l => l.text === text)?.color ?? '#e4e4e7'
  const done = lines.length === TERMINAL_LINES.length

  return (
    <motion.div
      {...cardMotion(24)}
      style={{ boxShadow: glowShadow('#10b981') }}
      className={`${CARD_BASE} ${CARD_BG} col-span-1 md:col-span-2 overflow-hidden`}
    >
      <AnimatedBorder />
      {/* mac-style title bar */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0a0a0c] border-b border-[#1a1a2e]">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="text-[10px] text-[#71717a] ml-2 font-mono">epos@sg — zsh</span>
      </div>
      <div ref={ref} className="p-5 font-mono text-xs leading-relaxed min-h-[168px]">
        {lines.map((l, i) => (
          <p key={i} style={{ color: colorOf(l) }}>{l}</p>
        ))}
        {!done && current && (
          <p style={{ color: '#e4e4e7' }}>
            {current}
            <span className="animate-pulse">▌</span>
          </p>
        )}
        {done && (
          <p className="text-emerald-400">
            $ <span className="animate-pulse">▌</span>
          </p>
        )}
      </div>
    </motion.div>
  )
}

/* ─── Activity Card (2×1) — SVG mini line chart ───────────────────────────── */

function ActivityChartCard() {
  const svgRef = useRef<SVGSVGElement>(null)
  const inView = useInView(svgRef, { once: true, margin: '-40px' })

  const w = 280
  const h = 80
  const pad = 8
  const max = Math.max(...ACTIVITY_DATA)

  const pointsStr = ACTIVITY_DATA.map((v, i) => {
    const x = pad + (i / (ACTIVITY_DATA.length - 1)) * (w - 2 * pad)
    const y = h - pad - (v / max) * (h - 2 * pad)
    return `${x},${y}`
  }).join(' ')

  const areaStr = `${pad},${h - pad} ${pointsStr} ${w - pad},${h - pad}`
  const pathLen = 600

  return (
    <motion.div
      {...cardMotion(16)}
      style={{ boxShadow: glowShadow('#3b82f6') }}
      className={`${CARD_BASE} ${CARD_BG} p-6 col-span-1 md:col-span-2`}
    >
      <AnimatedBorder />
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[#e4e4e7] text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
          <Activity size={14} className="text-blue-500" /> Weekly Commits
        </h2>
        <span className="text-[10px] text-[#71717a]">Last 12 weeks</span>
      </div>
      <svg ref={svgRef} viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 80 }}>
        {/* grid lines */}
        {[0.25, 0.5, 0.75].map(f => (
          <line
            key={f}
            x1={pad} x2={w - pad}
            y1={h - pad - f * (h - 2 * pad)}
            y2={h - pad - f * (h - 2 * pad)}
            stroke="#1a1a2e" strokeWidth={0.5}
          />
        ))}
        {/* area fill */}
        <polygon
          points={areaStr}
          fill="url(#activity-grad)"
          opacity={inView ? 0.3 : 0}
          style={{ transition: 'opacity 0.8s ease' }}
        />
        {/* animated line */}
        <polyline
          points={pointsStr}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={pathLen}
          strokeDashoffset={inView ? 0 : pathLen}
          style={{ transition: 'stroke-dashoffset 1.2s ease' }}
        />
        {/* dots */}
        {ACTIVITY_DATA.map((v, i) => {
          const x = pad + (i / (ACTIVITY_DATA.length - 1)) * (w - 2 * pad)
          const y = h - pad - (v / max) * (h - 2 * pad)
          return (
            <circle
              key={i} cx={x} cy={y} r={2.5}
              fill="#3b82f6"
              opacity={inView ? 1 : 0}
              style={{ transition: `opacity 0.5s ease ${0.08 * i}s` }}
            />
          )
        })}
        <defs>
          <linearGradient id="activity-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  )
}

/* ─── Skill Category Card (1×1) ───────────────────────────────────────────── */

function SkillCatCard({ category, i }: { category: SkillCategory; i: number }) {
  const nodes = SKILLS_GRAPH.nodes.filter(n => n.category === category)
  const avg = nodes.length ? nodes.reduce((s, n) => s + n.level, 0) / nodes.length : 0
  const Icon = CAT_ICONS[category]
  const color = SKILL_CAT_COLORS[category]

  return (
    <motion.div
      {...cardMotion(i)}
      style={{ boxShadow: glowShadow(color) }}
      className={`${CARD_BASE} ${CARD_BG} p-6 flex flex-col justify-between min-h-[140px]`}
    >
      <AnimatedBorder />
      <div className="flex items-center justify-between">
        <Icon size={18} style={{ color }} />
        <span className="text-[10px] text-[#71717a] font-medium">{nodes.length} skills</span>
      </div>
      <div>
        <p className="text-[#e4e4e7] text-sm font-semibold mb-2">{SKILL_CAT_LABELS[category]}</p>
        <div className="h-1.5 rounded-full bg-[#1a1a2e] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: color }}
            initial={{ width: 0 }}
            whileInView={{ width: `${(avg / 5) * 100}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </div>
        <p className="text-[10px] text-[#71717a] mt-1">Avg level {avg.toFixed(1)} / 5</p>
      </div>
    </motion.div>
  )
}

/* ─── Enhanced Testimonial Carousel Card (2×1) ────────────────────────────── */

function TestimonialCard() {
  const [active, setActive] = useState(0)
  const len = TESTIMONIALS_DATA.length

  useEffect(() => {
    if (len < 2) return
    const id = setInterval(() => setActive(a => (a + 1) % len), 5000)
    return () => clearInterval(id)
  }, [len])

  if (len === 0) {
    return (
      <motion.div {...cardMotion(18)} style={{ boxShadow: glowShadow('#8b5cf6') }} className={`${CARD_BASE} ${GLASS} p-7 col-span-1 md:col-span-2 min-h-[200px]`}>
        <AnimatedBorder />
        <Quote size={18} className="text-violet-500 mb-3" />
        <p className="text-[#e4e4e7] text-sm font-semibold">References available on request</p>
        <p className="text-[#71717a] text-xs mt-2">Recommendations are published only with explicit permission.</p>
      </motion.div>
    )
  }

  const t = TESTIMONIALS_DATA[active]

  return (
    <motion.div
      {...cardMotion(18)}
      style={{ boxShadow: glowShadow('#8b5cf6') }}
      className={`${CARD_BASE} ${GLASS} p-7 col-span-1 md:col-span-2 min-h-[200px]`}
    >
      <AnimatedBorder />
      <Quote size={18} className="text-violet-500 mb-3" />
      <div className="relative min-h-[90px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            <p className="text-[#a1a1aa] text-sm italic leading-relaxed mb-4 line-clamp-3">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs font-bold">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-[#e4e4e7] text-sm font-semibold">{t.name}</p>
                  <p className="text-[#71717a] text-xs">{t.role}, {t.company}</p>
                </div>
              </div>
              {/* reaction badges */}
              <div className="flex gap-2 text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-[#1a1a2e]">
                  {'👍'} {t.reactions.thumbsUp}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#1a1a2e]">
                  {'❤️'} {t.reactions.heart}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#1a1a2e]">
                  {'🚀'} {t.reactions.rocket}
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      {/* progress dots */}
      <div className="flex justify-center gap-1.5 mt-4">
        {TESTIMONIALS_DATA.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActive(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === active ? 'w-4 bg-violet-500' : 'w-1.5 bg-[#1a1a2e]'
            }`}
          />
        ))}
      </div>
    </motion.div>
  )
}

/* ─── Tools Card (1×1) ────────────────────────────────────────────────────── */

const DAILY_TOOLS = [
  { name: 'VS Code', icon: Code },
  { name: 'Git', icon: GitBranch },
  { name: 'Terminal', icon: Terminal },
  { name: 'Docker', icon: Box },
]

function ToolsCard() {
  return (
    <motion.div
      {...cardMotion(19)}
      style={{ boxShadow: glowShadow('#f59e0b') }}
      className={`${CARD_BASE} ${CARD_BG} p-5 flex flex-col justify-between min-h-[140px]`}
    >
      <AnimatedBorder />
      <p className="text-[#e4e4e7] text-xs font-semibold uppercase tracking-wider mb-2">Daily Tools</p>
      <div className="grid grid-cols-2 gap-2">
        {DAILY_TOOLS.map(tool => (
          <div
            key={tool.name}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#1a1a2e] transition-colors cursor-default"
          >
            <tool.icon size={14} className="text-amber-500" />
            <span className="text-[11px] text-[#a1a1aa]">{tool.name}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

/* ─── Social Card (1×1) ───────────────────────────────────────────────────── */

function SocialCard() {
  return (
    <motion.div
      {...cardMotion(20)}
      style={{ boxShadow: glowShadow('#3b82f6') }}
      className={`${CARD_BASE} ${CARD_BG} p-6 flex flex-col justify-between min-h-[140px]`}
    >
      <AnimatedBorder />
      <h2 className="text-[#e4e4e7] text-xs font-semibold uppercase tracking-wider mb-3">Social</h2>
      <div className="grid grid-cols-3 gap-3">
        {SOCIAL_LINKS.filter((link) => link.url).map(link => {
          const Icon = SOCIAL_ICON_MAP[link.platform] ?? ExternalLink
          return (
            <a
              key={link.platform}
              href={link.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-[#1a1a2e] transition-colors group"
            >
              <Icon size={18} className="text-[#71717a] group-hover:text-[#e4e4e7] transition-colors" />
              <span className="text-[10px] text-[#71717a]">{link.platform}</span>
            </a>
          )
        })}
      </div>
    </motion.div>
  )
}

/* ─── Enhanced Contact Card (2×1) ─────────────────────────────────────────── */

function ContactCard() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])
  const sgTime = now.toLocaleTimeString('en-SG', {
    timeZone: 'Asia/Singapore', hour: '2-digit', minute: '2-digit', hour12: false,
  })

  return (
    <motion.div
      {...cardMotion(21)}
      style={{ boxShadow: glowShadow('#10b981') }}
      className={`${CARD_BASE} ${CARD_BG} p-7 col-span-1 md:col-span-2`}
    >
      <AnimatedBorder />
      <h2 className="text-[#e4e4e7] text-lg font-bold mb-2">Let&rsquo;s Connect</h2>
      <p className="text-[#71717a] text-sm mb-3">
        Have an opportunity or want to chat about POS systems, payments, or .NET architecture?
      </p>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="text-[10px] px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
          <Clock size={10} /> SGT {sgTime}
        </span>
        <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Replies within 24h
        </span>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
        >
          <Mail size={14} /> {CONTACT_EMAIL} <ChevronRight size={14} className="opacity-50" />
        </a>
        {/* social icon buttons */}
        <div className="flex gap-2">
          {SOCIAL_LINKS.filter((link) => link.url).map(link => {
            const Icon = SOCIAL_ICON_MAP[link.platform] ?? ExternalLink
            return (
              <a
                key={link.platform}
                href={link.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-xl bg-[#1a1a2e] flex items-center justify-center hover:bg-[#252538] transition-colors"
              >
                <Icon size={15} className="text-[#71717a]" />
              </a>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN PAGE
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function FooterBar() {
  const [showTop, setShowTop] = useState(false)
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <>
      <footer className="max-w-[1200px] mx-auto mt-10 mb-4 px-2 flex flex-col items-center gap-3 text-center">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#1a1a2e] to-transparent" />
        <p className="text-[#71717a] text-xs">
          &copy; {new Date().getFullYear()} {HERO_NAME} &middot; Built with React &middot; Bento grid &middot; Zero incidents
        </p>
      </footer>
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            whileHover={{ scale: 1.08, y: -3 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-40 h-11 w-11 rounded-2xl bg-[#111113] border border-[#1a1a2e] flex items-center justify-center text-[#a1a1aa] hover:text-emerald-400 hover:border-emerald-500/40 transition-colors"
            aria-label="Back to top"
          >
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}

const STATS = [
  { value: '5+', label: 'Years Experience', color: '#10b981' },
  { value: '30+', label: 'Modules Shipped', color: '#3b82f6' },
  { value: '200+', label: 'Transactions ($K)', color: '#8b5cf6' },
  { value: '0', label: 'Incidents', color: '#10b981' },
]

const CATEGORIES: SkillCategory[] = ['frontend', 'backend', 'devops', 'design']
const featuredProjects = PROJECTS.filter(p => p.featured).slice(0, 3)

export default function Portfolio4Bento() {
  const { onMove, onLeave, ref: glowRef } = useCursorGlow()
  const location = useLocation()

  useEffect(() => {
    if (location.pathname === '/portfolio-4') {
      document.title = 'EPOS V5 — Bento Portfolio'
    }
  }, [location.pathname])

  return (
    <div
      className="min-h-screen bg-[#09090b] text-[#e4e4e7] px-4 py-6 md:px-8 md:py-10 lg:px-12"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {/* cursor glow spotlight */}
      <div
        ref={glowRef}
        className="cursor-glow fixed left-0 top-0 pointer-events-none z-50 w-[600px] h-[600px] rounded-full opacity-[0.07]"
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.5) 0%, rgba(59,130,246,0.2) 40%, transparent 70%)',
        }}
      />

      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-min">
        {/* Hero (2×2) + Stats (×2) */}
        <HeroCard />
        <StatCard {...STATS[0]} i={1} />
        <StatCard {...STATS[1]} i={2} />

        {/* Stats row 2 + mini cards */}
        <StatCard {...STATS[2]} i={3} />
        <StatCard {...STATS[3]} i={4} />
        <LocationCard />
        <ClockCard />

        {/* Heatmap (1×1) + Now Playing (1×1) */}
        <HeatmapCard />
        <NowPlayingCard />

        {/* About (2×1) + Tech Stack (2×1) */}
        <AboutCard />
        <TechStackCard />

        {/* Experience (2×2) + Projects */}
        <ExperienceCard />
        {featuredProjects.map((p, idx) => (
          <ProjectCard key={p.slug} project={p} i={12 + idx} />
        ))}

        {/* Device Fleet (2×1) */}
        <DeviceFleetCard />

        {/* Kiosk (1×1) + Stock Take (1×1) */}
        <KioskCard />
        <StockTakeCard />

        {/* Kitchen Display (2×1) */}
        <KitchenDisplayCard />

        {/* Ecosystem (2×1) */}
        <EcosystemCard />

        {/* Transaction Pipeline (2×1) + Skills Constellation (2×1) */}
        <TransactionPipelineCard />
        <SkillsConstellationCard />

        {/* Promotion Engine (2×1) + Offline Sync (2×1) */}
        <PromotionEngineCard />
        <OfflineSyncCard />

        {/* Payment methods wall */}
        <PaymentWallCard />

        {/* Activity Chart (2×1) + Terminal (2×1) + Tools + Social */}
        <ActivityChartCard />
        <TerminalCard />
        <ToolsCard />
        <SocialCard />

        {/* Skill Categories (1×1 × 4) */}
        {CATEGORIES.map((cat, idx) => (
          <SkillCatCard key={cat} category={cat} i={20 + idx} />
        ))}

        {/* Testimonials (2×1) + Contact (2×1) */}
        <TestimonialCard />
        <ContactCard />
      </div>

      <FooterBar />

      <StyleSwitcher />
      <Outlet />

      {/* Animations & scrollbar */}
      <style>{`
        html { scrollbar-width: thin; scrollbar-color: #1a1a2e #09090b; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #09090b; }
        ::-webkit-scrollbar-thumb { background: #1a1a2e; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #2a2a3e; }

        @property --border-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes border-spin {
          to { --border-angle: 360deg; }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-shift {
          animation: gradient-shift 8s ease infinite;
        }
        @keyframes equalizer {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        .animate-equalizer {
          animation: equalizer 0.8s ease-in-out infinite;
        }

        /* GPU cursor glow — transform only, no layout work */
        .cursor-glow {
          transform: translate3d(-999px, -999px, 0);
          transition: transform 90ms linear;
          will-change: transform;
        }

        /* shimmering hero title */
        .bento-hero-title {
          background: linear-gradient(92deg, #e4e4e7 0%, #10b981 28%, #3b82f6 52%, #8b5cf6 72%, #e4e4e7 100%);
          background-size: 250% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
          animation: gradient-shift 7s ease-in-out infinite;
        }

        /* card hover micro-polish */
        .bento-card {
          transition: border-color 0.3s ease;
        }
        .bento-card:hover {
          border-color: #2a2a3e;
        }

        /* heatmap cell hover ring */
        .hm-cell:hover {
          box-shadow: 0 0 0 1.5px #39d353, 0 0 8px rgba(57,211,83,0.6);
        }

        ::selection {
          background: #10b981;
          color: #09090b;
        }

        @media (prefers-reduced-motion: reduce) {
          .cursor-glow { transition: none; }
          * { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; }
        }
      `}</style>
    </div>
  )
}
