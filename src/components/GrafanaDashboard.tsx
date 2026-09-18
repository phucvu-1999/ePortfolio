import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'

// ─── Data ────────────────────────────────────────────────────────────────────
const COMMIT_DATA = [12, 18, 15, 25, 32, 28, 45, 52, 48, 62, 71, 85]
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const STACK_BARS = [
  { label: 'Frontend', pct: 85, color: '#10b981' },
  { label: 'Backend', pct: 72, color: '#3b82f6' },
  { label: 'Full-Stack', pct: 65, color: '#8b5cf6' },
  { label: 'DevOps', pct: 45, color: '#f59e0b' },
  { label: 'Mobile', pct: 30, color: '#ec4899' },
]

const KEY_METRICS = [
  { label: 'Lines Written', value: 127483, emoji: '' },
  { label: 'Commits', value: 2847, emoji: '' },
  { label: 'PRs Merged', value: 312, emoji: '' },
  { label: 'Bugs Fixed', value: 1024, emoji: '🐛' },
]

const SERVICES = [
  { name: 'React', status: 'running', years: '5y', dot: '#22c55e' },
  { name: 'TypeScript', status: 'running', years: '4y', dot: '#22c55e' },
  { name: 'Node.js', status: 'running', years: '4y', dot: '#22c55e' },
  { name: 'PostgreSQL', status: 'running', years: '3y', dot: '#22c55e' },
  { name: 'Docker', status: 'learning', years: '', dot: '#eab308' },
  { name: 'Rust', status: 'exploring', years: '', dot: '#3b82f6' },
]

// Deterministic pseudo-random for heatmap
function seededRand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297
  return x - Math.floor(x)
}

const HEATMAP_COLORS = ['#0d1117', '#0e4429', '#006d32', '#26a641', '#39d353']

// ─── Sub-Components ──────────────────────────────────────────────────────────

function CountUp({ target, inView }: { target: number; inView: boolean }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 2000
    const step = Math.max(1, Math.floor(target / (duration / 16)))
    const id = setInterval(() => {
      start += step
      if (start >= target) { setVal(target); clearInterval(id) }
      else setVal(start)
    }, 16)
    return () => clearInterval(id)
  }, [inView, target])
  return <>{val.toLocaleString()}</>
}

// ─── Commit Line Chart ───────────────────────────────────────────────────────
function CommitChart({ inView }: { inView: boolean }) {
  const maxVal = Math.max(...COMMIT_DATA)
  const points = COMMIT_DATA.map((v, i) => {
    const x = (i / (COMMIT_DATA.length - 1)) * 380 + 10
    const y = 110 - (v / maxVal) * 90
    return `${x},${y}`
  }).join(' ')

  const areaPoints = `10,110 ${points} 390,110`

  return (
    <div className="bg-[#161b22] rounded-lg p-4 border border-slate-800/50 md:col-span-2 lg:col-span-2">
      <p className="text-xs text-slate-500 font-mono uppercase mb-3">Commits Over Time</p>
      <svg viewBox="0 0 400 130" className="w-full h-auto">
        <defs>
          <linearGradient id="commitGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#commitGrad)" />
        <polyline
          points={points}
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={inView ? 'animate-draw-line' : ''}
          style={{ strokeDasharray: 600, strokeDashoffset: inView ? 0 : 600, transition: 'stroke-dashoffset 2s ease-out' }}
        />
        {COMMIT_DATA.map((v, i) => {
          const x = (i / (COMMIT_DATA.length - 1)) * 380 + 10
          const y = 110 - (v / maxVal) * 90
          return <circle key={i} cx={x} cy={y} r="2.5" fill="#10b981" opacity={inView ? 1 : 0} style={{ transition: `opacity 0.3s ${i * 0.1}s` }} />
        })}
        {MONTHS.map((m, i) => (
          <text key={m} x={(i / 11) * 380 + 10} y="126" textAnchor="middle" className="text-[9px] fill-slate-600 font-mono">{m}</text>
        ))}
      </svg>
    </div>
  )
}

// ─── Gauge ───────────────────────────────────────────────────────────────────
function AvailabilityGauge({ inView }: { inView: boolean }) {
  const radius = 50
  const circumference = Math.PI * radius
  const offset = circumference - (0.95 * circumference)

  return (
    <div className="bg-[#161b22] rounded-lg p-4 border border-slate-800/50 flex flex-col items-center justify-center">
      <p className="text-xs text-slate-500 font-mono uppercase mb-3">Current Availability</p>
      <svg viewBox="0 0 120 75" className="w-32 h-auto">
        <path
          d="M 10 70 A 50 50 0 0 1 110 70"
          fill="none"
          stroke="#1e293b"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <motion.path
          d="M 10 70 A 50 50 0 0 1 110 70"
          fill="none"
          stroke="#10b981"
          strokeWidth="8"
          strokeLinecap="round"
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={inView ? { strokeDashoffset: offset } : {}}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <span className="text-2xl font-bold font-mono text-emerald-400 -mt-2">95%</span>
      <span className="text-xs text-emerald-400 font-mono mt-1">Open to projects</span>
    </div>
  )
}

// ─── Bar Chart ───────────────────────────────────────────────────────────────
function StackBars({ inView }: { inView: boolean }) {
  return (
    <div className="bg-[#161b22] rounded-lg p-4 border border-slate-800/50">
      <p className="text-xs text-slate-500 font-mono uppercase mb-3">Projects by Stack</p>
      <div className="space-y-3">
        {STACK_BARS.map((bar, i) => (
          <div key={bar.label}>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-400">{bar.label}</span>
              <span className="text-slate-500">{bar.pct}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: bar.color }}
                initial={{ width: 0 }}
                animate={inView ? { width: `${bar.pct}%` } : {}}
                transition={{ duration: 1, delay: i * 0.15, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Counter Cards ───────────────────────────────────────────────────────────
function MetricCounters({ inView }: { inView: boolean }) {
  return (
    <div className="bg-[#161b22] rounded-lg p-4 border border-slate-800/50 md:col-span-2 lg:col-span-3">
      <p className="text-xs text-slate-500 font-mono uppercase mb-3">Key Metrics</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {KEY_METRICS.map((m) => (
          <div key={m.label} className="bg-[#1c2128] rounded-lg p-4 text-center border border-slate-800/50">
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {m.emoji && <span className="mr-1">{m.emoji}</span>}
              <CountUp target={m.value} inView={inView} />
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-mono mt-1">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Service Status ──────────────────────────────────────────────────────────
function ServiceStatus() {
  return (
    <div className="bg-[#161b22] rounded-lg p-4 border border-slate-800/50">
      <p className="text-xs text-slate-500 font-mono uppercase mb-3">Service Status</p>
      <div className="space-y-0">
        {SERVICES.map((s) => (
          <div key={s.name} className="flex items-center gap-2 py-1.5 border-b border-slate-800/40 last:border-b-0">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.dot }} />
            <span className="text-sm font-mono text-slate-300 flex-1">{s.name}</span>
            <span className="text-[10px] font-mono text-slate-500 capitalize">
              {s.status === 'running' ? `🟢 Running (${s.years})` : s.status === 'learning' ? '🟡 Learning' : '🔵 Exploring'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Activity Heatmap ────────────────────────────────────────────────────────
function ActivityHeatmap({ inView }: { inView: boolean }) {
  const grid = Array.from({ length: 52 }, (_, col) =>
    Array.from({ length: 7 }, (_, row) => {
      const seed = col * 7 + row + 42
      const r = seededRand(seed)
      if (r < 0.3) return 0
      if (r < 0.55) return 1
      if (r < 0.75) return 2
      if (r < 0.9) return 3
      return 4
    })
  )

  return (
    <div className="bg-[#161b22] rounded-lg p-4 border border-slate-800/50 md:col-span-2 lg:col-span-2">
      <p className="text-xs text-slate-500 font-mono uppercase mb-3">Activity Heatmap (Last 52 Weeks)</p>
      <div className="overflow-x-auto">
        <div className="flex gap-[2px]" style={{ minWidth: '620px' }}>
          {grid.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-[2px]">
              {col.map((level, ri) => (
                <div
                  key={ri}
                  className="w-[10px] h-[10px] rounded-sm"
                  style={{
                    backgroundColor: HEATMAP_COLORS[level],
                    opacity: inView ? 1 : 0,
                    transition: `opacity 0.4s ${ci * 0.015}s ease-out`,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1 mt-3 justify-end">
        <span className="text-[9px] text-slate-600 font-mono mr-1">Less</span>
        {HEATMAP_COLORS.map((c, i) => (
          <div key={i} className="w-[10px] h-[10px] rounded-sm" style={{ backgroundColor: c }} />
        ))}
        <span className="text-[9px] text-slate-600 font-mono ml-1">More</span>
      </div>
    </div>
  )
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function GrafanaDashboard() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <div ref={ref} className="bg-[#0d1117] border border-slate-700/50 rounded-2xl p-6 font-mono">
      {/* Top bar */}
      <div className="bg-[#161b22] rounded-t-lg px-4 py-3 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-400">Live</span>
          </span>
          <span className="text-sm text-slate-400">leo-portfolio-dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500">Last 12 months ▾</span>
          <span className="text-xs text-slate-600">⟳ Auto-refresh</span>
        </div>
      </div>

      {/* Panels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <CommitChart inView={inView} />
        <AvailabilityGauge inView={inView} />
        <StackBars inView={inView} />
        <ServiceStatus />
        <MetricCounters inView={inView} />
        <ActivityHeatmap inView={inView} />
      </div>
    </div>
  )
}
