// ─── Kitchen Display Stream — Live KDS Order Board ──────────────────────────
// Real-time kitchen display system: order tickets flow in, get bumped through
// cooking stations (New → In Progress → Ready), then auto-clear. Visitors can
// interact by clicking Bump. Demonstrates the gRPC streaming architecture
// behind V5 POS kitchen operations.
import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChefHat, Flame, PackageCheck, Clock, Zap, ArrowRight,
  Wifi, Bell, Monitor,
} from 'lucide-react'

// ── Types ───────────────────────────────────────────────────────────────────
type OrderSource = 'POS' | 'Kiosk' | 'Foodpanda' | 'Hawk'
type OrderStage = 'new' | 'in_progress' | 'ready'

interface OrderItem {
  qty: number
  name: string
}

interface KdsOrder {
  id: string
  items: OrderItem[]
  source: OrderSource
  /** When this order entered the board (epoch ms) */
  createdAt: number
  stage: OrderStage
  /** epoch ms when order entered ready state */
  readyAt?: number
}

// ── Source badge colours ────────────────────────────────────────────────────
const SOURCE_STYLE: Record<OrderSource, { bg: string; border: string; text: string }> = {
  POS:       { bg: '#3b82f610', border: '#3b82f650', text: '#60a5fa' },
  Kiosk:     { bg: '#10b98110', border: '#10b98150', text: '#34d399' },
  Foodpanda: { bg: '#ec489910', border: '#ec489950', text: '#f472b6' },
  Hawk:      { bg: '#f9731610', border: '#f9731650', text: '#fb923c' },
}

const STAGE_META: Record<OrderStage, { label: string; color: string; icon: typeof ChefHat }> = {
  new:         { label: 'NEW',         color: '#3b82f6', icon: Bell },
  in_progress: { label: 'IN PROGRESS', color: '#f59e0b', icon: Flame },
  ready:       { label: 'READY',       color: '#10b981', icon: PackageCheck },
}

// ── Menu pool for random order generation ───────────────────────────────────
const MENU_POOL = [
  'Chicken Rice', 'Nasi Lemak', 'Roti Prata Set', 'Laksa', 'Milo Dinosaur',
  'Teh Tarik', 'Iced Tea', 'Barley', 'Kaya Toast Set', 'Wonton Noodles',
  'Char Kway Teow', 'Fish Ball Soup', 'Satay (6pc)', 'Fried Carrot Cake',
]
const SOURCES: OrderSource[] = ['POS', 'Kiosk', 'Foodpanda', 'Hawk']

let orderSeq = 45 // start after initial orders

function randomItems(): OrderItem[] {
  const count = 1 + Math.floor(Math.random() * 3)
  const picked = new Set<string>()
  const items: OrderItem[] = []
  while (items.length < count) {
    const name = MENU_POOL[Math.floor(Math.random() * MENU_POOL.length)]
    if (picked.has(name)) continue
    picked.add(name)
    items.push({ qty: 1 + Math.floor(Math.random() * 3), name })
  }
  return items
}

function makeOrder(id: string, items: OrderItem[], source: OrderSource, elapsedSec: number): KdsOrder {
  return { id, items, source, createdAt: Date.now() - elapsedSec * 1000, stage: 'new' }
}

const TECH_HIGHLIGHTS = [
  'gRPC StreamServiceImpl — server-push, no polling',
  'Real-time KDS updates via bidirectional streaming',
  'Third-party integration: Foodpanda + Hawk orders auto-route to kitchen',
  'HMAC-SHA256 webhook verification for external orders',
  'Multi-station routing — items go to the right prep station',
]

// ── Elapsed timer display ───────────────────────────────────────────────────
function Elapsed({ createdAt }: { createdAt: number }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const sec = Math.max(0, Math.floor((now - createdAt) / 1000))
  const m = Math.floor(sec / 60)
  const s = sec % 60
  const urgent = m >= 10
  const warn = m >= 5 && !urgent
  return (
    <span className={`font-mono text-[11px] tabular-nums ${urgent ? 'text-red-400' : warn ? 'text-amber-400' : 'text-slate-500'}`}>
      <Clock size={10} className="inline -mt-0.5 mr-1" />
      {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </span>
  )
}

// ── Order ticket card ───────────────────────────────────────────────────────
function Ticket({
  order,
  onBump,
}: {
  order: KdsOrder
  onBump: (id: string) => void
}) {
  const stage = STAGE_META[order.stage]
  const src = SOURCE_STYLE[order.source]
  const nextStage = order.stage === 'new' ? 'in_progress' : order.stage === 'in_progress' ? 'ready' : null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, x: 40 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="rounded-xl border p-3.5"
      style={{ borderColor: `${stage.color}35`, background: `${stage.color}08` }}
    >
      {/* Header: order id + source badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-mono text-[12px] font-bold text-slate-200">{order.id}</span>
        <span
          className="px-2 py-0.5 rounded-full font-mono text-[9px] font-semibold border"
          style={{ background: src.bg, borderColor: src.border, color: src.text }}
        >
          {order.source}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-0.5 mb-2.5">
        {order.items.map((it, i) => (
          <p key={i} className="font-mono text-[11px] text-slate-400">
            {it.qty}× {it.name}
          </p>
        ))}
      </div>

      {/* Footer: timer + bump button */}
      <div className="flex items-center justify-between gap-2">
        <Elapsed createdAt={order.createdAt} />
        {nextStage && (
          <button
            onClick={() => onBump(order.id)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono text-[10px] font-semibold border transition-all cursor-pointer hover:-translate-y-0.5"
            style={{
              borderColor: `${STAGE_META[nextStage].color}50`,
              color: STAGE_META[nextStage].color,
              background: `${STAGE_META[nextStage].color}12`,
            }}
            aria-label={`Bump order ${order.id} to ${STAGE_META[nextStage].label}`}
          >
            Bump <ArrowRight size={10} />
          </button>
        )}
        {order.stage === 'ready' && (
          <span className="font-mono text-[10px] text-emerald-400 animate-pulse">serving…</span>
        )}
      </div>
    </motion.div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────
export default function KitchenDisplayStream() {
  const [orders, setOrders] = useState<KdsOrder[]>(() => [
    makeOrder('#K042', [{ qty: 1, name: 'Chicken Rice' }, { qty: 1, name: 'Iced Tea' }], 'POS', 150),
    makeOrder('#K043', [{ qty: 2, name: 'Nasi Lemak' }, { qty: 1, name: 'Teh Tarik' }], 'Kiosk', 105),
    makeOrder('#K044', [{ qty: 1, name: 'Roti Prata Set' }, { qty: 1, name: 'Milo Dinosaur' }], 'Foodpanda', 250),
    makeOrder('#F001', [{ qty: 3, name: 'Laksa' }, { qty: 2, name: 'Barley' }], 'Hawk', 30),
  ])
  const [bellPulse, setBellPulse] = useState(false)
  const autoAddRef = useRef<number | null>(null)
  const autoServeRef = useRef<number | null>(null)

  // Auto-add new orders every 3-4s
  useEffect(() => {
    const add = () => {
      const src = SOURCES[Math.floor(Math.random() * SOURCES.length)]
      const prefix = src === 'Foodpanda' || src === 'Hawk' ? '#F' : '#K'
      const id = `${prefix}${String(orderSeq++).padStart(3, '0')}`
      const newOrder = makeOrder(id, randomItems(), src, 0)
      setOrders((prev) => [...prev, newOrder])
      // Bell animation
      setBellPulse(true)
      setTimeout(() => setBellPulse(false), 600)
      // Schedule next
      autoAddRef.current = window.setTimeout(add, 3000 + Math.random() * 2000)
    }
    autoAddRef.current = window.setTimeout(add, 3500)
    return () => { if (autoAddRef.current) clearTimeout(autoAddRef.current) }
  }, [])

  // Auto-serve: remove ready orders after 5s
  useEffect(() => {
    const check = () => {
      const now = Date.now()
      setOrders((prev) => prev.filter((o) => !(o.stage === 'ready' && o.readyAt && now - o.readyAt > 5000)))
    }
    autoServeRef.current = window.setInterval(check, 1000)
    return () => { if (autoServeRef.current) clearInterval(autoServeRef.current) }
  }, [])

  const bump = useCallback((id: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o
        if (o.stage === 'new') return { ...o, stage: 'in_progress' as const }
        if (o.stage === 'in_progress') return { ...o, stage: 'ready' as const, readyAt: Date.now() }
        return o
      }),
    )
  }, [])

  const newOrders = orders.filter((o) => o.stage === 'new')
  const inProgress = orders.filter((o) => o.stage === 'in_progress')
  const ready = orders.filter((o) => o.stage === 'ready')

  const columns: { stage: OrderStage; items: KdsOrder[] }[] = [
    { stage: 'new', items: newOrders },
    { stage: 'in_progress', items: inProgress },
    { stage: 'ready', items: ready },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="space-y-4"
    >
      {/* ══ Connection status bar ══ */}
      <div className="rounded-2xl border border-slate-700/60 overflow-hidden" style={{ background: '#0d1117' }}>
        <div className="flex items-center justify-between gap-4 px-5 py-3.5" style={{ background: '#161b22' }}>
          <div className="flex items-center gap-3 min-w-0">
            <Monitor size={14} className="text-blue-400 shrink-0" />
            <span className="font-mono text-xs text-slate-400 uppercase tracking-widest truncate">Kitchen Display System</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Bell animation */}
            <motion.span
              animate={bellPulse ? { scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] } : {}}
              transition={{ duration: 0.5 }}
            >
              <Bell size={14} className={bellPulse ? 'text-amber-400' : 'text-slate-600'} />
            </motion.span>
            {/* gRPC indicator */}
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400">
              <Wifi size={11} />
              <span className="hidden sm:inline">gRPC Stream:</span>
              <span className="flex items-center gap-1">
                Connected
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </span>
            </span>
            {/* Order count */}
            <span className="hidden sm:block font-mono text-[10px] text-slate-600">
              {orders.length} active orders
            </span>
          </div>
        </div>
      </div>

      {/* ══ KDS Board — 3 columns ══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map(({ stage, items }) => {
          const meta = STAGE_META[stage]
          return (
            <div
              key={stage}
              className="rounded-2xl border border-slate-700/60 overflow-hidden flex flex-col"
              style={{ background: '#0d1117' }}
            >
              {/* Column header */}
              <div
                className="flex items-center justify-between gap-2 px-4 py-3 border-b"
                style={{ background: `${meta.color}0a`, borderColor: `${meta.color}25` }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-lg"
                    style={{ color: meta.color, background: `${meta.color}15`, border: `1px solid ${meta.color}35` }}
                  >
                    <meta.icon size={14} />
                  </span>
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-widest" style={{ color: meta.color }}>
                    {meta.label}
                  </span>
                </div>
                <span
                  className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 font-mono text-[10px] font-bold"
                  style={{ background: `${meta.color}20`, color: meta.color }}
                >
                  {items.length}
                </span>
              </div>

              {/* Tickets */}
              <div className="p-3 space-y-3 flex-1 min-h-[180px] max-h-[460px] overflow-y-auto">
                <AnimatePresence mode="popLayout">
                  {items.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-8 text-center"
                    >
                      <meta.icon size={20} className="text-slate-700 mb-2" />
                      <p className="font-mono text-[10px] text-slate-600">
                        {stage === 'new' ? 'Waiting for orders…' : stage === 'in_progress' ? 'No items cooking' : 'No orders ready'}
                      </p>
                    </motion.div>
                  )}
                  {items.map((order) => (
                    <Ticket key={order.id} order={order} onBump={bump} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )
        })}
      </div>

      {/* ══ Tech highlights strip ══ */}
      <div className="rounded-2xl border border-slate-700/60 p-5" style={{ background: '#0d1117' }}>
        <div className="flex items-center gap-2 mb-4">
          <Zap size={13} className="text-blue-400" />
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
            Streaming Architecture
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {TECH_HIGHLIGHTS.map((h, i) => (
            <motion.span
              key={h}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="px-3 py-1.5 rounded-lg font-mono text-[10.5px] text-slate-400 border border-slate-700/50 bg-slate-900/40"
            >
              {h}
            </motion.span>
          ))}
        </div>
        <div className="mt-4 rounded-lg border-l-2 border-blue-400/50 bg-blue-400/5 px-3 py-2.5">
          <p className="font-mono text-[10.5px] text-slate-500 leading-relaxed">
            Orders land via <span className="text-blue-400 font-semibold">gRPC server-push</span> streaming — the kitchen display never polls. External orders from Foodpanda and Hawk are verified with <span className="text-blue-400 font-semibold">HMAC-SHA256</span> before routing to the correct prep station.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
