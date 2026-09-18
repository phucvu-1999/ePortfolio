import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

// ═══════════════════════════════════════════════════════════════════════════
// ContributionGraph — V5 POS project contribution dashboard with animated
// heatmap, V5-specific metrics, and tech stack breakdown.
// ═══════════════════════════════════════════════════════════════════════════

const LEVEL_COLORS = ['#1b2230', '#0e4429', '#006d32', '#26a641', '#39d353']
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

interface Cell {
  date: Date
  level: number
  commits: number
}

// ─── V5 POS contribution data ───────────────────────────────────────────────────────

// Deterministic pseudo-random in [0, 1)
function seeded(i: number): number {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

// V5 POS contribution pattern: heavy payment work in 2022, migration spikes in 2024
function buildCells(): Cell[] {
  const cells: Cell[] = []
  const today = new Date()
  for (let i = 363; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const idx = 363 - i
    const r = seeded(idx)
    const dow = date.getDay()
    const weekend = dow === 0 || dow === 6
    // V5 POS work pattern: steady baseline + payment module spikes (2022) + migration bursts (2024)
    const yearProgress = idx / 363
    const paymentPhase = yearProgress > 0.4 && yearProgress < 0.7 ? 0.25 : 0
    const migrationPhase = yearProgress > 0.8 ? 0.3 : 0
    const trend = 0.3 + paymentPhase + migrationPhase
    const score = r * (weekend ? 0.45 : 1) * trend + r * 0.2
    const level = score > 0.58 ? 4 : score > 0.44 ? 3 : score > 0.3 ? 2 : score > 0.18 ? 1 : 0
    const commits = level === 0 ? 0 : level * 2 + Math.floor(seeded(idx + 999) * 3)
    cells.push({ date, level, commits })
  }
  return cells
}

function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!inView) return
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / 1600, 1)
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, target])
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

const LANGUAGES = [
  { name: 'C# / .NET 8', pct: 58, color: '#178600' },
  { name: 'XAML / WPF', pct: 18, color: '#3178c6' },
  { name: 'gRPC Proto', pct: 12, color: '#006d32' },
  { name: 'SQL / EF Core', pct: 8, color: '#e38c00' },
  { name: 'Other', pct: 4, color: '#64748b' },
]

export default function ContributionGraph() {
  const [cells] = useState<Cell[]>(() => buildCells())
  const [hovered, setHovered] = useState<number | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const inView = useInView(gridRef, { once: true, margin: '-80px' })
  const reduce = useReducedMotion()

  const totalCommits = useMemo(() => cells.reduce((s, c) => s + c.commits, 0), [cells])
  const activeDays = useMemo(() => cells.filter(c => c.commits > 0).length, [cells])

  // Month labels: find the first cell of each month (aligned to week columns)
  const monthLabels = useMemo(() => {
    const labels: Array<{ col: number; name: string }> = []
    let prevMonth = -1
    cells.forEach((c, i) => {
      const m = c.date.getMonth()
      if (m !== prevMonth) {
        prevMonth = m
        if (i % 7 === 0 || labels.length === 0) labels.push({ col: Math.floor(i / 7), name: MONTHS[m] })
      }
    })
    return labels
  }, [cells])

  const hoveredCell = hovered !== null ? cells[hovered] : null

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0d1117]/80 p-6 sm:p-8">
      {/* Header + V5 POS metrics */}
      <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
        <div>
          <div className="font-mono text-xs text-emerald-400 uppercase tracking-widest mb-1">
            V5 POS · Contribution Overview
          </div>
          <div className="text-2xl font-bold text-slate-100" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <CountUp target={totalCommits} /> contributions
          </div>
          <div className="text-sm text-slate-500 mt-1">
            2020 — Present · {activeDays} active days
          </div>
        </div>
        <div className="flex gap-8">
          <div className="text-center">
            <div className="font-mono text-3xl font-bold text-emerald-400"><CountUp target={30} suffix="+" /></div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mt-1">Modules built</div>
          </div>
          <div className="text-center">
            <div className="font-mono text-3xl font-bold text-blue-400"><CountUp target={40} suffix="+" /></div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mt-1">gRPC endpoints</div>
          </div>
          <div className="text-center">
            <div className="font-mono text-3xl font-bold text-violet-400"><CountUp target={22} suffix="/22" /></div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mt-1">Migrated</div>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[720px]">
          {/* Month labels */}
          <div className="relative h-5 ml-8">
            {monthLabels.map(m => (
              <span key={m.name + m.col} className="absolute font-mono text-[10px] text-slate-500" style={{ left: m.col * 14 }}>
                {m.name}
              </span>
            ))}
          </div>
          <div className="flex gap-0">
            {/* Day labels */}
            <div className="w-8 flex flex-col gap-[3px] pr-2">
              {DAY_LABELS.map((d, i) => (
                <span key={i} className="h-[11px] font-mono text-[9px] text-slate-500 leading-[11px]">{d}</span>
              ))}
            </div>
            {/* Grid: columns = weeks */}
            <div
              ref={gridRef}
              className="grid gap-[3px]"
              style={{ gridTemplateRows: 'repeat(7, 11px)', gridAutoFlow: 'column', gridAutoColumns: '11px' }}
            >
              {cells.map((c, i) => (
                <motion.div
                  key={i}
                  className="w-[11px] h-[11px] rounded-[2px] cursor-pointer"
                  style={{ background: LEVEL_COLORS[c.level] }}
                  initial={reduce ? false : { scale: 0, opacity: 0 }}
                  animate={inView ? { scale: 1, opacity: 1 } : {}}
                  transition={{ duration: 0.25, delay: Math.floor(i / 7) * 0.012 + (i % 7) * 0.004 }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                />
              ))}
            </div>
          </div>
          {/* Status row + legend */}
          <div className="flex items-center justify-between mt-3 ml-8">
            <span className="font-mono text-[11px] text-slate-400 h-4" aria-live="polite">
              {hoveredCell
                ? `${hoveredCell.commits === 0 ? 'No' : hoveredCell.commits} contribution${hoveredCell.commits === 1 ? '' : 's'} on ${hoveredCell.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                : 'hover a square for details'}
            </span>
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
              Less
              {LEVEL_COLORS.map(c => <span key={c} className="w-[11px] h-[11px] rounded-[2px]" style={{ background: c }} />)}
              More
            </div>
          </div>
        </div>
      </div>

      {/* Language breakdown */}
      <div className="mt-8 pt-6 border-t border-slate-800">
        <div className="flex h-2.5 rounded-full overflow-hidden mb-4">
          {LANGUAGES.map((l, i) => (
            <motion.div
              key={l.name}
              className="h-full"
              style={{ background: l.color }}
              initial={reduce ? false : { width: 0 }}
              animate={inView ? { width: `${l.pct}%` } : {}}
              transition={{ duration: 0.9, delay: 0.3 + i * 0.12, ease: 'easeOut' }}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {LANGUAGES.map(l => (
            <div key={l.name} className="flex items-center gap-2 font-mono text-xs text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
              {l.name} <span className="text-slate-600">{l.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
