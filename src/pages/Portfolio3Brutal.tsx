// ─── Portfolio 3 — Neubrutalist ─────────────────────────────────────────────
// Bold borders, hard shadows, pop colors, intentionally rough & loud.
import { useRef, useState, useEffect, useMemo } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Mail, Globe, Link as LinkIcon, Send, ArrowDown, Star, ExternalLink, Menu, X, Clock, ArrowUp } from 'lucide-react'
import {
  CAREER_CHAPTERS, PROJECTS, TESTIMONIALS_DATA, SKILLS_GRAPH,
  SKILL_CAT_COLORS, SKILL_CAT_LABELS, SOCIAL_LINKS, CONTACT_EMAIL,
  HERO_NAME, HERO_ROLE,
} from './portfolio/content'
import type { SkillCategory } from './portfolio/content'
import StyleSwitcher from '../components/StyleSwitcher'
import { HireBadge, SquareCursor } from './brutal/BrutalChrome'

/* ── constants ─────────────────────────────────────────────────────────────── */
const ACCENTS = ['#ff6b9d', '#0066ff', '#f5e100', '#ff5722', '#7cff01', '#c4b5fd']
const accent = (i: number) => ACCENTS[i % ACCENTS.length]
const tilt = (i: number) => ['-3deg', '2deg', '-1.5deg', '3deg', '-2deg', '1deg'][i % 6]

const BORDER = '3px solid #000'
const SHADOW = '4px 4px 0px #000'
const SHADOW_LG = '6px 6px 0px #000'
const SHADOW_XL = '8px 8px 0px #000'

const NAV_ITEMS = [
  { id: 'about', label: 'ABOUT' },
  { id: 'experience', label: 'XP' },
  { id: 'projects', label: 'WORK' },
  { id: 'skills', label: 'SKILLS' },
  { id: 'testimonials', label: 'PRAISE' },
  { id: 'contact', label: 'TALK' },
]

const HERO_STICKERS = ['React', '.NET 8', 'gRPC', 'WPF', 'C#', 'SQLite', 'TypeScript', 'POS']

const SECTION_TINTS: Record<string, string> = {
  about: '#0066ff08', experience: '#ff572208', projects: '#f5e10008',
  skills: '#7cff0108', testimonials: '#c4b5fd08', contact: '#ff6b9d08',
}

const socialIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'github': return <Globe size={22} />
    case 'linkedin': return <LinkIcon size={22} />
    case 'twitter': return <Send size={22} />
    default: return <ExternalLink size={22} />
  }
}

/* ── Animated section wrapper ──────────────────────────────────────────────── */
function Section({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.section>
  )
}

/* ── Scribble underline SVG (animated draw-in) ───────────────────────────── */
function ScribbleUnderline({ color = '#ff6b9d', width = 200 }: { color?: string; width?: number }) {
  const ref = useRef<SVGSVGElement>(null)
  const inView = useInView(ref, { once: true, margin: '-20px' })
  return (
    <svg ref={ref} width={width} height="14" viewBox={`0 0 ${width} 14`} fill="none" style={{ display: 'block' }}>
      <motion.path
        d={`M2 8 C${width * 0.15} 2, ${width * 0.3} 12, ${width * 0.5} 6 S${width * 0.75} 2, ${width - 2} 8`}
        stroke={color} strokeWidth="3" strokeLinecap="round" fill="none"
        pathLength="1"
        initial={{ pathLength: 0 }}
        animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </svg>
  )
}

/* ── Zigzag divider SVG ────────────────────────────────────────────────────── */
function ZigzagDivider({ color = '#000', bg = 'transparent' }: { color?: string; bg?: string }) {
  return (
    <div style={{ background: bg, overflow: 'hidden', lineHeight: 0 }}>
      <svg width="100%" height="32" viewBox="0 0 1200 32" preserveAspectRatio="none" fill="none">
        <path d="M0 16 L30 0 L60 16 L90 0 L120 16 L150 0 L180 16 L210 0 L240 16 L270 0 L300 16 L330 0 L360 16 L390 0 L420 16 L450 0 L480 16 L510 0 L540 16 L570 0 L600 16 L630 0 L660 16 L690 0 L720 16 L750 0 L780 16 L810 0 L840 16 L870 0 L900 16 L930 0 L960 16 L990 0 L1020 16 L1050 0 L1080 16 L1110 0 L1140 16 L1170 0 L1200 16 V32 H0 Z" fill={color} />
      </svg>
    </div>
  )
}

/* ── Marquee band (pause on hover, optional angled) ────────────────────────── */
function MarqueeBand({ text, bg = '#000', fg = '#fff', angled }: { text: string; bg?: string; fg?: string; angled?: boolean }) {
  const stickers = ['◼', '✦', '→', '★']
  const parts = text.trim().split('★').filter(Boolean)
  const repeated = Array(4).fill(null).map((_, ri) =>
    parts.map((w, wi) => ` ${w.trim()} ${stickers[(ri * parts.length + wi) % stickers.length]} `).join('')
  ).join('')
  return (
    <div
      className="brutal-marquee-wrap"
      style={{
        background: bg, color: fg, borderTop: BORDER, borderBottom: BORDER,
        overflow: 'hidden', whiteSpace: 'nowrap', padding: '14px 0',
        fontWeight: 900, fontSize: 'clamp(0.9rem, 2vw, 1.3rem)', textTransform: 'uppercase', letterSpacing: '0.05em',
        ...(angled ? { transform: 'rotate(-1deg) scale(1.02)', margin: '-4px -8px', position: 'relative' as const, zIndex: 2 } : {}),
      }}
    >
      <div className="brutal-marquee">{repeated}</div>
    </div>
  )
}

/* ── Sticker badge ─────────────────────────────────────────────────────────── */
function Sticker({ children, bg, rotate, style }: {
  children: React.ReactNode; bg: string; rotate?: string;
  style?: React.CSSProperties
}) {
  return (
    <span style={{
      display: 'inline-block', background: bg, border: BORDER, boxShadow: SHADOW,
      padding: '4px 14px', fontWeight: 900, fontSize: '0.85rem', textTransform: 'uppercase',
      transform: `rotate(${rotate ?? '0deg'})`, ...style,
    }}>
      {children}
    </span>
  )
}

/* ── Count-up number hook ──────────────────────────────────────────────────── */
function useCountUp(target: number, duration = 1800, inView = true) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = Math.max(1, Math.floor(duration / target))
    const timer = setInterval(() => {
      start += 1
      setVal(start)
      if (start >= target) clearInterval(timer)
    }, step)
    return () => clearInterval(timer)
  }, [target, duration, inView])
  return val
}

/* ── Skill level dots ──────────────────────────────────────────────────────── */
function SkillDots({ level }: { level: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 3, marginLeft: 8 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{
          width: 8, height: 8, borderRadius: '50%',
          background: i <= level ? '#000' : '#ccc',
          border: '1.5px solid #000',
        }} />
      ))}
    </span>
  )
}

/* ── 3D Tilt Card wrapper ──────────────────────────────────────────────────── */
function TiltCard({ children, className = '', style, tiltDeg = 8, ...props }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; tiltDeg?: number } & React.HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null)
  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    el.style.transform = `perspective(800px) rotateY(${x * tiltDeg}deg) rotateX(${-y * tiltDeg}deg) scale(1.02)`
  }
  const handleMouseLeave = () => {
    const el = ref.current
    if (el) el.style.transform = 'perspective(800px) rotateY(0) rotateX(0) scale(1)'
  }
  return (
    <div ref={ref} className={className} style={{ transition: 'transform 0.2s ease-out', transformStyle: 'preserve-3d', ...style }}
      onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} {...props}>
      {children}
    </div>
  )
}

/* ── Washi / Masking Tape decoration ───────────────────────────────────────── */
function TapeStrip({ color = '#f5e100', rotate = '-3deg', position = 'top-right' }: { color?: string; rotate?: string; position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  const posStyles: Record<string, React.CSSProperties> = {
    'top-left': { top: -8, left: 12 },
    'top-right': { top: -8, right: 12 },
    'bottom-left': { bottom: -8, left: 12 },
    'bottom-right': { bottom: -8, right: 12 },
  }
  return (
    <div style={{
      position: 'absolute', ...posStyles[position],
      width: 60, height: 22, background: color, opacity: 0.7,
      transform: `rotate(${rotate})`, border: '1.5px solid rgba(0,0,0,0.15)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)', zIndex: 2,
    }} />
  )
}

/* ── Magnetic hover button ─────────────────────────────────────────────────── */
function MagneticButton({ children, className = '', style, ...props }: { children: React.ReactNode; className?: string; style?: React.CSSProperties } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const ref = useRef<HTMLAnchorElement>(null)
  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`
  }
  const handleMouseLeave = () => {
    const el = ref.current
    if (el) el.style.transform = 'translate(0, 0)'
  }
  return (
    <a ref={ref} className={className} style={{ transition: 'transform 0.25s ease-out', display: 'inline-flex', ...style }}
      onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} {...props}>
      {children}
    </a>
  )
}

/* ── Singapore time chip ───────────────────────────────────────────────────── */
function SingaporeTime() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-SG', { timeZone: 'Asia/Singapore', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      fontFamily: 'monospace', fontWeight: 900, fontSize: '1rem',
      border: BORDER, padding: '8px 16px', boxShadow: SHADOW, background: '#fffdf5',
    }}>
      <Clock size={16} /> SGT {time}
    </span>
  )
}

/* ── Floating geometric shapes for hero background ────────────────────────── */
const SHAPES = [
  { type: 'square' as const, size: 36, top: '12%', left: '8%', color: ACCENTS[0], dur: 7 },
  { type: 'square' as const, size: 28, top: '60%', left: '5%', color: ACCENTS[1], dur: 9 },
  { type: 'triangle' as const, size: 30, top: '25%', right: '10%', color: ACCENTS[2], dur: 8 },
  { type: 'square' as const, size: 22, top: '70%', right: '7%', color: ACCENTS[3], dur: 6 },
  { type: 'triangle' as const, size: 26, top: '45%', left: '15%', color: ACCENTS[4], dur: 10 },
  { type: 'square' as const, size: 32, top: '80%', right: '18%', color: ACCENTS[5], dur: 11 },
]

function FloatingShapes() {
  return (
    <>
      {SHAPES.map((s, i) => {
        const pos: React.CSSProperties = {
          position: 'absolute', zIndex: 0, pointerEvents: 'none',
          top: s.top, left: (s as { left?: string }).left, right: (s as { right?: string }).right,
          opacity: 0.14 + (i % 3) * 0.03,
          animation: `brutal-float ${s.dur}s ease-in-out infinite`,
          animationDelay: `${i * 0.8}s`,
        }
        if (s.type === 'square') {
          return (
            <div key={i} style={{
              ...pos, width: s.size, height: s.size,
              border: `3px solid ${s.color}`, transform: `rotate(${15 * i}deg)`,
            }} />
          )
        }
        // CSS triangle
        return (
          <div key={i} style={{
            ...pos, width: 0, height: 0,
            borderLeft: `${s.size / 2}px solid transparent`,
            borderRight: `${s.size / 2}px solid transparent`,
            borderBottom: `${s.size}px solid ${s.color}`,
            transform: `rotate(${20 * i}deg)`,
          }} />
        )
      })}
    </>
  )
}

/* ── Brutal Boot Screen ──────────────────────────────────────────────────── */
function BrutalBootScreen({ onDone }: { onDone: () => void }) {
  const [lines, setLines] = useState<string[]>([])
  const BOOT_LINES = [
    '> BOOTING EPOS V5...',
    '> LOADING MODULES ▓▓▓▓▓▓▓▓░░░░ 67%',
    '> LOADING MODULES ▓▓▓▓▓▓▓▓▓▓▓▓ 100%',
    '> INITIALIZING BRUTAL MODE...',
    '> READY.',
  ]
  const DELAYS = [0, 600, 1200, 1800, 2200]

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    DELAYS.forEach((d, i) => {
      timers.push(setTimeout(() => setLines(prev => [...prev, BOOT_LINES[i]]), d))
    })
    timers.push(setTimeout(onDone, 2800))
    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pct = Math.min(100, Math.round((lines.length / BOOT_LINES.length) * 100))

  return (
    <motion.div
      key="boot"
      exit={{ opacity: 1, y: '-100%' }}
      transition={{ duration: 0.35, ease: 'easeIn' }}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000, background: '#000',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        fontFamily: 'monospace', color: '#0f0', padding: '10vh 10vw',
        borderBottom: '6px solid #f5e100',
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {lines.map((l, i) => (
          <div key={i} style={{ fontSize: 'clamp(0.9rem, 2vw, 1.4rem)', fontWeight: 700, marginBottom: 8 }}>
            {l}
            {i === lines.length - 1 && <span className="brutal-cursor">█</span>}
          </div>
        ))}
      </div>
      <div style={{ height: 8, background: '#222', border: '2px solid #0f0', overflow: 'hidden' }}>
        <div style={{ height: '100%', background: '#0f0', width: `${pct}%`, transition: 'width 0.3s ease' }} />
      </div>
    </motion.div>
  )
}

/* ── Giant Rotated Typography Divider ────────────────────────────────────── */
function GiantDivider({ text, color = '#000', bg = 'transparent' }: { text: string; color?: string; bg?: string }) {
  return (
    <div style={{
      background: bg, overflow: 'hidden', padding: '20px 0', position: 'relative',
      borderTop: BORDER, borderBottom: BORDER,
    }}>
      <div style={{
        fontWeight: 900, fontSize: 'clamp(4rem, 12vw, 10rem)', textTransform: 'uppercase',
        letterSpacing: '-0.04em', lineHeight: 0.85, color,
        transform: 'rotate(-2deg) translateX(-2%)',
        whiteSpace: 'nowrap', opacity: 0.12, pointerEvents: 'none',
        userSelect: 'none',
      }}>
        {text}
      </div>
    </div>
  )
}

/* ── Interactive SVG Skill Graph ──────────────────────────────────────────── */
function SkillGraph() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null)

  const positions = useMemo(() => {
    const catX: Record<string, number> = { frontend: 140, backend: 350, devops: 560, design: 780 }
    const groups: Record<string, typeof SKILLS_GRAPH.nodes> = {}
    SKILLS_GRAPH.nodes.forEach(n => { if (!groups[n.category]) groups[n.category] = []; groups[n.category].push(n) })
    const map: Record<string, { x: number; y: number }> = {}
    Object.entries(groups).forEach(([cat, nodes]) => {
      const bx = catX[cat] || 450
      const rows = Math.ceil(nodes.length / 2)
      const yStart = (380 - (rows - 1) * 68) / 2 + 10
      nodes.forEach((n, i) => { map[n.id] = { x: bx + (i % 2) * 82 - 41, y: yStart + Math.floor(i / 2) * 68 } })
    })
    return map
  }, [])

  const neighbors = useMemo(() => {
    const c: Record<string, Set<string>> = {}
    SKILLS_GRAPH.edges.forEach(([a, b]) => { if (!c[a]) c[a] = new Set(); if (!c[b]) c[b] = new Set(); c[a].add(b); c[b].add(a) })
    return c
  }, [])

  const isOn = (id: string) => !hoveredSkill || id === hoveredSkill || neighbors[hoveredSkill]?.has(id)
  const isEdgeOn = (a: string, b: string) => hoveredSkill === a || hoveredSkill === b

  return (
    <motion.div ref={ref} initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.6 }}>
      <svg width="100%" viewBox="0 0 900 400" style={{ display: 'block', maxWidth: 900, margin: '0 auto' }}>
        {SKILLS_GRAPH.edges.map(([a, b]) => {
          const pa = positions[a], pb = positions[b]
          if (!pa || !pb) return null
          const h = isEdgeOn(a, b)
          return <line key={`${a}-${b}`} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
            stroke={h ? '#ff6b9d' : '#000'} strokeWidth={h ? 3 : 1.5}
            opacity={hoveredSkill ? (h ? 1 : 0.12) : 0.25}
            style={{ transition: 'opacity 0.2s, stroke 0.2s, stroke-width 0.2s' }} />
        })}
        {SKILLS_GRAPH.nodes.map(n => {
          const p = positions[n.id]
          if (!p) return null
          const on = isOn(n.id)
          const w = Math.max(76, n.label.length * 6.5 + 14)
          return (
            <g key={n.id} onMouseEnter={() => setHoveredSkill(n.id)} onMouseLeave={() => setHoveredSkill(null)} style={{ cursor: 'default' }}>
              <rect x={p.x - w / 2} y={p.y - 14} width={w} height={28} rx={2}
                fill={SKILL_CAT_COLORS[n.category]} stroke="#000" strokeWidth={on ? 3 : 2}
                opacity={on ? 1 : 0.18} style={{ transition: 'opacity 0.2s, stroke-width 0.2s' }} />
              <text x={p.x} y={p.y + 4} textAnchor="middle" fontWeight={900} fontSize={n.label.length > 14 ? 8 : 10}
                fill="#000" opacity={on ? 1 : 0.18} style={{ transition: 'opacity 0.2s' }}>
                {n.label}
              </text>
            </g>
          )
        })}
      </svg>
    </motion.div>
  )
}

/* ── Click-to-Stamp overlay ──────────────────────────────────────────────── */
function ClickStamps() {
  const [stamps, setStamps] = useState<{ id: number; x: number; y: number; text: string; color: string; rotate: number }[]>([])
  const idRef = useRef(0)
  useEffect(() => {
    const chars = ['★', '◼', '✦', '●', 'CLICK!', '→']
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('a,button,input,textarea,select,[role="button"]')) return
      idRef.current += 1
      const id = idRef.current
      setStamps(prev => {
        const next = [...prev, {
          id, x: e.clientX, y: e.clientY,
          text: chars[Math.floor(Math.random() * chars.length)],
          color: ACCENTS[Math.floor(Math.random() * ACCENTS.length)],
          rotate: Math.round(Math.random() * 30 - 15),
        }]
        return next.length > 12 ? next.slice(-12) : next
      })
    }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [])
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 800, pointerEvents: 'none' }}>
      <AnimatePresence>
        {stamps.map(s => (
          <motion.div key={s.id} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 0.6 }} exit={{ scale: 0, opacity: 0 }}
            style={{
              position: 'fixed', left: s.x - 20, top: s.y - 14,
              transform: `rotate(${s.rotate}deg)`, background: s.color,
              border: BORDER, boxShadow: SHADOW, padding: '4px 10px',
              fontWeight: 900, fontSize: '0.8rem', pointerEvents: 'none', color: '#000',
            }}>
            {s.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

/* ── PostitNote sticky note ──────────────────────────────────────────────── */
function PostitNote({ text, color = '#f5e100', rotate = '-3deg', style }: {
  text: string; color?: string; rotate?: string; style?: React.CSSProperties
}) {
  return (
    <div className="brutal-postit" style={{
      position: 'absolute', width: 140, padding: '14px 12px', background: color,
      border: '1px solid rgba(0,0,0,0.1)', boxShadow: '2px 2px 6px rgba(0,0,0,0.15)',
      transform: `rotate(${rotate})`, fontSize: '0.78rem', fontFamily: 'system-ui',
      lineHeight: 1.4, fontWeight: 600, zIndex: 5, pointerEvents: 'none', ...style,
    }}>
      {text}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════════════════ */
export default function Portfolio3Brutal() {
  const [mobileNav, setMobileNav] = useState(false)
  const [progress, setProgress] = useState(0)
  const [booted, setBooted] = useState(false)
  const [activeSection, setActiveSection] = useState('about')
  const location = useLocation()

  /* Smooth-scroll to a section, offset for the fixed nav */
  const goTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 64, behavior: 'smooth' })
  }

  /* Brutal scroll-progress bar */
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Page title */
  useEffect(() => {
    if (location.pathname === '/portfolio-3') document.title = 'EPOS V5 — Brutal Portfolio'
  }, [location.pathname])

  /* Active section tracking via IntersectionObserver */
  useEffect(() => {
    if (!booted) return
    const ids = NAV_ITEMS.map(n => n.id)
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        })
      },
      { threshold: 0.3 },
    )
    ids.forEach(id => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [booted])

  return (
    <>
      <style>{`
        .brutal-page { background:#fffdf5; background-image:radial-gradient(circle,#00000008 1px,transparent 1px); background-size:24px 24px; color:#000; font-family:system-ui,-apple-system,sans-serif; min-height:100vh; overflow-x:hidden; }
        .brutal-page *{box-sizing:border-box;}
        .brutal-container{max-width:1120px;margin:0 auto;padding:0 24px;}
        @keyframes brutal-scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .brutal-marquee{display:inline-block;animation:brutal-scroll 18s linear infinite;}
        .brutal-marquee-wrap:hover .brutal-marquee{animation-play-state:paused;}
        .brutal-card{border:${BORDER};box-shadow:${SHADOW};background:#fff;transition:transform .15s,box-shadow .15s;}
        .brutal-card:hover{transform:translate(2px,-2px);box-shadow:${SHADOW_LG};}
        .brutal-btn{display:inline-flex;align-items:center;gap:8px;border:${BORDER};padding:14px 28px;font-weight:900;font-size:1rem;text-transform:uppercase;cursor:pointer;text-decoration:none;transition:transform .12s,box-shadow .12s,background .12s,color .12s;}
        .brutal-btn:hover{transform:translate(2px,-2px);box-shadow:${SHADOW_LG};}
        .brutal-btn-primary{background:#000;color:#fff;box-shadow:${SHADOW};}
        .brutal-btn-primary:hover{background:#fff;color:#000;}
        .brutal-heading{font-weight:900;text-transform:uppercase;letter-spacing:-0.02em;line-height:0.95;}
        @media(max-width:768px){.brutal-grid-2{grid-template-columns:1fr!important;} .brutal-nav-links{display:none!important;} .brutal-mobile-btn{display:flex!important;}}
        @media(min-width:769px){.brutal-mobile-btn{display:none!important;} .brutal-mobile-menu{display:none!important;}}
        @keyframes brutal-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes brutal-glitch{0%,90%,100%{text-shadow:none;transform:translate(0,0);}91%{text-shadow:-3px 0 #ff6b9d,3px 0 #0066ff;}92%{text-shadow:3px 0 #ff6b9d,-3px 0 #0066ff;}93%{text-shadow:-2px 2px #ff6b9d,2px -2px #0066ff;}94%{text-shadow:none;}95%{text-shadow:2px 0 #ff6b9d,-2px 0 #0066ff;transform:translate(2px,0);}96%{text-shadow:-3px 0 #ff6b9d,3px 0 #0066ff;transform:translate(-2px,0);}97%{text-shadow:none;transform:translate(0,0);}}
        .brutal-glitch-text{animation:brutal-glitch 4s infinite;position:relative;}
        @keyframes brutal-float{0%,100%{transform:translateY(0) rotate(0deg);}50%{transform:translateY(-30px) rotate(12deg);}}
        .brutal-noise{position:fixed;inset:0;z-index:9000;pointer-events:none;opacity:0.04;}
        .brutal-hire-badge{display:none;}
        @media(min-width:900px){.brutal-hire-badge{display:block;}}
        @media(pointer:fine){.brutal-page,.brutal-page *{cursor:none !important;}}
        @keyframes brutal-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}}
        .brutal-bounce{animation:brutal-bounce 0.8s ease-in-out infinite;}
        @keyframes brutal-stamp{0%{transform:scale(1.4) rotate(-6deg);opacity:0}60%{transform:scale(0.95) rotate(1deg);opacity:1}100%{transform:scale(1) rotate(0deg);opacity:1}}
        .brutal-stamp{animation:brutal-stamp 0.5s ease-out forwards;}
        @keyframes brutal-blink{0%,100%{opacity:1}50%{opacity:0}}
        .brutal-cursor{animation:brutal-blink 0.8s step-end infinite;}
        .brutal-project-card{position:relative;overflow:hidden;transition:color .2s,transform .15s,box-shadow .15s;}
        .brutal-project-card::before{content:'';position:absolute;inset:0;background:var(--card-hover-color,#10b981);transform:scaleX(0);transform-origin:left;transition:transform 0.4s ease;z-index:0;}
        .brutal-project-card:hover::before{transform:scaleX(1);}
        .brutal-project-card>*{position:relative;z-index:1;}
        .brutal-project-card:hover{color:#fff !important;}
        .brutal-project-card:hover img{transform:scale(1.05) rotate(0deg) !important;}
        .brutal-torn{clip-path:polygon(0% 0%,4% 2%,8% 0%,12% 1.5%,16% 0%,20% 2%,24% 0%,28% 1%,32% 0%,36% 2%,40% 0%,44% 1.5%,48% 0%,52% 2%,56% 0%,60% 1%,64% 0%,68% 2%,72% 0%,76% 1.5%,80% 0%,84% 2%,88% 0%,92% 1%,96% 0%,100% 2%,100% 98%,96% 100%,92% 98%,88% 100%,84% 98.5%,80% 100%,76% 98%,72% 100%,68% 99%,64% 100%,60% 98%,56% 100%,52% 98.5%,48% 100%,44% 98%,40% 100%,36% 99%,32% 100%,28% 98%,24% 100%,20% 98.5%,16% 100%,12% 98%,8% 100%,4% 99%,0% 100%);}
        @media(max-width:768px){.brutal-postit{display:none!important;}}
      `}</style>

      <AnimatePresence>
        {!booted && <BrutalBootScreen onDone={() => setBooted(true)} />}
      </AnimatePresence>
      {booted && (<>
      <div className="brutal-page">
        {/* ── Noise grain overlay ─────────────────────────────────────── */}
        <svg className="brutal-noise" aria-hidden="true">
          <filter id="brutal-noise-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#brutal-noise-filter)" />
        </svg>
        {/* ── Section background tint ───────────────────────────────────── */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: SECTION_TINTS[activeSection] || 'transparent',
          transition: 'background 0.8s ease',
        }} />

        {/* ── Scroll progress bar (brutal style) ─────────────────────────── */}
        <div style={{
          position: 'fixed', top: 0, left: 0, height: 6, width: `${progress * 100}%`,
          background: '#f5e100', borderRight: '3px solid #000', borderBottom: '2px solid #000',
          zIndex: 1001, pointerEvents: 'none',
        }} aria-hidden="true" />

        {/* ── Square custom cursor (fine pointers only) ──────────────────── */}
        <SquareCursor />
        <ClickStamps />
        {/* ── Fixed Navigation ──────────────────────────────────────────── */}
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999,
          background: '#fffdf5', borderBottom: '4px solid #000',
          padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56,
        }}>
          <a href="#" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }} style={{ fontWeight: 900, fontSize: '1.3rem', textDecoration: 'none', color: '#000', letterSpacing: '-0.03em' }}>
            ◼ BRUTAL
          </a>
          <div className="brutal-nav-links" style={{ display: 'flex', gap: 0 }}>
            {NAV_ITEMS.map((n, i) => (
              <a key={n.id} href={`#${n.id}`} onClick={goTo(n.id)} style={{
                padding: '16px 18px', fontWeight: 900, fontSize: '0.85rem', textDecoration: 'none',
                color: '#000', textTransform: 'uppercase', letterSpacing: '0.04em',
                borderLeft: BORDER, transition: 'background .15s',
                background: activeSection === n.id ? accent(i) : 'transparent',
              }}
                onMouseEnter={e => { (e.target as HTMLElement).style.background = accent(i) }}
                onMouseLeave={e => { (e.target as HTMLElement).style.background = activeSection === n.id ? accent(i) : 'transparent' }}
              >
                {n.label}
              </a>
            ))}
          </div>
          <button
            className="brutal-mobile-btn"
            onClick={() => setMobileNav(!mobileNav)}
            style={{ display: 'none', alignItems: 'center', justifyContent: 'center', background: 'none', border: BORDER, width: 42, height: 42, cursor: 'pointer', boxShadow: SHADOW }}
          >
            {mobileNav ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileNav && (
            <motion.div
              className="brutal-mobile-menu"
              initial={{ y: -200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -200, opacity: 0 }}
              style={{
                position: 'fixed', top: 56, left: 0, right: 0, zIndex: 998,
                background: '#fffdf5', borderBottom: '4px solid #000',
              }}
            >
              {NAV_ITEMS.map((n, i) => (
                <a key={n.id} href={`#${n.id}`} onClick={e => { goTo(n.id)(e); setMobileNav(false) }} style={{
                  display: 'block', padding: '18px 24px', fontWeight: 900, fontSize: '1.1rem',
                  textDecoration: 'none', color: '#000', borderBottom: BORDER,
                  background: accent(i), textTransform: 'uppercase',
                }}>
                  {n.label}
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <Section>
          {/* Floating geometric shapes */}
          <FloatingShapes />

          {/* Wavy zigzag background band */}
          <div style={{ position: 'absolute', top: '30%', left: 0, right: 0, zIndex: 0, opacity: 0.08, pointerEvents: 'none' }}>
            <svg width="100%" height="120" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0 40 Q100 0 200 40 T400 40 T600 40 T800 40 T1000 40 T1200 40 V120 H0Z" fill="#ff6b9d" />
              <path d="M0 60 Q100 20 200 60 T400 60 T600 60 T800 60 T1000 60 T1200 60 V120 H0Z" fill="#0066ff" />
            </svg>
          </div>

          <div className="brutal-container" style={{ paddingTop: 'calc(56px + 8vh)', paddingBottom: '6vh', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            {/* Rotating circular hire-me badge (desktop) */}
            <div className="brutal-hire-badge" style={{ position: 'absolute', top: 72, right: 24, zIndex: 2 }}>
              <HireBadge />
            </div>
            <motion.h1
              className="brutal-heading brutal-glitch-text"
              data-text={HERO_NAME}
              style={{ fontSize: 'clamp(4rem, 10vw, 10rem)', margin: 0, lineHeight: 0.9 }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {HERO_NAME}
            </motion.h1>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
              <ScribbleUnderline width={280} color="#ff6b9d" />
            </div>

            {/* Animated counter: 5+ YEARS */}
            <motion.div
              style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CountUpHero />
            </motion.div>

            {/* Rotating sticker badges */}
            <motion.div
              style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {HERO_STICKERS.map((s, i) => (
                <motion.span
                  key={s}
                  drag
                  dragConstraints={{ top: -20, left: -30, right: 30, bottom: 20 }}
                  dragElastic={0.3}
                  dragSnapToOrigin
                  whileDrag={{ scale: 1.2, rotate: 0 }}
                  animate={{ rotate: [Number(tilt(i).replace('deg', '')), -Number(tilt(i).replace('deg', '')), Number(tilt(i).replace('deg', ''))] }}
                  transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Sticker bg={accent(i)} rotate={tilt(i)} style={{ fontSize: '0.8rem', padding: '3px 10px' }}>{s}</Sticker>
                </motion.span>
              ))}
            </motion.div>

            <motion.div
              style={{ marginTop: 28 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Sticker bg="#f5e100" rotate="-2deg" style={{ fontSize: '1.1rem', padding: '8px 22px' }}>
                {HERO_ROLE}
              </Sticker>
            </motion.div>

            <motion.div
              style={{ marginTop: 20 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              <Sticker bg="#ff6b9d" rotate="1deg" style={{ color: '#fff' }}>
                ● Available for work
              </Sticker>
            </motion.div>

            <motion.div
              style={{ marginTop: 36 }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <MagneticButton href="#projects" onClick={goTo('projects')} className="brutal-btn brutal-btn-primary" style={{ fontSize: '1.15rem', padding: '16px 36px' }}>
                SEE MY WORK <span className="brutal-bounce" style={{ display: 'inline-block' }}><ArrowDown size={20} /></span>
              </MagneticButton>
            </motion.div>
          </div>
        </Section>

        {/* ── Marquee 1 ────────────────────────────────────────────────── */}
        <MarqueeBand text=" ENGINEER ★ POS SYSTEMS ★ REACT ★ .NET 8 ★ SINGAPORE ★ " angled />

        {/* ── About ────────────────────────────────────────────────────── */}
        <Section id="about">
          <div className="brutal-container" style={{ padding: '80px 24px', position: 'relative' }}>
            <PostitNote text="← This guy ships zero-bug code 🤯" color="#f5e100" rotate="-4deg" style={{ top: 40, right: -20 }} />
            <div className="brutal-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
              <div>
                <h2 className="brutal-heading" style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)', transform: 'rotate(-1deg)' }}>
                  WHO<br />AM I?
                </h2>
                <ScribbleUnderline width={160} color="#0066ff" />

                {/* Decorative ASCII box-art frame */}
                <div style={{
                  marginTop: 32, border: '4px dashed #000', padding: 20,
                  fontFamily: 'monospace', fontSize: '0.75rem', lineHeight: 1.4, whiteSpace: 'pre',
                  background: '#fff', boxShadow: SHADOW,
                }}>
{`╔══════════════════════════╗
║   ◼◼◼  EPOS V5  ◼◼◼    ║
║  ┌────────────────────┐  ║
║  │  Enterprise  POS   │  ║
║  │  Systems Engineer  │  ║
║  │  ── Singapore ──   │  ║
║  └────────────────────┘  ║
║  30+ modules · 0 bugs   ║
╚══════════════════════════╝`}
                </div>
              </div>
              <div>
                <p style={{ fontSize: '1.15rem', lineHeight: 1.7, fontWeight: 500 }}>
                  I build enterprise POS systems that handle real money, real transactions, and real retail operations
                  across Singapore. From payment terminals to loyalty engines, kitchen displays to offline sync — every
                  module ships production-ready with zero financial incidents.
                </p>

                {/* Currently status line */}
                <div style={{
                  marginTop: 20, padding: '12px 18px', border: BORDER, boxShadow: SHADOW,
                  background: '#7cff01', fontWeight: 900, fontSize: '0.95rem',
                }}>
                  ▶ Currently: Leading .NET 8 migration at EPOS Singapore
                </div>

                {/* Key stats with count-up */}
                <AboutStats />
              </div>
            </div>
          </div>
        </Section>

        <ZigzagDivider color="#ff5722" />
        <MarqueeBand text=" PAYMENTS ★ LOYALTY ★ OFFLINE-FIRST ★ GRPC ★ STRATEGY PATTERN ★ " bg="#0066ff" fg="#fff" />

        <GiantDivider text="EXPERIENCE × EXPERIENCE × EXPERIENCE" color="#ff5722" />

        {/* ── Experience ───────────────────────────────────────────────── */}
        <Section id="experience">
          <div className="brutal-container" style={{ padding: '80px 24px', position: 'relative' }}>
            <PostitNote text="5 years and counting! 📈" color="#ff6b9d" rotate="3deg" style={{ top: 60, left: -20 }} />
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 className="brutal-heading" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}>EXPERIENCE</h2>
              <div style={{ display: 'flex', justifyContent: 'center' }}><ScribbleUnderline width={220} color="#ff5722" /></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
              {CAREER_CHAPTERS.map((ch, i) => (
                <div key={ch.year} style={{ position: 'relative' }}>
                  {/* Zigzag connector between cards */}
                  {i > 0 && (
                    <svg width="60" height="50" viewBox="0 0 60 50" style={{ display: 'block', margin: '-8px auto', position: 'relative', zIndex: 0 }}>
                      <path d="M30 0 L15 12 L45 25 L15 38 L30 50" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
                    </svg>
                  )}
                  <TiltCard tiltDeg={4}>
                  <motion.div
                    className="brutal-card"
                    initial={{ opacity: 0, x: i % 2 === 0 ? -60 : 60 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.45 }}
                    style={{ padding: 32, position: 'relative', zIndex: CAREER_CHAPTERS.length - i, background: '#fff' }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 16, marginBottom: 12 }}>
                      {/* Year badge with stamp entrance */}
                      <motion.div
                        initial={{ scale: 1.4, rotate: -6, opacity: 0 }}
                        whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                      >
                        <Sticker bg={accent(i)} rotate={tilt(i)} style={{ fontSize: '1.1rem', padding: '6px 18px' }}>{ch.year}</Sticker>
                      </motion.div>
                      <h3 className="brutal-heading" style={{ fontSize: 'clamp(1.8rem, 3vw, 3rem)', margin: 0 }}>
                        {ch.company}
                      </h3>
                    </div>
                    <p style={{ fontWeight: 700, fontSize: '1.1rem', margin: '0 0 8px' }}>{ch.role} &middot; {ch.duration}</p>
                    <p style={{ lineHeight: 1.6, marginBottom: 16 }}>{ch.challenge}</p>

                    {/* Metrics with colored backgrounds */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
                      {ch.metrics.map((m, mi) => (
                        <div key={m.label} style={{
                          border: BORDER, padding: '10px 18px', fontWeight: 900,
                          fontSize: '1rem', background: accent(mi + i), boxShadow: SHADOW,
                          color: accent(mi + i) === '#0066ff' ? '#fff' : '#000',
                        }}>
                          {m.value} <span style={{ fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase' }}>{m.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* All projects as mini sticker cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, marginBottom: 16 }}>
                      {ch.projects.map((proj, pi) => (
                        <div key={proj.name} style={{
                          border: '2px solid #000', padding: '12px 14px', background: '#fffdf5',
                          transform: `rotate(${tilt(pi)})`, boxShadow: '3px 3px 0 #000',
                        }}>
                          <div style={{ fontWeight: 900, fontSize: '0.85rem', marginBottom: 4 }}>{proj.name}</div>
                          <div style={{ fontSize: '0.78rem', lineHeight: 1.5, opacity: 0.8 }}>{proj.desc}</div>
                          {proj.badges && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                              {proj.badges.map(b => (
                                <span key={b} style={{
                                  fontSize: '0.65rem', fontWeight: 800, padding: '1px 6px',
                                  background: accent(pi), border: '1.5px solid #000',
                                }}>
                                  {b}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {ch.skills.map((sk, si) => (
                        <Sticker key={sk} bg={accent(si + i)} rotate={tilt(si)}>{sk}</Sticker>
                      ))}
                    </div>
                  </motion.div>
                  </TiltCard>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <ZigzagDivider color="#f5e100" />
        <MarqueeBand text=" .NET 8 ★ ZERO DOWNTIME ★ 20+ PAYMENTS ★ OFFLINE SYNC ★ REAL MONEY ★ " bg="#f5e100" fg="#000" angled />

        <GiantDivider text="PROJECTS → PROJECTS → PROJECTS →" color="#f5e100" />

        {/* ── Projects ─────────────────────────────────────────────────── */}
        <Section id="projects">
          <div className="brutal-container" style={{ padding: '80px 24px', position: 'relative' }}>
            <PostitNote text="Real money. Real stakes. 💰" color="#7cff01" rotate="-2deg" style={{ top: 50, right: -20 }} />
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 className="brutal-heading" style={{ fontSize: 'clamp(3rem, 6vw, 6rem)' }}>MY WORK</h2>
              <div style={{ display: 'flex', justifyContent: 'center' }}><ScribbleUnderline width={180} color="#f5e100" /></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
              {PROJECTS.map((p, i) => (
                <TiltCard key={p.slug}>
                <motion.div
                  className="brutal-project-card brutal-torn"
                  initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  whileHover={{ x: 2, y: -2, boxShadow: SHADOW_XL }}
                  transition={{ duration: 0.4 }}
                  style={{
                    border: BORDER, boxShadow: SHADOW, padding: '40px 32px',
                    background: '#fff', color: '#000', cursor: 'default',
                    marginLeft: i % 2 === 1 ? 40 : 0,
                    marginRight: i % 2 === 0 ? 40 : 0,
                    '--card-hover-color': p.color,
                  } as React.CSSProperties}
                >
                  {p.caseStudy?.gallery?.[0] && (
                    <img
                      src={p.caseStudy.gallery[0]}
                      alt={`${p.title} preview`}
                      loading="lazy"
                      style={{
                        display: 'block', width: 200, maxWidth: '45%', marginBottom: 18,
                        border: BORDER, boxShadow: SHADOW_LG, background: '#fff', padding: 6,
                        transform: `rotate(${i % 2 === 0 ? '-2deg' : '2deg'})`,
                      }}
                    />
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <Star size={20} fill="#f5e100" />
                    <span style={{ fontWeight: 900, fontSize: '1rem' }}>{p.stars}</span>
                    {p.featured && <Sticker bg="#000" style={{ color: '#fff', padding: '2px 10px', fontSize: '0.75rem' }}>★ FEATURED</Sticker>}
                  </div>
                  <h3 className="brutal-heading" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.8rem)', margin: '0 0 12px' }}>
                    {p.title}
                  </h3>
                  <p style={{ lineHeight: 1.7, fontSize: '1rem', marginBottom: 16, maxWidth: 750 }}>{p.desc}</p>

                  {/* Case study metrics as stat pills */}
                  {p.caseStudy?.metrics && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                      {p.caseStudy.metrics.slice(0, 4).map(m => (
                        <span key={m.label} style={{
                          border: '2px solid currentColor', padding: '4px 12px',
                          fontWeight: 900, fontSize: '0.8rem',
                        }}>
                          {m.value} {m.label}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                    {p.tags.map((t, ti) => (
                      <Sticker key={t} bg={accent(ti + i)} rotate={tilt(ti)}>{t}</Sticker>
                    ))}
                  </div>

                  {p.caseStudy && (
                    <Link
                      to={`/portfolio-3/project/${p.slug}`}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        fontWeight: 900, fontSize: '0.95rem', textDecoration: 'none',
                        color: 'inherit', borderBottom: '3px solid currentColor', paddingBottom: 2,
                      }}
                    >
                      View Case Study →
                    </Link>
                  )}
                </motion.div>
                </TiltCard>
              ))}
            </div>
          </div>
        </Section>

        <ZigzagDivider color="#7cff01" />
        <MarqueeBand text=" STRATEGY PATTERN ★ MVVM ★ REACTIVE UI ★ ENTITY FRAMEWORK ★ PROTOBUF ★ " bg="#7cff01" fg="#000" />

        {/* ── Skills ───────────────────────────────────────────────────── */}
        <Section id="skills">
          <div className="brutal-container" style={{ padding: '80px 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <h2 className="brutal-heading" style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)', margin: 0 }}>SKILLS</h2>
                <Sticker bg="#ff6b9d" rotate="3deg" style={{ color: '#fff', fontSize: '1.1rem', padding: '6px 16px' }}>
                  {SKILLS_GRAPH.nodes.length} TOTAL
                </Sticker>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}><ScribbleUnderline width={140} color="#7cff01" /></div>
            </div>

            <div style={{ marginBottom: 48 }}>
              <h3 className="brutal-heading" style={{ fontSize: '1.6rem', marginBottom: 8, letterSpacing: '0.08em' }}>SKILL MAP</h3>
              <ScribbleUnderline width={120} color="#0066ff" />
              <div style={{ marginTop: 16 }}>
                <SkillGraph />
              </div>
            </div>

            {(Object.keys(SKILL_CAT_LABELS) as SkillCategory[]).map(cat => {
              const nodes = SKILLS_GRAPH.nodes.filter(n => n.category === cat)
              if (!nodes.length) return null
              return (
                <div key={cat} style={{ marginBottom: 40 }}>
                  <h3 style={{
                    fontWeight: 900, textTransform: 'uppercase', fontSize: '1.4rem', letterSpacing: '0.08em',
                    marginBottom: 16, color: SKILL_CAT_COLORS[cat],
                    borderBottom: `4px solid ${SKILL_CAT_COLORS[cat]}`, paddingBottom: 8, display: 'inline-block',
                  }}>
                    {SKILL_CAT_LABELS[cat]} ({nodes.length})
                  </h3>
                  <motion.div
                    style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-40px' }}
                    variants={{ hidden: {}, show: { transition: { staggerChildren: 0.03 } } }}
                  >
                    {nodes.map((n, ni) => (
                      <motion.div
                        key={n.id}
                        variants={{
                          hidden: { opacity: 0, scale: 0.8, rotate: -10 },
                          show: { opacity: 1, scale: 1, rotate: Number(tilt(ni).replace('deg', '')) },
                        }}
                        whileHover={{ scale: 1.18, rotate: 0, zIndex: 10 }}
                        title={`${SKILL_CAT_LABELS[cat]} — Level ${n.level}`}
                        style={{
                          background: SKILL_CAT_COLORS[cat], border: BORDER, boxShadow: SHADOW,
                          padding: '10px 18px', fontWeight: 900, fontSize: '0.9rem',
                          color: '#000',
                          marginTop: ni % 3 === 1 ? 8 : 0, cursor: 'default',
                        }}
                      >
                        {n.label}
                        <SkillDots level={n.level} />
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              )
            })}
          </div>
        </Section>

        <ZigzagDivider color="#c4b5fd" />
        <MarqueeBand text=" CODE REVIEW ★ PR APPROVED ★ LGTM ★ ZERO BUGS ★ SHIP IT ★ " bg="#c4b5fd" fg="#000" angled />

        {/* ── Testimonials ─────────────────────────────────────────────── */}
        <Section id="testimonials">
          <div className="brutal-container" style={{ padding: '80px 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 className="brutal-heading" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}>NICE THINGS</h2>
              <div style={{ display: 'flex', justifyContent: 'center' }}><ScribbleUnderline width={200} color="#c4b5fd" /></div>
            </div>

            <div className="brutal-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
              {TESTIMONIALS_DATA.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="brutal-card"
                  style={{ padding: 28, position: 'relative', background: '#fff', overflow: 'visible' }}
                >
                  {/* Washi tape decorations */}
                  <TapeStrip color={accent(i)} rotate={i % 2 === 0 ? '-3deg' : '4deg'} position={i % 2 === 0 ? 'top-left' : 'top-right'} />
                  <TapeStrip color={accent(i + 2)} rotate={i % 2 === 0 ? '2deg' : '-3deg'} position={i % 2 === 0 ? 'bottom-right' : 'bottom-left'} />
                  {/* Speech bubble triangle in accent color */}
                  <div style={{
                    position: 'absolute', bottom: -16, left: 28, width: 0, height: 0,
                    borderLeft: '16px solid transparent', borderRight: '16px solid transparent',
                    borderTop: `16px solid ${accent(i)}`,
                  }} />
                  <div style={{
                    position: 'absolute', bottom: -12, left: 30, width: 0, height: 0,
                    borderLeft: '14px solid transparent', borderRight: '14px solid transparent',
                    borderTop: '14px solid #fff',
                  }} />

                  {/* Large colored quote mark */}
                  <div style={{
                    fontSize: '4rem', fontWeight: 900, lineHeight: 0.8, color: accent(i),
                    fontFamily: 'Georgia, serif', marginBottom: 8,
                  }}>
                    &ldquo;
                  </div>
                  <p style={{ lineHeight: 1.7, fontSize: '0.95rem', marginBottom: 16 }}>{t.quote}</p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                    {/* Avatar */}
                    <div style={{
                      width: 40, height: 40, border: BORDER, background: accent(i),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 900, fontSize: '0.85rem',
                    }}>
                      {t.avatar}
                    </div>
                    <div>
                      <span style={{ fontWeight: 900 }}>{t.name}</span>
                      <div style={{ fontSize: '0.82rem', opacity: 0.8 }}>{t.role}, {t.company}</div>
                    </div>
                    {/* PR badge */}
                    <Sticker bg="#fffdf5" rotate="2deg" style={{ fontSize: '0.7rem', padding: '2px 8px', marginLeft: 'auto' }}>
                      PR #{t.pr}
                    </Sticker>
                  </div>

                  {/* Reaction counts */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    <Sticker bg="#f5e100" rotate="-1deg" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                      👍 {t.reactions.thumbsUp}
                    </Sticker>
                    <Sticker bg="#ff6b9d" rotate="1deg" style={{ fontSize: '0.72rem', padding: '2px 8px', color: '#fff' }}>
                      ❤️ {t.reactions.heart}
                    </Sticker>
                    <Sticker bg="#7cff01" rotate="-2deg" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                      🚀 {t.reactions.rocket}
                    </Sticker>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        <ZigzagDivider color="#0066ff" />

        <GiantDivider text="★ LET'S BUILD SOMETHING ★" color="#0066ff" />

        {/* ── Contact ──────────────────────────────────────────────────── */}
        <Section id="contact">
          <div className="brutal-container" style={{ padding: '80px 24px', textAlign: 'center', position: 'relative' }}>
            <PostitNote text="Seriously, hire this person →" color="#c4b5fd" rotate="5deg" style={{ top: 30, left: -20 }} />
            <h2 className="brutal-heading" style={{ fontSize: 'clamp(3rem, 8vw, 8rem)' }}>LET'S TALK</h2>
            <div style={{ display: 'flex', justifyContent: 'center' }}><ScribbleUnderline width={200} color="#ff5722" /></div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 28, flexWrap: 'wrap' }}>
              <Sticker bg="#7cff01" rotate="-2deg" style={{ fontSize: '1rem', padding: '8px 18px' }}>
                ● Status: Available
              </Sticker>
              <SingaporeTime />
            </div>

            {/* Full-width email button */}
            <div style={{ marginTop: 32 }}>
              <MagneticButton
                href={`mailto:${CONTACT_EMAIL}`}
                className="brutal-btn"
                style={{
                  background: '#0066ff', color: '#fff', boxShadow: SHADOW_LG,
                  fontSize: '1.3rem', padding: '22px 40px', width: '100%', maxWidth: 700,
                  justifyContent: 'center',
                }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.background = '#fff'; el.style.color = '#0066ff' }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.background = '#0066ff'; el.style.color = '#fff' }}
              >
                <Mail size={24} /> {CONTACT_EMAIL}
              </MagneticButton>
            </div>

            {/* Social link tiles */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 32, flexWrap: 'wrap' }}>
              {SOCIAL_LINKS.map((s, i) => (
                <motion.a
                  key={s.platform}
                  href={s.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -4, boxShadow: SHADOW_XL }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    width: 80, height: 80, border: '4px solid #000', boxShadow: SHADOW_LG,
                    background: accent(i), color: '#000', textDecoration: 'none', gap: 6,
                  }}
                >
                  {socialIcon(s.platform)}
                  <span style={{ fontWeight: 900, fontSize: '0.65rem', textTransform: 'uppercase' }}>{s.platform}</span>
                </motion.a>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Footer marquee ───────────────────────────────────────────── */}
        <MarqueeBand text=" THANKS FOR SCROLLING ★ EPOS V5 ★ HIRE ME ★ SINGAPORE ★ ZERO INCIDENTS ★ " />

        {/* ── Receipt cut line ─────────────────────────────────────── */}
        <div style={{ textAlign: 'center', padding: '18px 0 0', fontFamily: 'monospace', fontWeight: 900, fontSize: '0.85rem', letterSpacing: '0.15em', opacity: 0.45 }}>
          --- ✂ CUT HERE ----
        </div>

        <motion.footer
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            background: '#f5f5f0', fontFamily: 'monospace', padding: '32px 24px',
            borderTop: '4px solid #000', lineHeight: 1.6,
          }}
        >
          <div style={{ maxWidth: 500, margin: '0 auto' }}>
            <pre style={{ margin: 0, fontFamily: 'monospace', fontWeight: 700, fontSize: '0.82rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', textAlign: 'center' }}>
{`=============================
EPOS V5 PORTFOLIO
RECEIPT #2026-0918
=============================
ITEMS:
  1x BRUTAL PORTFOLIO .... FREE
  1x HIRE POTENTIAL .... PRICELESS
=============================
THANK YOU FOR SCROLLING!
=============================`}
            </pre>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
              {SOCIAL_LINKS.map((s, i) => (
                <a key={s.platform} href={s.url || '#'} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, border: BORDER, boxShadow: SHADOW, background: accent(i), color: '#000', textDecoration: 'none' }}>
                  {socialIcon(s.platform)}
                </a>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
              <motion.button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                whileHover={{ y: -3, boxShadow: SHADOW_LG }}
                style={{ border: BORDER, boxShadow: SHADOW, background: '#000', color: '#fff', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 900 }}>
                <ArrowUp size={20} />
              </motion.button>
            </div>

            <div style={{ textAlign: 'center', marginTop: 16, fontSize: '0.78rem', opacity: 0.6, fontFamily: 'monospace' }}>
              &copy; {new Date().getFullYear()} {HERO_NAME} &middot; Built with React &middot; Bold borders &amp; pop colors
            </div>
          </div>
        </motion.footer>
      </div>

      <StyleSwitcher variant="brutal" />
      <Outlet />
      </>)}
    </>
  )
}

/* ── Hero count-up sub-component ───────────────────────────────────────────── */
function CountUpHero() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const years = useCountUp(5, 1200, inView)
  const modules = useCountUp(30, 1400, inView)
  return (
    <div ref={ref} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
      <div style={{
        border: '4px solid #000', boxShadow: SHADOW_LG, background: '#ff6b9d', padding: '14px 28px',
        fontWeight: 900, fontSize: '2.2rem', color: '#fff', fontFamily: 'monospace',
      }}>
        {years}+ YEARS
      </div>
      <div style={{
        border: '4px solid #000', boxShadow: SHADOW_LG, background: '#0066ff', padding: '14px 28px',
        fontWeight: 900, fontSize: '2.2rem', color: '#fff', fontFamily: 'monospace',
      }}>
        {modules}+ MODULES
      </div>
    </div>
  )
}

/* ── About stats with count-up ─────────────────────────────────────────────── */
function AboutStats() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const y = useCountUp(5, 1000, inView)
  const m = useCountUp(30, 1200, inView)
  const r = useCountUp(200, 1500, inView)
  const stats = [
    { v: `${y}+ Years`, num: y, bg: '#ff6b9d' },
    { v: `${m}+ Modules`, num: m, bg: '#0066ff' },
    { v: `$${r}K+`, num: r, bg: '#f5e100' },
    { v: '0 Incidents', num: 0, bg: '#7cff01' },
  ]
  return (
    <div ref={ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginTop: 24 }}>
      {stats.map((s, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, rotate: -12 }}
          whileInView={{ scale: 1, rotate: Number(tilt(i).replace('deg', '')) }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: i * 0.1 }}
          whileHover={{ scale: 1.05, rotate: 0 }}
          style={{
            background: s.bg, border: BORDER, boxShadow: SHADOW,
            padding: '20px 16px', fontWeight: 900, fontSize: '1.2rem',
            textAlign: 'center',
            color: s.bg === '#0066ff' ? '#fff' : '#000',
          }}
        >
          {s.v}
        </motion.div>
      ))}
    </div>
  )
}
