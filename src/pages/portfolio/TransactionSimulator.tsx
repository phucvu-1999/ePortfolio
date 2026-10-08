// ─── Transaction Simulator — Live POS Sale Pipeline ─────────────────────────
// Animated end-to-end transaction visualization: scan → promote → total →
// pay → receipt → inventory → kitchen → telemetry. Each step lights up
// sequentially with flowing data arrows and real step detail cards.
import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import NumberFlow from '@number-flow/react'
import {
  ScanLine, Tag, Calculator, CreditCard, Receipt,
  PackageMinus, ChefHat, Radio,
  Play, Pause, SkipBack, SkipForward, RotateCcw,
  Timer, Check,
} from 'lucide-react'

/* ── Step data ───────────────────────────────────────────────────────────── */
interface PipelineStep {
  id: string
  title: string
  color: string
  icon: typeof ScanLine
  badge: string
  detail: string[]
}

const STEPS: PipelineStep[] = [
  {
    id: 'scan', title: 'Scan Items', color: '#10b981',
    icon: ScanLine, badge: '3 items scanned via barcode',
    detail: ['Chicken Rice — $8.50', 'Iced Tea — $3.20', 'Cookie — $2.80'],
  },
  {
    id: 'promo', title: 'Apply Promotions', color: '#f59e0b',
    icon: Tag, badge: '2 promotions matched',
    detail: ['Buy 2 Get 10% Off → −$1.17', 'Member 1.5× points'],
  },
  {
    id: 'total', title: 'Calculate Total', color: '#3b82f6',
    icon: Calculator, badge: 'Subtotal $14.50 → GST 9%',
    detail: ['Subtotal $14.50', 'Discount −$1.17', 'GST 9% +$1.20', 'Total $14.53'],
  },
  {
    id: 'pay', title: 'Process Payment', color: '#8b5cf6',
    icon: CreditCard, badge: 'NETS Online QR',
    detail: ['QR generated → polling 5s', 'Validating…', 'APPROVED ✓'],
  },
  {
    id: 'receipt', title: 'Print Receipt', color: '#64748b',
    icon: Receipt, badge: 'Thermal 80mm',
    detail: ['Header + items + GST', 'Barcode #TXN4825', 'Receipt unfurled ✓'],
  },
  {
    id: 'inventory', title: 'Update Inventory', color: '#84cc16',
    icon: PackageMinus, badge: '−3 items from stock',
    detail: ['SQLite local update', 'Queued for sync', 'Stock levels OK'],
  },
  {
    id: 'kitchen', title: 'Route to Kitchen', color: '#ef4444',
    icon: ChefHat, badge: 'Order #K045 → Grill station',
    detail: ['gRPC StreamServiceImpl push', 'Station: Grill', 'Priority: Normal'],
  },
  {
    id: 'telemetry', title: 'Ship Telemetry', color: '#06b6d4',
    icon: Radio, badge: 'payment.success → Aliyun SLS',
    detail: ['Event: payment.success', 'Sink: Aliyun SLS', 'Fault-isolated, never blocks'],
  },
]

const TOTAL_STEPS = STEPS.length
const STEP_INTERVAL = 2500

/* ── Flowing arrow SVG between steps ──────────────────────────────────── */
function FlowArrow({ active, color }: { active: boolean; color: string }) {
  return (
    <svg
      viewBox="0 0 40 12"
      className="shrink-0 hidden md:block"
      style={{ width: 40, height: 12 }}
      aria-hidden
    >
      <line
        x1={2} y1={6} x2={34} y2={6}
        stroke={active ? color : '#334155'}
        strokeWidth={2}
        strokeDasharray="4 4"
        strokeLinecap="round"
      >
        {active && (
          <animate
            attributeName="stroke-dashoffset"
            from="0" to="-8"
            dur="0.6s"
            repeatCount="indefinite"
          />
        )}
      </line>
      <polygon
        points="33,2 39,6 33,10"
        fill={active ? color : '#334155'}
        opacity={active ? 1 : 0.5}
      />
    </svg>
  )
}

/* ── Vertical flow arrow for mobile ───────────────────────────────────── */
function FlowArrowVertical({ active, color }: { active: boolean; color: string }) {
  return (
    <svg
      viewBox="0 0 12 28"
      className="shrink-0 md:hidden mx-auto"
      style={{ width: 12, height: 28 }}
      aria-hidden
    >
      <line
        x1={6} y1={2} x2={6} y2={22}
        stroke={active ? color : '#334155'}
        strokeWidth={2}
        strokeDasharray="4 4"
        strokeLinecap="round"
      >
        {active && (
          <animate
            attributeName="stroke-dashoffset"
            from="0" to="-8"
            dur="0.6s"
            repeatCount="indefinite"
          />
        )}
      </line>
      <polygon
        points="2,21 6,27 10,21"
        fill={active ? color : '#334155'}
        opacity={active ? 1 : 0.5}
      />
    </svg>
  )
}

/* ── Step card ─────────────────────────────────────────────────────────── */
function StepCard({
  step,
  index,
  status,
}: {
  step: PipelineStep
  index: number
  status: 'inactive' | 'active' | 'completed'
}) {
  const Icon = step.icon
  const isActive = status === 'active'
  const isDone = status === 'completed'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="relative shrink-0"
      style={{ width: 'clamp(130px, 15vw, 160px)' }}
    >
      <motion.div
        animate={{
          borderColor: isActive ? step.color : isDone ? `${step.color}50` : '#1e293b',
          boxShadow: isActive ? `0 0 24px ${step.color}30, 0 0 60px ${step.color}10` : 'none',
        }}
        transition={{ duration: 0.4 }}
        style={{
          background: isActive ? `${step.color}0c` : isDone ? `${step.color}06` : '#0f172a',
          borderRadius: 14,
          border: '1.5px solid',
          borderColor: '#1e293b',
          padding: '14px 12px',
          opacity: status === 'inactive' ? 0.4 : 1,
          transition: 'opacity 0.4s',
        }}
      >
        {/* Icon + step number */}
        <div className="flex items-center justify-between mb-2">
          <div
            style={{
              width: 32, height: 32, borderRadius: 8,
              display: 'grid', placeItems: 'center',
              background: `${step.color}${isActive ? '25' : '12'}`,
              border: `1px solid ${step.color}${isActive ? '50' : '25'}`,
              color: step.color,
              transition: 'all 0.3s',
            }}
          >
            <Icon size={16} />
          </div>
          {isDone ? (
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full"
              style={{ background: `${step.color}25`, color: step.color }}
            >
              <Check size={11} strokeWidth={3} />
            </span>
          ) : (
            <span
              className="font-mono text-[10px] font-semibold"
              style={{ color: isActive ? step.color : '#475569' }}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
          )}
        </div>

        {/* Title */}
        <p
          className="font-mono text-[11px] font-semibold leading-tight mb-1"
          style={{ color: isActive ? '#f1f5f9' : isDone ? '#94a3b8' : '#475569' }}
        >
          {step.title}
        </p>

        {/* Badge */}
        <p
          className="font-mono text-[9px] leading-snug mb-2"
          style={{ color: isActive ? step.color : '#475569' }}
        >
          {step.badge}
        </p>

        {/* Detail content - only visible when active or done */}
        <AnimatePresence>
          {(isActive || isDone) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              <div
                className="pt-2 space-y-0.5"
                style={{ borderTop: `1px solid ${step.color}20` }}
              >
                {step.detail.map((d, i) => (
                  <motion.p
                    key={d}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: isActive ? i * 0.12 : 0, duration: 0.2 }}
                    className="font-mono text-[9px]"
                    style={{ color: isActive ? '#cbd5e1' : '#64748b' }}
                  >
                    <span style={{ color: step.color, marginRight: 4, fontSize: 7 }}>●</span>
                    {d}
                  </motion.p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active pulsing border */}
        {isActive && (
          <motion.div
            animate={{ opacity: [0.4, 0.1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute', inset: -3, borderRadius: 18,
              border: `2px solid ${step.color}40`,
              pointerEvents: 'none',
            }}
          />
        )}
      </motion.div>
    </motion.div>
  )
}

/* ── Main ─────────────────────────────────────────────────────────────── */
export default function TransactionSimulator() {
  const [activeStep, setActiveStep] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(true)
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<number | null>(null)
  const timerRef = useRef<number | null>(null)
  const hoverRef = useRef(false)

  const isComplete = activeStep >= TOTAL_STEPS

  // Auto-advance logic
  const clearAutoAdvance = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
  }, [])

  const startAutoAdvance = useCallback(() => {
    clearAutoAdvance()
    intervalRef.current = window.setInterval(() => {
      if (hoverRef.current) return
      setActiveStep(prev => {
        if (prev >= TOTAL_STEPS) { clearAutoAdvance(); return prev }
        return prev + 1
      })
    }, STEP_INTERVAL)
  }, [clearAutoAdvance])

  useEffect(() => {
    if (isPlaying && !isComplete) {
      startAutoAdvance()
    } else {
      clearAutoAdvance()
    }
    return clearAutoAdvance
  }, [isPlaying, isComplete, startAutoAdvance, clearAutoAdvance])

  // Start on mount
  useEffect(() => {
    setActiveStep(0)
  }, [])

  // Elapsed timer
  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      if (!isComplete) setElapsed(prev => prev + 100)
    }, 100)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [isComplete])

  const restart = useCallback(() => {
    setActiveStep(0)
    setElapsed(0)
    setIsPlaying(true)
  }, [])

  const stepForward = useCallback(() => {
    setIsPlaying(false)
    setActiveStep(prev => Math.min(prev + 1, TOTAL_STEPS))
  }, [])

  const stepBackward = useCallback(() => {
    setIsPlaying(false)
    setActiveStep(prev => Math.max(prev - 1, 0))
  }, [])

  const togglePlay = useCallback(() => {
    if (isComplete) { restart(); return }
    setIsPlaying(prev => !prev)
  }, [isComplete, restart])

  const getStatus = (i: number): 'inactive' | 'active' | 'completed' => {
    if (i < activeStep) return 'completed'
    if (i === activeStep) return 'active'
    return 'inactive'
  }

  const progressPct = Math.min((activeStep / TOTAL_STEPS) * 100, 100)
  const elapsedSec = (elapsed / 1000).toFixed(1)

  // Animated total value (step 2 = index 2 is "Calculate Total")
  const displayTotal = activeStep >= 2 ? 14.53 : activeStep >= 1 ? 13.33 : activeStep >= 0 ? 14.50 : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="space-y-4"
      onMouseEnter={() => { hoverRef.current = true }}
      onMouseLeave={() => { hoverRef.current = false }}
    >
      {/* ══ POS Terminal Chrome Header ══ */}
      <div
        className="rounded-2xl border border-slate-700/60 overflow-hidden"
        style={{ background: '#0d1117' }}
      >
        <div
          className="flex items-center justify-between gap-4 px-5 py-3.5 flex-wrap"
          style={{ background: '#161b22' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <Timer size={14} className="text-emerald-400 shrink-0" />
            <span className="font-mono text-xs text-slate-400 uppercase tracking-widest truncate">
              Live Transaction
            </span>
            <span
              className="hidden sm:inline-block w-[7px] h-[14px] bg-emerald-400/70"
              style={{ animation: 'blink-cursor 1s step-end infinite' }}
            />
          </div>
          <span className="hidden md:block font-mono text-[10px] text-slate-600">
            SALE #4825 · REG 01 · CASHIER: LEO
          </span>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] text-slate-500">
              {elapsedSec}s
            </span>
            {isComplete ? (
              <motion.span
                initial={{ scale: 1.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="px-2 py-0.5 rounded font-mono text-[10px] font-bold border-2 border-emerald-500/60 text-emerald-400"
              >
                COMPLETE ✓
              </motion.span>
            ) : (
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Processing…
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 w-full" style={{ background: '#1e293b' }}>
          <motion.div
            className="h-full"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              background: isComplete
                ? '#10b981'
                : `linear-gradient(90deg, #10b981, ${STEPS[Math.min(activeStep, TOTAL_STEPS - 1)]?.color ?? '#3b82f6'})`,
            }}
          />
        </div>
      </div>

      {/* ══ Pipeline ══ */}
      <div
        className="rounded-2xl border border-slate-700/60 overflow-hidden"
        style={{ background: '#0d1117' }}
      >
        {/* Scrollable pipeline area */}
        <div className="p-5 overflow-x-auto">
          {/* Desktop: horizontal layout */}
          <div className="hidden md:flex items-start gap-0">
            {STEPS.map((step, i) => (
              <div key={step.id} className="flex items-start">
                <StepCard step={step} index={i} status={getStatus(i)} />
                {i < TOTAL_STEPS - 1 && (
                  <div className="flex items-center pt-6">
                    <FlowArrow
                      active={i < activeStep}
                      color={STEPS[i + 1].color}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile: vertical layout */}
          <div className="flex flex-col items-center gap-0 md:hidden">
            {STEPS.map((step, i) => (
              <div key={step.id} className="flex flex-col items-center w-full" style={{ maxWidth: 220 }}>
                <div className="w-full">
                  <StepCard step={step} index={i} status={getStatus(i)} />
                </div>
                {i < TOTAL_STEPS - 1 && (
                  <FlowArrowVertical
                    active={i < activeStep}
                    color={STEPS[i + 1].color}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Animated total readout ── */}
        <div
          className="flex items-center justify-between gap-4 px-5 py-3 border-t border-slate-700/40 flex-wrap"
          style={{ background: '#161b22' }}
        >
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
              Running Total
            </span>
            <span className="font-mono text-lg font-bold text-emerald-400" style={{ textShadow: '0 0 14px rgba(16,185,129,0.35)' }}>
              $<NumberFlow value={displayTotal} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />
            </span>
          </div>

          {/* Step indicator pills */}
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => (
              <motion.button
                key={s.id}
                onClick={() => { setIsPlaying(false); setActiveStep(i) }}
                className="w-2 h-2 rounded-full cursor-pointer border-none p-0"
                animate={{
                  background: i < activeStep ? s.color : i === activeStep ? s.color : '#334155',
                  scale: i === activeStep ? 1.4 : 1,
                }}
                transition={{ duration: 0.3 }}
                aria-label={`Go to step ${i + 1}: ${s.title}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ══ Controls ══ */}
      <div className="flex items-center justify-center gap-2">
        {[
          { icon: SkipBack, label: 'Previous step', action: stepBackward, disabled: activeStep <= 0 },
          { icon: isPlaying ? Pause : Play, label: isPlaying ? 'Pause' : 'Play', action: togglePlay, disabled: false, accent: true },
          { icon: SkipForward, label: 'Next step', action: stepForward, disabled: isComplete },
          { icon: RotateCcw, label: 'Restart', action: restart, disabled: false },
        ].map(({ icon: BtnIcon, label, action, disabled, accent }) => (
          <motion.button
            key={label}
            whileHover={{ scale: disabled ? 1 : 1.1 }}
            whileTap={{ scale: disabled ? 1 : 0.9 }}
            onClick={action}
            disabled={disabled}
            aria-label={label}
            className="flex items-center justify-center rounded-lg border font-mono text-[10px] cursor-pointer transition-colors"
            style={{
              width: accent ? 40 : 34,
              height: accent ? 40 : 34,
              borderColor: accent ? '#10b98150' : disabled ? '#1e293b' : '#334155',
              background: accent ? '#10b98115' : '#0f172a',
              color: accent ? '#10b981' : disabled ? '#334155' : '#94a3b8',
              opacity: disabled ? 0.5 : 1,
            }}
          >
            <BtnIcon size={accent ? 16 : 14} />
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
