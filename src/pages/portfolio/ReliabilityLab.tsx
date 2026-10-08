import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CheckCircle2, Clock3, CloudOff, CopyCheck, Play, RefreshCw, RotateCcw, ShieldCheck, Wifi } from 'lucide-react'

interface RecoveryEvent {
  title: string
  detail: string
  state: 'detected' | 'guarded' | 'recovered' | 'consistent'
}

interface ReliabilityScenario {
  id: string
  title: string
  summary: string
  icon: typeof CloudOff
  accent: string
  invariant: string
  events: RecoveryEvent[]
}

const SCENARIOS: ReliabilityScenario[] = [
  {
    id: 'network-outage',
    title: 'Network outage',
    summary: 'The backend disappears while a cashier completes a sale.',
    icon: CloudOff,
    accent: '#06b6d4',
    invariant: 'The sale remains durable and the cashier never waits on the network.',
    events: [
      { title: 'Connection lost', detail: 'Health check marks the remote endpoint unavailable.', state: 'detected' },
      { title: 'Commit locally', detail: 'The order and tender record are written atomically to SQLite.', state: 'guarded' },
      { title: 'Queue sync work', detail: 'A durable outbox entry survives process and device restarts.', state: 'recovered' },
      { title: 'Continue selling', detail: 'Receipt and inventory workflows complete in offline mode.', state: 'consistent' },
    ],
  },
  {
    id: 'duplicate-callback',
    title: 'Duplicate callback',
    summary: 'A payment provider retries an already processed success response.',
    icon: CopyCheck,
    accent: '#8b5cf6',
    invariant: 'One provider transaction can settle one local payment only once.',
    events: [
      { title: 'Callback received', detail: 'The provider transaction ID is extracted before mutation.', state: 'detected' },
      { title: 'Check idempotency key', detail: 'The payment ledger finds the previously completed operation.', state: 'guarded' },
      { title: 'Return original result', detail: 'No second charge, points award, or receipt is created.', state: 'recovered' },
      { title: 'Ledger unchanged', detail: 'The duplicate is recorded for observability only.', state: 'consistent' },
    ],
  },
  {
    id: 'expired-qr',
    title: 'Expired QR',
    summary: 'The QR expires while the provider status is still uncertain.',
    icon: Clock3,
    accent: '#f59e0b',
    invariant: 'An uncertain payment is resolved before a replacement QR is issued.',
    events: [
      { title: 'Expiry reached', detail: 'The countdown closes the current payment attempt.', state: 'detected' },
      { title: 'Revalidate payment', detail: 'The provider is queried once more using the original payment ID.', state: 'guarded' },
      { title: 'Cancel old attempt', detail: 'If unpaid, the old payment ID is explicitly cancelled.', state: 'recovered' },
      { title: 'Issue fresh QR', detail: 'A new payment ID and expiry window are presented to the customer.', state: 'consistent' },
    ],
  },
  {
    id: 'reconciliation',
    title: 'Reconnect reconciliation',
    summary: 'Connectivity returns with a backlog of offline transactions.',
    icon: Wifi,
    accent: '#10b981',
    invariant: 'Retries converge local and remote state without losing or duplicating sales.',
    events: [
      { title: 'Connectivity restored', detail: 'The scheduler resumes the oldest durable outbox item.', state: 'detected' },
      { title: 'Send idempotently', detail: 'Stable operation IDs make every retry safe.', state: 'guarded' },
      { title: 'Resolve conflicts', detail: 'Server versions and domain rules decide the accepted state.', state: 'recovered' },
      { title: 'Acknowledge and remove', detail: 'Only confirmed work leaves the local queue.', state: 'consistent' },
    ],
  },
]

const STATE_LABELS: Record<RecoveryEvent['state'], string> = {
  detected: 'Detected',
  guarded: 'Guardrail',
  recovered: 'Recovery',
  consistent: 'Consistent',
}

export default function ReliabilityLab() {
  const reduceMotion = useReducedMotion()
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id)
  const [eventIndex, setEventIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const timerRef = useRef<number | null>(null)
  const scenario = useMemo(() => SCENARIOS.find((item) => item.id === scenarioId) ?? SCENARIOS[0], [scenarioId])
  const complete = eventIndex >= scenario.events.length - 1

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    timerRef.current = null
  }, [])

  useEffect(() => {
    clearTimer()
    if (!playing || complete) return
    timerRef.current = window.setTimeout(() => setEventIndex((index) => index + 1), reduceMotion ? 250 : 1100)
    return clearTimer
  }, [clearTimer, complete, eventIndex, playing, reduceMotion])

  useEffect(() => {
    if (complete) setPlaying(false)
  }, [complete])

  const selectScenario = (id: string) => {
    setScenarioId(id)
    setEventIndex(0)
    setPlaying(false)
  }

  const replay = () => {
    setEventIndex(0)
    setPlaying(true)
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700/60 bg-[#0d1117]">
      <div className="border-b border-slate-800 bg-[#161b22] p-4 md:p-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400">Failure injection console</p>
            <p className="mt-1 text-sm text-slate-500">Select a failure, then inspect the guardrail and recovery path.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => complete ? replay() : setPlaying((value) => !value)} className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 font-mono text-xs text-cyan-300">
              <Play size={13} /> {playing ? 'Pause' : complete ? 'Replay' : 'Run scenario'}
            </button>
            <button type="button" onClick={replay} aria-label="Reset and replay scenario" className="rounded-lg border border-slate-700 p-2 text-slate-400 hover:text-white">
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-[240px_1fr]">
        <div className="border-b border-slate-800 p-3 md:border-b-0 md:border-r">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-1" role="tablist" aria-label="Failure scenarios">
            {SCENARIOS.map((item) => {
              const Icon = item.icon
              const selected = item.id === scenario.id
              return (
                <button key={item.id} type="button" role="tab" aria-selected={selected} onClick={() => selectScenario(item.id)} className="flex items-center gap-2 rounded-xl border p-3 text-left transition-colors" style={{ borderColor: selected ? `${item.accent}70` : '#1e293b', background: selected ? `${item.accent}12` : 'transparent', color: selected ? item.accent : '#94a3b8' }}>
                  <Icon size={16} className="shrink-0" />
                  <span className="font-mono text-[11px] leading-tight">{item.title}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="p-5 md:p-7">
          <AnimatePresence mode="wait">
            <motion.div key={scenario.id} initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}>
              <h3 className="text-xl font-semibold text-slate-100">{scenario.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{scenario.summary}</p>

              <div className="mt-6 space-y-3" aria-live="polite">
                {scenario.events.map((event, index) => {
                  const reached = index <= eventIndex
                  const active = index === eventIndex
                  return (
                    <motion.div key={event.title} animate={{ opacity: reached ? 1 : 0.3, x: reached ? 0 : 8 }} className="flex gap-3 rounded-xl border p-4" style={{ borderColor: active ? `${scenario.accent}65` : '#1e293b', background: active ? `${scenario.accent}0d` : '#0f172a' }}>
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ color: reached ? scenario.accent : '#475569', background: reached ? `${scenario.accent}18` : '#1e293b' }}>
                        {reached && index < eventIndex ? <CheckCircle2 size={15} /> : <span className="font-mono text-[10px]">{index + 1}</span>}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium text-slate-200">{event.title}</p>
                          <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: reached ? scenario.accent : '#475569' }}>{STATE_LABELS[event.state]}</span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-slate-500">{event.detail}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] p-4">
                <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-400" />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-emerald-400">Invariant protected</p>
                  <p className="mt-1 text-sm text-slate-300">{scenario.invariant}</p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4">
                <span className="font-mono text-[10px] text-slate-500">Event {eventIndex + 1} of {scenario.events.length}</span>
                <button type="button" onClick={() => setEventIndex((index) => Math.min(index + 1, scenario.events.length - 1))} disabled={complete} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 font-mono text-xs text-slate-300 disabled:cursor-not-allowed disabled:opacity-40">
                  <RefreshCw size={13} /> Advance
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
