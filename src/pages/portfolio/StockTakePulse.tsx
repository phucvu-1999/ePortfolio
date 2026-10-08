// ─── Stock Take Pulse — Real-Time Inventory Scanning Dashboard ──────────────
// Animated visualization of a live stock-take operation: items are scanned one
// by one, counts tick up via NumberFlow, discrepancies flash, and batches
// reconcile to the server — all the things epos_stocktake does in real life.
import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import NumberFlow from '@number-flow/react'
import {
  ScanLine, PackageCheck, AlertTriangle, Activity, Play, Pause,
  Wifi, WifiOff, CheckCircle2, BarChart3,
} from 'lucide-react'

// ── Inline inventory data ───────────────────────────────────────────────────
interface InventoryItem {
  sku: string
  name: string
  expected: number
  actual: number
}

const INVENTORY: InventoryItem[] = [
  { sku: 'SKU-001', name: 'Premium Coffee Beans', expected: 48, actual: 48 },
  { sku: 'SKU-002', name: 'Organic Tea Bags', expected: 120, actual: 118 },
  { sku: 'SKU-003', name: 'Fresh Milk 1L', expected: 36, actual: 36 },
  { sku: 'SKU-004', name: 'Sugar 1kg', expected: 24, actual: 26 },
  { sku: 'SKU-005', name: 'Disposable Cups', expected: 500, actual: 500 },
  { sku: 'SKU-006', name: 'Napkins Pack', expected: 200, actual: 198 },
  { sku: 'SKU-007', name: 'Straw Bundle', expected: 300, actual: 300 },
  { sku: 'SKU-008', name: 'Plastic Bags M', expected: 150, actual: 150 },
  { sku: 'SKU-009', name: 'Receipt Paper', expected: 24, actual: 22 },
  { sku: 'SKU-010', name: 'Cleaning Spray', expected: 12, actual: 12 },
  { sku: 'SKU-011', name: 'Hand Sanitizer', expected: 18, actual: 18 },
  { sku: 'SKU-012', name: 'Tissue Box', expected: 30, actual: 28 },
]

const TECH_HIGHLIGHTS = [
  'Offline SQLite — scan without network, sync in batches',
  'Barcode scanning via Android camera API',
  'Batch reconciliation — conflicts resolved server-side',
  'Real-time discrepancy alerts to store manager',
  'epos_stocktake Android app — shared epos_client_lib core',
]

const TOTAL_BATCHES = 12

export default function StockTakePulse() {
  // How many items have been "scanned" so far (0..12)
  const [scannedCount, setScannedCount] = useState(0)
  // Current displayed count for the item being scanned (animates up)
  const [currentCount, setCurrentCount] = useState(0)
  const [running, setRunning] = useState(true)
  const [batchesDone, setBatchesDone] = useState(0)
  const timerRef = useRef<number | null>(null)
  const countTimerRef = useRef<number | null>(null)

  const discrepancies = INVENTORY.slice(0, scannedCount).filter(
    (item) => item.expected !== item.actual,
  ).length

  const accuracy =
    scannedCount === 0
      ? 100
      : Math.round(((scannedCount - discrepancies) / scannedCount) * 100 * 10) / 10

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (countTimerRef.current) clearTimeout(countTimerRef.current)
    }
  }, [])

  // Main scan loop
  const tick = useCallback(() => {
    setScannedCount((prev) => {
      if (prev >= INVENTORY.length) return prev
      const nextIdx = prev
      const item = INVENTORY[nextIdx]
      // Animate counting up for the new item
      setCurrentCount(0)
      const steps = 5
      const target = item.actual
      let step = 0
      const countUp = () => {
        step++
        setCurrentCount(Math.round((step / steps) * target))
        if (step < steps) {
          countTimerRef.current = window.setTimeout(countUp, 200)
        }
      }
      countTimerRef.current = window.setTimeout(countUp, 100)

      // Advance batches
      if ((nextIdx + 1) % 3 === 0) {
        setBatchesDone((b) => Math.min(b + 1, TOTAL_BATCHES))
      }
      return prev + 1
    })
  }, [])

  useEffect(() => {
    if (running && scannedCount < INVENTORY.length) {
      timerRef.current = window.setInterval(tick, 1500)
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [running, scannedCount, tick])

  const handleToggle = () => {
    if (scannedCount >= INVENTORY.length) {
      // Reset
      setScannedCount(0)
      setCurrentCount(0)
      setBatchesDone(0)
      setRunning(true)
    } else {
      setRunning((r) => !r)
    }
  }

  const allDone = scannedCount >= INVENTORY.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="space-y-4"
    >
      {/* ══ Top stats bar ══ */}
      <div className="rounded-2xl border border-slate-700/60 overflow-hidden" style={{ background: '#0d1117' }}>
        <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-slate-700/50" style={{ background: '#161b22' }}>
          <div className="flex items-center gap-2 min-w-0">
            <ScanLine size={14} className="text-lime-400 shrink-0" />
            <span className="font-mono text-xs text-slate-400 uppercase tracking-widest truncate">Stock Take — Live Pulse</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] text-slate-600">
              <span className={`w-1.5 h-1.5 rounded-full ${running && !allDone ? 'bg-lime-400 animate-pulse' : allDone ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              {allDone ? 'COMPLETE' : running ? 'SCANNING' : 'PAUSED'}
            </span>
            <button
              onClick={handleToggle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[11px] font-semibold border transition-all cursor-pointer"
              style={
                allDone
                  ? { borderColor: '#84cc1660', color: '#84cc16', background: '#84cc1612' }
                  : running
                    ? { borderColor: '#f59e0b60', color: '#f59e0b', background: '#f59e0b12' }
                    : { borderColor: '#84cc1660', color: '#84cc16', background: '#84cc1612' }
              }
              aria-label={allDone ? 'Restart scan' : running ? 'Pause scan' : 'Start scan'}
            >
              {allDone ? (
                <><ScanLine size={12} /> Restart</>
              ) : running ? (
                <><Pause size={12} /> Pause</>
              ) : (
                <><Play size={12} /> Start Scan</>
              )}
            </button>
          </div>
        </div>

        {/* Stat chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4">
          {[
            { label: 'Items Scanned', value: scannedCount, total: INVENTORY.length, color: '#84cc16', icon: PackageCheck },
            { label: 'Discrepancies', value: discrepancies, total: null, color: '#f59e0b', icon: AlertTriangle },
            { label: 'Accuracy', value: accuracy, total: null, color: '#10b981', icon: BarChart3, suffix: '%' },
            { label: 'Batches Done', value: batchesDone, total: TOTAL_BATCHES, color: '#3b82f6', icon: Activity },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-700/50 bg-slate-900/40 px-3.5 py-3 flex items-center gap-3">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
                style={{ color: s.color, background: `${s.color}12`, border: `1px solid ${s.color}30` }}
              >
                <s.icon size={15} />
              </span>
              <div className="min-w-0">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-xl font-bold leading-none" style={{ color: s.color }}>
                    <NumberFlow value={s.value} />
                  </span>
                  {s.suffix && <span className="font-mono text-xs" style={{ color: s.color }}>{s.suffix}</span>}
                  {s.total !== null && (
                    <span className="font-mono text-[10px] text-slate-600">/ {s.total}</span>
                  )}
                </div>
                <p className="font-mono text-[9px] text-slate-500 uppercase tracking-wider mt-1 leading-tight">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ Main scan grid ══ */}
      <div className="rounded-2xl border border-slate-700/60 overflow-hidden" style={{ background: '#0d1117' }}>
        <div className="px-5 py-3 border-b border-slate-700/50 flex items-center justify-between" style={{ background: '#161b22' }}>
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Inventory Items</span>
          <span className="font-mono text-[10px] text-slate-600">
            {scannedCount}/{INVENTORY.length} scanned
          </span>
        </div>

        {/* Header row */}
        <div className="hidden sm:grid grid-cols-[100px_1fr_80px_80px_90px] gap-2 px-5 py-2 border-b border-slate-700/40 font-mono text-[9px] text-slate-600 uppercase tracking-widest">
          <span>SKU</span>
          <span>Product</span>
          <span className="text-right">Expected</span>
          <span className="text-right">Actual</span>
          <span className="text-right">Status</span>
        </div>

        {/* Item rows */}
        <div className="divide-y divide-slate-700/30 max-h-[420px] overflow-y-auto">
          {INVENTORY.map((item, idx) => {
            const scanned = idx < scannedCount
            const scanning = idx === scannedCount - 1 && !allDone
            const isMatch = item.expected === item.actual
            const diff = item.actual - item.expected
            const displayActual = scanning ? currentCount : scanned ? item.actual : 0

            return (
              <motion.div
                key={item.sku}
                initial={{ opacity: 0.3 }}
                animate={{
                  opacity: scanned ? 1 : 0.35,
                  backgroundColor: scanning
                    ? 'rgba(132,204,22,0.06)'
                    : scanned && !isMatch
                      ? 'rgba(245,158,11,0.05)'
                      : 'transparent',
                }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-2 sm:grid-cols-[100px_1fr_80px_80px_90px] gap-x-2 gap-y-1 px-5 py-2.5 items-center"
              >
                {/* SKU */}
                <span className="font-mono text-[11px] text-slate-500 tabular-nums">{item.sku}</span>
                {/* Name */}
                <span className={`text-[12.5px] ${scanned ? 'text-slate-200' : 'text-slate-600'} truncate`}>
                  {item.name}
                  {scanning && (
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="inline-block ml-2 font-mono text-[10px] text-lime-400"
                    >
                      scanning…
                    </motion.span>
                  )}
                </span>
                {/* Expected */}
                <span className="font-mono text-[12px] text-slate-500 text-right tabular-nums">
                  <span className="sm:hidden text-[9px] text-slate-600 mr-1">exp:</span>
                  {item.expected}
                </span>
                {/* Actual */}
                <span className={`font-mono text-[12px] text-right tabular-nums ${
                  !scanned ? 'text-slate-700' : isMatch ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  <span className="sm:hidden text-[9px] text-slate-600 mr-1">act:</span>
                  {scanned ? (
                    scanning ? <NumberFlow value={displayActual} /> : displayActual
                  ) : (
                    '—'
                  )}
                </span>
                {/* Status */}
                <div className="text-right col-span-2 sm:col-span-1">
                  <AnimatePresence mode="wait">
                    {scanned && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[9px] font-semibold border ${
                          isMatch
                            ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                            : 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                        }`}
                      >
                        {isMatch ? (
                          <><CheckCircle2 size={10} /> Match</>
                        ) : (
                          <><AlertTriangle size={10} /> {diff > 0 ? '+' : ''}{diff}</>
                        )}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* ══ Bottom panel — reconciliation + tech highlights ══ */}
      <div className="grid md:grid-cols-[1fr_1fr] gap-4">
        {/* Reconciliation panel */}
        <div className="rounded-2xl border border-slate-700/60 p-5" style={{ background: '#0d1117' }}>
          <div className="flex items-center gap-2 mb-4">
            {batchesDone < TOTAL_BATCHES ? (
              <WifiOff size={13} className="text-amber-400" />
            ) : (
              <Wifi size={13} className="text-emerald-400" />
            )}
            <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
              Batch Reconciliation
            </span>
          </div>

          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex justify-between font-mono text-[10px] mb-1.5">
              <span className="text-slate-500">Syncing to server…</span>
              <span className={batchesDone >= TOTAL_BATCHES ? 'text-emerald-400' : 'text-lime-400'}>
                {batchesDone}/{TOTAL_BATCHES} batches reconciled
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-700/50 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: batchesDone >= TOTAL_BATCHES ? '#10b981' : '#84cc16' }}
                animate={{ width: `${(batchesDone / TOTAL_BATCHES) * 100}%` }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              />
            </div>
          </div>

          {/* Batch dots */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {Array.from({ length: TOTAL_BATCHES }).map((_, i) => (
              <motion.span
                key={i}
                animate={{
                  backgroundColor: i < batchesDone ? '#10b981' : '#334155',
                  scale: i === batchesDone - 1 ? [1, 1.3, 1] : 1,
                }}
                transition={{ duration: 0.3 }}
                className="w-4 h-4 rounded-md flex items-center justify-center font-mono text-[8px] text-slate-900 font-bold"
              >
                {i < batchesDone ? '✓' : ''}
              </motion.span>
            ))}
          </div>

          <AnimatePresence>
            {allDone && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2.5 font-mono text-[11px] text-emerald-400 leading-relaxed"
              >
                ✓ Stock take complete — {discrepancies} discrepancies flagged for manager review. Data synced to server.
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tech highlights */}
        <div className="rounded-2xl border border-slate-700/60 p-5" style={{ background: '#0d1117' }}>
          <div className="flex items-center gap-2 mb-4">
            <Activity size={13} className="text-lime-400" />
            <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
              Technical Highlights
            </span>
          </div>
          <div className="space-y-2">
            {TECH_HIGHLIGHTS.map((h, i) => (
              <motion.div
                key={h}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-2.5 font-mono text-[11px] text-slate-400 leading-relaxed"
              >
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-lime-400 shrink-0" />
                {h}
              </motion.div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border-l-2 border-lime-400/50 bg-lime-400/5 px-3 py-2.5">
            <p className="font-mono text-[10.5px] text-slate-500 leading-relaxed">
              The same <span className="text-lime-400 font-semibold">epos_client_lib</span> core powers both the POS register and the Android stock-take app — shared business logic, separate shells.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
