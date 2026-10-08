import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'

// ─── Data ────────────────────────────────────────────────────────────────────
const TRANSACTION_VOLUME = [12, 28, 45, 82, 156, 178, 142, 98, 67, 89, 134, 168, 112, 45]
const HOURS = ['8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm']

const PAYMENT_MIX = [
  { label: 'NETS Terminal', pct: 34, color: '#3b82f6' },
  { label: 'NETS QR', pct: 22, color: '#10b981' },
  { label: 'Cash', pct: 18, color: '#f59e0b' },
  { label: 'Credit Card', pct: 12, color: '#8b5cf6' },
  { label: 'GrabPay', pct: 6, color: '#ec4899' },
  { label: 'PayNow', pct: 5, color: '#06b6d4' },
  { label: 'Others', pct: 3, color: '#64748b' },
]

const KEY_METRICS = [
  { label: 'Transactions Today', value: 1247, color: '#10b981', prefix: '', suffix: '', decimals: 0 },
  { label: 'Revenue', value: 18420, color: '#3b82f6', prefix: '$', suffix: '', decimals: 0 },
  { label: 'Uptime', value: 99.97, color: '#8b5cf6', prefix: '', suffix: '%', decimals: 2 },
  { label: 'Avg Latency', value: 14, color: '#f59e0b', prefix: '', suffix: 'ms', decimals: 0 },
]

const ACTIVE_SERVICES = [
  { name: 'POS Terminal (×8)', status: 'running', dot: '#22c55e' },
  { name: 'Kiosk (×3)', status: 'running', dot: '#22c55e' },
  { name: 'Kitchen Display (×2)', status: 'running', dot: '#22c55e' },
  { name: 'Core Service', status: 'running', dot: '#22c55e' },
  { name: 'NETS Gateway', status: 'running', dot: '#22c55e' },
  { name: 'Telemetry Pipeline', status: 'running', dot: '#22c55e' },
  { name: 'Stock Take', status: 'idle', dot: '#eab308' },
  { name: 'Backup Sync', status: 'scheduled', dot: '#3b82f6' },
]

const LATENCY_PERCENTILES = [
  { label: 'p50', value: 8, maxVal: 50, color: '#10b981' },
  { label: 'p90', value: 14, maxVal: 50, color: '#3b82f6' },
  { label: 'p95', value: 22, maxVal: 50, color: '#f59e0b' },
  { label: 'p99', value: 45, maxVal: 50, color: '#ef4444' },
]

// Deterministic pseudo-random for heatmap
function seededRand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297
  return x - Math.floor(x)
}

const HEATMAP_COLORS = ['#0d1117', '#0e4429', '#006d32', '#26a641', '#39d353']

// ─── Sub-Components ──────────────────────────────────────────────────────────

function CountUp({ target, inView, decimals = 0 }: { target: number; inView: boolean; decimals?: number }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!inView) return
    let start = 0
    const scaledTarget = Math.round(target * Math.pow(10, decimals))
    const duration = 2000
    const step = Math.max(1, Math.floor(scaledTarget / (duration / 16)))
    const id = setInterval(() => {
      start += step
      if (start >= scaledTarget) { setVal(scaledTarget); clearInterval(id) }
      else setVal(start)
    }, 16)
    return () => clearInterval(id)
  }, [inView, target, decimals])
  const display = decimals > 0
    ? (val / Math.pow(10, decimals)).toFixed(decimals)
    : val.toLocaleString()
  return <>{display}</>
}

// ─── Transaction Volume Chart ────────────────────────────────────────────────
function TransactionChart({ inView }: { inView: boolean }) {
  const maxVal = Math.max(...TRANSACTION_VOLUME)
  const points = TRANSACTION_VOLUME.map((v, i) => {
    const x = (i / (TRANSACTION_VOLUME.length - 1)) * 380 + 10
    const y = 110 - (v / maxVal) * 90
    return `${x},${y}`
  }).join(' ')

  const areaPoints = `10,110 ${points} 390,110`

  return (
    <div className="bg-[#161b22] rounded-lg p-4 border border-slate-800/50 md:col-span-2 lg:col-span-2">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-slate-500 font-mono uppercase">Transactions / Hour</p>
        <span className="text-[10px] font-mono text-emerald-400/70">Peak: 178 txn/hr</span>
      </div>
      <svg viewBox="0 0 400 130" className="w-full h-auto">
        <defs>
          <linearGradient id="txnGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#txnGrad)" />
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
        {TRANSACTION_VOLUME.map((v, i) => {
          const x = (i / (TRANSACTION_VOLUME.length - 1)) * 380 + 10
          const y = 110 - (v / maxVal) * 90
          return <circle key={i} cx={x} cy={y} r="2.5" fill="#10b981" opacity={inView ? 1 : 0} style={{ transition: `opacity 0.3s ${i * 0.1}s` }} />
        })}
        {HOURS.map((h, i) => (
          <text key={h} x={(i / (HOURS.length - 1)) * 380 + 10} y="126" textAnchor="middle" className="text-[9px] fill-slate-600 font-mono">{h}</text>
        ))}
      </svg>
    </div>
  )
}

// ─── Latency Percentiles ─────────────────────────────────────────────────────
function LatencyPanel({ inView }: { inView: boolean }) {
  return (
    <div className="bg-[#161b22] rounded-lg p-4 border border-slate-800/50 flex flex-col">
      <p className="text-xs text-slate-500 font-mono uppercase mb-3">Latency Percentiles</p>
      <div className="space-y-3 flex-1 flex flex-col justify-center">
        {LATENCY_PERCENTILES.map((p, i) => (
          <div key={p.label}>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-400">{p.label}</span>
              <span className="text-slate-500">{p.value}ms</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: p.color }}
                initial={{ width: 0 }}
                animate={inView ? { width: `${(p.value / p.maxVal) * 100}%` } : {}}
                transition={{ duration: 1, delay: i * 0.15, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Payment Method Mix ──────────────────────────────────────────────────────
function PaymentMixBars({ inView }: { inView: boolean }) {
  return (
    <div className="bg-[#161b22] rounded-lg p-4 border border-slate-800/50">
      <p className="text-xs text-slate-500 font-mono uppercase mb-3">Payment Method Mix</p>
      <div className="space-y-2.5">
        {PAYMENT_MIX.map((bar, i) => (
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
                transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
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
      <p className="text-xs text-slate-500 font-mono uppercase mb-3">Live Metrics</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {KEY_METRICS.map((m) => (
          <div key={m.label} className="bg-[#1c2128] rounded-lg p-4 text-center border border-slate-800/50">
            <div className="text-2xl font-bold font-mono" style={{ color: m.color }}>
              {m.prefix}<CountUp target={m.value} inView={inView} decimals={m.decimals} />{m.suffix}
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
      <p className="text-xs text-slate-500 font-mono uppercase mb-3">Active Services</p>
      <div className="space-y-0">
        {ACTIVE_SERVICES.map((s) => (
          <div key={s.name} className="flex items-center gap-2 py-1.5 border-b border-slate-800/40 last:border-b-0">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.dot }} />
            <span className="text-sm font-mono text-slate-300 flex-1">{s.name}</span>
            <span className="text-[10px] font-mono text-slate-500 capitalize">
              {s.status === 'running' ? '🟢 Running' : s.status === 'idle' ? '🟡 Idle' : '🔵 Scheduled'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Terminal Activity Heatmap ───────────────────────────────────────────────
const HEATMAP_HOUR_LABELS = ['8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p']
const HEATMAP_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function TerminalHeatmap({ inView }: { inView: boolean }) {
  const grid = HEATMAP_DAYS.map((_, row) =>
    HEATMAP_HOUR_LABELS.map((_, col) => {
      const seed = row * 14 + col + 42
      const r = seededRand(seed)
      const isWeekend = row >= 5
      if (isWeekend) {
        if (r < 0.5) return 0
        if (r < 0.75) return 1
        if (r < 0.9) return 2
        return 3
      }
      const isLunchPeak = col >= 3 && col <= 5
      if (isLunchPeak) {
        if (r < 0.1) return 2
        if (r < 0.35) return 3
        return 4
      }
      if (r < 0.25) return 0
      if (r < 0.5) return 1
      if (r < 0.75) return 2
      if (r < 0.9) return 3
      return 4
    })
  )

  return (
    <div className="bg-[#161b22] rounded-lg p-4 border border-slate-800/50 md:col-span-2 lg:col-span-2">
      <p className="text-xs text-slate-500 font-mono uppercase mb-3">Terminal Activity (7 Days)</p>
      <div className="overflow-x-auto">
        <div className="flex flex-col gap-[3px]" style={{ minWidth: '400px' }}>
          {grid.map((row, ri) => (
            <div key={ri} className="flex items-center gap-[3px]">
              <span className="text-[9px] font-mono text-slate-600 w-7 text-right mr-1">{HEATMAP_DAYS[ri]}</span>
              {row.map((level, ci) => (
                <div
                  key={ci}
                  className="w-[22px] h-[14px] rounded-sm"
                  style={{
                    backgroundColor: HEATMAP_COLORS[level],
                    opacity: inView ? 1 : 0,
                    transition: `opacity 0.4s ${(ri * 14 + ci) * 0.02}s ease-out`,
                  }}
                />
              ))}
            </div>
          ))}
          <div className="flex items-center gap-[3px] mt-1">
            <span className="w-7 mr-1" />
            {HEATMAP_HOUR_LABELS.map((h) => (
              <span key={h} className="text-[8px] font-mono text-slate-600 w-[22px] text-center">{h}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 mt-3 justify-end">
        <span className="text-[9px] text-slate-600 font-mono mr-1">Low</span>
        {HEATMAP_COLORS.map((c, i) => (
          <div key={i} className="w-[10px] h-[10px] rounded-sm" style={{ backgroundColor: c }} />
        ))}
        <span className="text-[9px] text-slate-600 font-mono ml-1">High</span>
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
          <span className="text-sm text-slate-400">EPOS V5 · POS Cluster · Singapore</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500">Today ▾</span>
          <span className="text-xs text-slate-600">UTC+8 · ⟳ 10s</span>
        </div>
      </div>

      {/* Panels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <TransactionChart inView={inView} />
        <LatencyPanel inView={inView} />
        <PaymentMixBars inView={inView} />
        <ServiceStatus />
        <MetricCounters inView={inView} />
        <TerminalHeatmap inView={inView} />
      </div>
    </div>
  )
}
