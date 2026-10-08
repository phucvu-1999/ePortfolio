// ─── Offline Sync Replay — The Resilience Story ─────────────────────────────
// Animated visualization of V5 POS offline-first sync architecture:
// terminal goes offline → sales queue in SQLite → network returns →
// delta sync via gRPC → conflict resolution → zero data loss.
import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Monitor, Server, Wifi, WifiOff, Database, Play, Pause,
  RotateCcw, Check, AlertTriangle, Gauge,
} from 'lucide-react'

/* ── Phase definitions ────────────────────────────────────────────────────── */
interface Phase {
  id: string
  title: string
  duration: number          // seconds at 1× speed
  status: string
  color: string
}

const PHASES: Phase[] = [
  { id: 'online',       title: 'Online — Normal Operations',  duration: 3, status: 'Connected · gRPC active',                                color: '#10b981' },
  { id: 'drop',         title: 'Network Drops',               duration: 2, status: 'Connection lost · switching to offline mode',              color: '#ef4444' },
  { id: 'offline',      title: 'Offline — SQLite Takes Over',  duration: 5, status: 'Offline · {n} sales queued in SQLite · zero interruption', color: '#f59e0b' },
  { id: 'reconnect',    title: 'Network Returns',             duration: 2, status: 'Network restored · initiating sync...',                    color: '#3b82f6' },
  { id: 'sync',         title: 'Delta Sync & Reconciliation', duration: 4, status: 'Syncing... 3 records · delta-based · Hangfire job',        color: '#8b5cf6' },
  { id: 'done',         title: 'Fully Synchronized',          duration: 3, status: 'Fully synchronized · data integrity verified',             color: '#10b981' },
]

/* ── Queue item ───────────────────────────────────────────────────────────── */
interface QueueItem {
  id: string
  orderId: string
  amount: string
  status: 'queued' | 'syncing' | 'conflict' | 'synced'
}

const QUEUE_ITEMS: QueueItem[] = [
  { id: 'q1', orderId: '#4823', amount: '$42.80',  status: 'queued' },
  { id: 'q2', orderId: '#4824', amount: '$18.50',  status: 'queued' },
  { id: 'q3', orderId: '#4825', amount: '$67.10',  status: 'queued' },
]

const CALLOUTS = [
  'SQLite local DB via EF Core — instant writes, no network needed',
  'Hangfire background jobs (Windows) / Quartz.NET (mobile)',
  'Delta-based sync — only changed records, 90% less bandwidth',
  'Sync queue persists across app crashes and restarts',
  'Auto-conflict resolution — last-write-wins with audit log',
]

/* ── Animated flowing dots on SVG connection ─────────────────────────────── */
function FlowingDots({ color, reverse = false }: { color: string; reverse?: boolean }) {
  return (
    <>
      {[0, 1, 2].map(i => (
        <motion.circle
          key={i}
          r={3}
          fill={color}
          initial={{ opacity: 0 }}
          animate={{
            cx: reverse ? [280, 140, 0] : [0, 140, 280],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.6,
            delay: i * 0.5,
            repeat: Infinity,
            ease: 'linear',
          }}
          cy={6}
        />
      ))}
    </>
  )
}

/* ── Connection line SVG (horizontal) ────────────────────────────────────── */
function ConnectionLine({
  phase,
}: {
  phase: string
}) {
  const isOnline   = phase === 'online' || phase === 'done'
  const isDrop     = phase === 'drop'
  const isOffline  = phase === 'offline'
  const isSync     = phase === 'sync'
  const isReconnect = phase === 'reconnect'

  const lineColor =
    isDrop || isOffline ? '#ef4444'
    : isSync ? '#8b5cf6'
    : isReconnect ? '#3b82f6'
    : '#10b981'

  const showDots = isOnline || isSync || isReconnect || phase === 'done'
  const broken = isDrop || isOffline

  return (
    <svg viewBox="0 0 280 12" className="w-full h-3" preserveAspectRatio="none" aria-hidden>
      {broken ? (
        <>
          <motion.line
            x1={0} y1={6} x2={120} y2={6}
            stroke={lineColor} strokeWidth={2} strokeLinecap="round"
            initial={{ opacity: 1 }}
            animate={{ opacity: isDrop ? [1, 0.4] : 0.3 }}
            transition={{ duration: 0.4, repeat: isDrop ? Infinity : 0, repeatType: 'reverse' }}
          />
          {/* Gap — broken zone */}
          <motion.line
            x1={160} y1={6} x2={280} y2={6}
            stroke={lineColor} strokeWidth={2} strokeLinecap="round"
            initial={{ opacity: 1 }}
            animate={{ opacity: isDrop ? [1, 0.4] : 0.3 }}
            transition={{ duration: 0.4, repeat: isDrop ? Infinity : 0, repeatType: 'reverse' }}
          />
          {/* Shatter particles */}
          {isDrop && [0, 1, 2, 3, 4].map(i => (
            <motion.circle
              key={i}
              cx={140}
              cy={6}
              r={2}
              fill="#ef4444"
              animate={{
                cx: 140 + (i - 2) * 12,
                cy: 6 + Math.sin(i) * 8,
                opacity: [1, 0],
              }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
        </>
      ) : (
        <>
          <line x1={0} y1={6} x2={280} y2={6} stroke={lineColor} strokeWidth={2} strokeLinecap="round" opacity={0.3} />
          <motion.line
            x1={0} y1={6} x2={280} y2={6}
            stroke={lineColor} strokeWidth={2} strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6 }}
            strokeDasharray="280"
            strokeDashoffset="0"
          />
          {showDots && <FlowingDots color={lineColor} />}
          {showDots && <FlowingDots color={lineColor} reverse />}
        </>
      )}
    </svg>
  )
}

/* ── Connection line SVG (vertical — mobile) ─────────────────────────────── */
function ConnectionLineVertical({ phase }: { phase: string }) {
  const isDrop    = phase === 'drop'
  const isOffline = phase === 'offline'
  const isSync    = phase === 'sync'
  const isReconnect = phase === 'reconnect'
  const isOnline  = phase === 'online' || phase === 'done'

  const lineColor =
    isDrop || isOffline ? '#ef4444'
    : isSync ? '#8b5cf6'
    : isReconnect ? '#3b82f6'
    : '#10b981'

  const broken = isDrop || isOffline
  const showDots = isOnline || isSync || isReconnect || phase === 'done'

  return (
    <svg viewBox="0 0 12 60" className="h-12 w-3 mx-auto" aria-hidden>
      {broken ? (
        <>
          <line x1={6} y1={0} x2={6} y2={22} stroke={lineColor} strokeWidth={2} opacity={0.3} />
          <line x1={6} y1={38} x2={6} y2={60} stroke={lineColor} strokeWidth={2} opacity={0.3} />
          {isDrop && [0, 1, 2].map(i => (
            <motion.circle key={i} cx={6} cy={30} r={2} fill="#ef4444"
              animate={{ cy: 30 + (i - 1) * 10, opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12 }}
            />
          ))}
        </>
      ) : (
        <>
          <line x1={6} y1={0} x2={6} y2={60} stroke={lineColor} strokeWidth={2} opacity={0.35} />
          {showDots && [0, 1, 2].map(i => (
            <motion.circle key={i} r={3} fill={lineColor} cx={6}
              animate={{ cy: [0, 30, 60], opacity: [0, 1, 0] }}
              transition={{ duration: 1.4, delay: i * 0.45, repeat: Infinity, ease: 'linear' }}
            />
          ))}
        </>
      )}
    </svg>
  )
}

/* ── Sale counter ─────────────────────────────────────────────────────────── */
function useSaleCounter(phase: string, speed: number) {
  const [sale, setSale] = useState(4820)
  const ref = useRef(4820)

  useEffect(() => {
    if (phase !== 'online' && phase !== 'offline') return
    const ms = phase === 'online' ? 900 / speed : 1400 / speed
    const iv = setInterval(() => {
      ref.current += 1
      setSale(ref.current)
    }, ms)
    return () => clearInterval(iv)
  }, [phase, speed])

  return sale
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function OfflineSyncReplay() {
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [playing, setPlaying]   = useState(true)
  const [speed, setSpeed]       = useState(1)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const phase = PHASES[phaseIdx]
  const phaseId = phase.id

  /* queue state that mutates through phases */
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [syncedCount, setSyncedCount] = useState(0)
  const saleNum = useSaleCounter(phaseId, speed)

  /* ── Phase auto-advance ──────────────────────────────────────────────── */
  useEffect(() => {
    if (!playing) return
    const ms = phase.duration * 1000 / speed
    timerRef.current = setTimeout(() => {
      if (phaseIdx < PHASES.length - 1) setPhaseIdx(i => i + 1)
      else setPlaying(false)
    }, ms)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [phaseIdx, playing, speed, phase.duration])

  /* ── Phase side-effects ──────────────────────────────────────────────── */
  useEffect(() => {
    setSyncedCount(0)

    if (phaseId === 'offline') {
      // queue builds up one by one
      setQueue([])
      const timers: ReturnType<typeof setTimeout>[] = []
      QUEUE_ITEMS.forEach((item, i) => {
        timers.push(setTimeout(() => {
          setQueue(q => [...q, { ...item, status: 'queued' }])
        }, (i + 1) * 1200 / speed))
      })
      return () => timers.forEach(clearTimeout)
    }

    if (phaseId === 'sync') {
      // sync items one by one
      const timers: ReturnType<typeof setTimeout>[] = []
      QUEUE_ITEMS.forEach((item, i) => {
        // start syncing
        timers.push(setTimeout(() => {
          setQueue(q => q.map(qi => qi.id === item.id ? { ...qi, status: 'syncing' } : qi))
        }, i * 1100 / speed))
        // conflict on #2
        if (i === 1) {
          timers.push(setTimeout(() => {
            setQueue(q => q.map(qi => qi.id === item.id ? { ...qi, status: 'conflict' } : qi))
          }, (i * 1100 + 500) / speed))
        }
        // resolved / synced
        timers.push(setTimeout(() => {
          setQueue(q => q.map(qi => qi.id === item.id ? { ...qi, status: 'synced' } : qi))
          setSyncedCount(c => c + 1)
        }, (i * 1100 + (i === 1 ? 900 : 700)) / speed))
      })
      return () => timers.forEach(clearTimeout)
    }

    if (phaseId === 'done') {
      setQueue(QUEUE_ITEMS.map(qi => ({ ...qi, status: 'synced' })))
      setSyncedCount(3)
    }

    if (phaseId === 'online' || phaseId === 'drop') {
      setQueue([])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseId, speed])

  /* ── Controls ────────────────────────────────────────────────────────── */
  const replay = useCallback(() => {
    setPhaseIdx(0)
    setPlaying(true)
    setQueue([])
    setSyncedCount(0)
  }, [])

  const jumpTo = useCallback((idx: number) => {
    setPhaseIdx(idx)
    setPlaying(true)
  }, [])

  const statusText = phase.status.replace('{n}', String(queue.length))

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-900/80 to-slate-950/90 p-4 sm:p-6 backdrop-blur"
    >
      {/* ── Timeline progress bar ────────────────────────────────────────── */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-mono text-xs sm:text-sm font-bold text-white tracking-wide">
            Offline Sync Replay
          </h3>
          <span
            className="font-mono text-[10px] px-2 py-0.5 rounded-full border"
            style={{ borderColor: phase.color, color: phase.color }}
          >
            Phase {phaseIdx + 1}/{PHASES.length}
          </span>
        </div>

        {/* Phase bar */}
        <div className="flex gap-1">
          {PHASES.map((p, i) => (
            <button
              key={p.id}
              onClick={() => jumpTo(i)}
              className="flex-1 h-1.5 rounded-full transition-colors cursor-pointer"
              style={{
                background: i < phaseIdx ? p.color
                  : i === phaseIdx ? p.color
                  : '#334155',
                opacity: i <= phaseIdx ? 1 : 0.35,
              }}
              aria-label={`Jump to ${p.title}`}
            />
          ))}
        </div>
        <p className="font-mono text-[10px] text-slate-400 mt-1.5 text-center">
          {phase.title}
        </p>
      </div>

      {/* ── Main stage ───────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-4">
        {/* POS Terminal */}
        <div className="flex-1 w-full">
          <PosTerminal phaseId={phaseId} saleNum={saleNum} queueCount={queue.length} />
        </div>

        {/* Connection */}
        <div className="flex-shrink-0 w-full md:w-40 flex items-center justify-center py-1 md:py-0 md:mt-10">
          <div className="hidden md:block w-full">
            <ConnectionLine phase={phaseId} />
          </div>
          <div className="md:hidden">
            <ConnectionLineVertical phase={phaseId} />
          </div>
        </div>

        {/* Core Service */}
        <div className="flex-1 w-full">
          <CoreService phaseId={phaseId} syncedCount={syncedCount} />
        </div>
      </div>

      {/* ── Status strip ─────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={phaseId}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="mt-4 rounded-lg border px-3 py-2 text-center font-mono text-xs"
          style={{ borderColor: phase.color + '55', color: phase.color }}
        >
          {statusText}
        </motion.div>
      </AnimatePresence>

      {/* ── Queue visualization ───────────────────────────────────────────── */}
      <AnimatePresence>
        {(phaseId === 'offline' || phaseId === 'sync' || phaseId === 'reconnect' || phaseId === 'done') && queue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            <p className="font-mono text-[10px] text-slate-500 mb-1.5 uppercase tracking-wider">
              Sync Queue
            </p>
            <div className="flex flex-wrap gap-2">
              {queue.map((item, i) => (
                <QueueCard key={item.id} item={item} index={i} flying={phaseId === 'sync' && item.status === 'syncing'} />
              ))}
            </div>

            {/* Sync progress bar */}
            {(phaseId === 'sync' || phaseId === 'done') && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: '#8b5cf6' }}
                    initial={{ width: '0%' }}
                    animate={{ width: `${(syncedCount / 3) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <span className="font-mono text-[10px] text-slate-400">{syncedCount}/3 synced</span>
              </div>
            )}

            {/* Offline callout */}
            {phaseId === 'offline' && queue.length >= 2 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 font-mono text-[10px] text-amber-400/80 italic leading-relaxed"
              >
                "Stores kept selling while competitors couldn't process a single transaction"
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ZERO DATA LOSS stamp ─────────────────────────────────────────── */}
      <AnimatePresence>
        {phaseId === 'done' && (
          <motion.div
            initial={{ scale: 2, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: -4 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 340, damping: 18 }}
            className="mt-4 flex flex-col items-center"
          >
            <span className="inline-block px-4 py-1.5 rounded border-2 border-emerald-500 text-emerald-400 font-bold text-sm sm:text-base tracking-[0.2em] font-mono">
              ZERO DATA LOSS ✓
            </span>
            <div className="flex flex-wrap justify-center gap-3 mt-3">
              {[
                { value: '3', label: 'sales recovered' },
                { value: '$128.40', label: 'revenue saved' },
                { value: '<5s', label: 'sync time' },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="text-center"
                >
                  <p className="font-mono text-sm font-bold text-emerald-400">{s.value}</p>
                  <p className="font-mono text-[9px] text-slate-500 uppercase tracking-wider">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Controls ─────────────────────────────────────────────────────── */}
      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          onClick={() => setPlaying(p => !p)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-mono text-xs transition-colors cursor-pointer"
        >
          {playing ? <Pause size={12} /> : <Play size={12} />}
          {playing ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={replay}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-mono text-xs transition-colors cursor-pointer"
        >
          <RotateCcw size={12} />
          Replay
        </button>
        <button
          onClick={() => setSpeed(s => s === 1 ? 2 : 1)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-mono text-xs transition-colors cursor-pointer"
        >
          <Gauge size={12} />
          {speed}×
        </button>
      </div>

      {/* ── Phase dots ───────────────────────────────────────────────────── */}
      <div className="mt-3 flex items-center justify-center gap-1.5">
        {PHASES.map((p, i) => (
          <button
            key={p.id}
            onClick={() => jumpTo(i)}
            className="w-2 h-2 rounded-full transition-all cursor-pointer"
            style={{
              background: i === phaseIdx ? p.color : '#475569',
              transform: i === phaseIdx ? 'scale(1.4)' : 'scale(1)',
            }}
            aria-label={p.title}
          />
        ))}
      </div>

      {/* ── Technical callouts ────────────────────────────────────────────── */}
      <div className="mt-4 flex flex-wrap justify-center gap-1.5">
        {CALLOUTS.map((c, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="inline-block rounded-full border border-slate-700/50 bg-slate-900/60 px-2.5 py-1 font-mono text-[9px] text-slate-400 leading-tight"
          >
            {c}
          </motion.span>
        ))}
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  SUB-COMPONENTS                                                            */
/* ═══════════════════════════════════════════════════════════════════════════ */

/* ── POS Terminal node ────────────────────────────────────────────────────── */
function PosTerminal({
  phaseId,
  saleNum,
  queueCount,
}: {
  phaseId: string
  saleNum: number
  queueCount: number
}) {
  const offline = phaseId === 'offline' || phaseId === 'drop'
  const statusDot = offline ? '#ef4444' : '#10b981'

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-3 text-center relative">
      {/* Status dot */}
      <motion.span
        className="absolute top-2 right-2 w-2 h-2 rounded-full"
        style={{ background: statusDot }}
        animate={{ opacity: offline ? [1, 0.3] : 1 }}
        transition={offline ? { duration: 0.6, repeat: Infinity, repeatType: 'reverse' } : {}}
      />

      <div className="flex items-center justify-center gap-2 mb-2">
        <Monitor size={18} className="text-slate-300" />
        <span className="font-mono text-xs font-bold text-white">POS Terminal</span>
      </div>

      {/* WiFi icon */}
      <div className="flex justify-center mb-2">
        {offline ? (
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            <WifiOff size={16} className="text-red-400" />
          </motion.div>
        ) : (
          <Wifi size={16} className="text-emerald-400" />
        )}
      </div>

      {/* Sale counter */}
      <div className="font-mono text-lg font-bold text-slate-200">
        #{saleNum}
      </div>
      <p className="font-mono text-[9px] text-slate-500 mt-0.5">Current Sale</p>

      {/* SQLite DB icon */}
      <motion.div
        className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-slate-700/40 bg-slate-800/50 px-2 py-1.5"
        animate={{
          borderColor: (phaseId === 'offline' || phaseId === 'sync') ? '#f59e0b55' : '#33415555',
          boxShadow: phaseId === 'offline' ? '0 0 12px rgba(245,158,11,0.15)' : 'none',
        }}
      >
        <Database size={14} className={phaseId === 'offline' ? 'text-amber-400' : 'text-slate-500'} />
        <span className="font-mono text-[10px] text-slate-400">SQLite</span>
        {queueCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="ml-1 flex items-center justify-center w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 font-mono text-[9px] font-bold"
          >
            {queueCount}
          </motion.span>
        )}
      </motion.div>
    </div>
  )
}

/* ── Core Service node ────────────────────────────────────────────────────── */
function CoreService({
  phaseId,
  syncedCount,
}: {
  phaseId: string
  syncedCount: number
}) {
  const active = phaseId === 'online' || phaseId === 'sync' || phaseId === 'done' || phaseId === 'reconnect'

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-3 text-center relative">
      <motion.span
        className="absolute top-2 right-2 w-2 h-2 rounded-full"
        style={{ background: active ? '#10b981' : '#64748b' }}
      />

      <div className="flex items-center justify-center gap-2 mb-2">
        <Server size={18} className="text-slate-300" />
        <span className="font-mono text-xs font-bold text-white">Core Service</span>
      </div>
      <p className="font-mono text-[9px] text-slate-500 mb-2">40+ gRPC endpoints</p>

      {/* Sync indicator */}
      {(phaseId === 'sync' || phaseId === 'done') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-2"
        >
          <div className="flex items-center justify-center gap-1">
            <Check size={12} className="text-emerald-400" />
            <span className="font-mono text-[10px] text-emerald-400">{syncedCount} reconciled</span>
          </div>
        </motion.div>
      )}

      {/* PostgreSQL */}
      <div className="mt-2 flex items-center justify-center gap-1.5 rounded-lg border border-slate-700/40 bg-slate-800/50 px-2 py-1.5">
        <Database size={14} className={active ? 'text-blue-400' : 'text-slate-500'} />
        <span className="font-mono text-[10px] text-slate-400">PostgreSQL</span>
      </div>
    </div>
  )
}

/* ── Queue card ───────────────────────────────────────────────────────────── */
function QueueCard({
  item,
  index,
  flying,
}: {
  item: QueueItem
  index: number
  flying: boolean
}) {
  const statusColors: Record<string, { bg: string; border: string; text: string }> = {
    queued:   { bg: 'rgba(245,158,11,0.08)', border: '#f59e0b44', text: '#f59e0b' },
    syncing:  { bg: 'rgba(139,92,246,0.08)', border: '#8b5cf644', text: '#8b5cf6' },
    conflict: { bg: 'rgba(245,158,11,0.12)', border: '#f59e0b66', text: '#f59e0b' },
    synced:   { bg: 'rgba(16,185,129,0.08)', border: '#10b98144', text: '#10b981' },
  }
  const c = statusColors[item.status] || statusColors.queued

  const statusLabel =
    item.status === 'queued'   ? 'queued'
    : item.status === 'syncing'  ? 'syncing…'
    : item.status === 'conflict' ? 'conflict!'
    : 'reconciled ✓'

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.9 }}
      animate={{
        opacity: 1,
        x: flying ? 30 : 0,
        scale: 1,
      }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
      className="rounded-lg border px-2.5 py-1.5 font-mono"
      style={{ background: c.bg, borderColor: c.border }}
    >
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold text-slate-200">{item.orderId}</span>
        <span className="text-[10px] text-slate-400">{item.amount}</span>
      </div>
      <div className="flex items-center gap-1 mt-0.5">
        {item.status === 'synced' && <Check size={9} style={{ color: c.text }} />}
        {item.status === 'conflict' && <AlertTriangle size={9} style={{ color: c.text }} />}
        <span className="text-[9px]" style={{ color: c.text }}>{statusLabel}</span>
      </div>
    </motion.div>
  )
}
