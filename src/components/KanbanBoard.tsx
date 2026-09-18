import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'

// ─── Data ────────────────────────────────────────────────────────────────────

const LABEL_DOT_COLORS: Record<string, string> = {
  Frontend: '#10b981',
  Backend: '#3b82f6',
  DevOps: '#f59e0b',
  UI: '#8b5cf6',
  'UI/UX': '#8b5cf6',
  Learning: '#ec4899',
  Personal: '#06b6d4',
  'Full-Stack': '#a855f7',
  WebSocket: '#f97316',
  Community: '#14b8a6',
  '2025 Goal': '#ec4899',
  Certification: '#f59e0b',
  Go: '#14b8a6',
  React: '#06b6d4',
  'High Priority': '#ef4444',
  Components: '#8b5cf6',
  Stripe: '#3b82f6',
  Production: '#10b981',
  'GitHub Actions': '#f59e0b',
}

interface KanbanCard {
  title: string
  labels: string[]
  priority?: 'low' | 'medium' | 'high'
  progress?: number
  progressColor?: string
  due?: string
  completed?: string
  description?: string
  subtasks?: { text: string; done: boolean }[]
}

const BACKLOG_CARDS: KanbanCard[] = [
  {
    title: 'Learn Rust & WebAssembly',
    labels: ['Learning', '2025 Goal'],
    priority: 'low',
    description: "Explore Rust's ownership model and build a WASM calculator",
    subtasks: [{ text: 'Complete Rustlings', done: true }, { text: 'Build first WASM module', done: false }],
  },
  {
    title: 'Kubernetes Certification',
    labels: ['DevOps', 'Certification'],
    priority: 'medium',
    description: 'Prepare for CKA exam with hands-on labs',
    subtasks: [{ text: 'Finish KodeKloud course', done: true }, { text: 'Practice exam scenarios', done: false }, { text: 'Schedule exam', done: false }],
  },
  {
    title: 'Open Source Contribution',
    labels: ['Community', 'Go'],
    priority: 'low',
    description: 'Find and contribute to an active Go project on GitHub',
    subtasks: [{ text: 'Identify target repos', done: false }, { text: 'Submit first PR', done: false }],
  },
]

const IN_PROGRESS_CARDS: KanbanCard[] = [
  {
    title: 'POS Transaction Engine v2',
    labels: ['Frontend', 'Backend', 'High Priority'],
    priority: 'high',
    progress: 72,
    progressColor: 'from-blue-500 to-cyan-400',
    due: 'Due in 5 days',
    description: 'Rebuilding the core transaction engine for EPOS with real-time sync',
    subtasks: [{ text: 'Payment gateway v2', done: true }, { text: 'Real-time inventory sync', done: true }, { text: 'Load testing at scale', done: false }],
  },
  {
    title: 'Real-Time Collaboration Tool',
    labels: ['WebSocket', 'React'],
    priority: 'high',
    progress: 45,
    progressColor: 'from-blue-500 to-indigo-400',
    due: 'Due in 12 days',
    description: 'Multi-user editing with conflict resolution via CRDTs',
    subtasks: [{ text: 'WebSocket infrastructure', done: true }, { text: 'CRDT implementation', done: false }, { text: 'Presence indicators', done: false }],
  },
  {
    title: 'Portfolio v5 Enhancement',
    labels: ['Personal', 'UI/UX'],
    priority: 'medium',
    progress: 88,
    progressColor: 'from-blue-500 to-purple-400',
    due: 'Due in 2 days',
    description: 'Elevating the portfolio with developer-immersive UI',
    subtasks: [{ text: 'Terminal neofetch About', done: true }, { text: 'Grafana metrics', done: true }, { text: 'Kanban board', done: false }],
  },
]

const DONE_CARDS: KanbanCard[] = [
  { title: 'Design System v3', labels: ['UI', 'Components'], completed: '2 days ago', description: 'Shipped a comprehensive design system with 40+ components' },
  { title: 'Payment Gateway Integration', labels: ['Backend', 'Stripe'], completed: '1 week ago', description: 'Integrated PayNow, GrabPay, and Stripe for seamless checkout' },
  { title: 'E-commerce Platform Launch', labels: ['Full-Stack', 'Production'], completed: '2 weeks ago', description: 'Full-stack e-commerce with 35% engagement increase' },
  { title: 'CI/CD Pipeline Optimization', labels: ['DevOps', 'GitHub Actions'], completed: '3 weeks ago', description: 'Reduced deploy time from 12min to 3min with parallel jobs' },
]

const FILTERS = ['All', 'My Tasks', 'High Priority', 'Urgent']

type ColType = 'backlog' | 'progress' | 'done'

const ACCENT = {
  backlog: { glow: 'rgba(100,116,139,0.15)', border: 'rgba(100,116,139,0.3)', text: 'text-slate-400', dot: 'bg-slate-400' },
  progress: { glow: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', text: 'text-blue-400', dot: 'bg-blue-400' },
  done: { glow: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: 'text-emerald-400', dot: 'bg-emerald-400' },
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function DragHandle() {
  return (
    <div className="absolute left-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col gap-[3px]">
      {[0, 1, 2].map(row => (
        <div key={row} className="flex gap-[3px]">
          <span className="w-[3px] h-[3px] rounded-full bg-white/20" />
          <span className="w-[3px] h-[3px] rounded-full bg-white/20" />
        </div>
      ))}
    </div>
  )
}

function PriorityIndicator({ priority }: { priority?: 'low' | 'medium' | 'high' }) {
  if (!priority) return null
  if (priority === 'low') return <span className="text-xs text-slate-500 font-mono">&mdash;</span>
  if (priority === 'medium') return <span className="text-xs text-amber-400 font-mono">&uarr;</span>
  return (
    <span className="text-xs text-red-400 font-mono relative">
      <span className="animate-pulse">&uarr;&uarr;</span>
      <span className="absolute inset-0 blur-sm text-red-400 animate-pulse">&uarr;&uarr;</span>
    </span>
  )
}

function Avatar() {
  return (
    <span className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white font-mono shrink-0 ring-2 ring-offset-1 ring-offset-slate-900 ring-emerald-500/50">
      LV
    </span>
  )
}

function ConfettiParticles({ active }: { active: boolean }) {
  if (!active) return null
  const particles = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 80,
    y: -(Math.random() * 60 + 20),
    color: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'][i],
  }))
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full"
          style={{ backgroundColor: p.color }}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{ opacity: 0, x: p.x, y: p.y, scale: 0.5 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

// ─── Card Component ──────────────────────────────────────────────────────────

function Card({ card, colType, index, expanded, onToggle }: {
  card: KanbanCard
  colType: ColType
  index: number
  expanded: boolean
  onToggle: () => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })
  const [confetti, setConfetti] = useState(false)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ rx: -y * 10, ry: x * 10 })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setTilt({ rx: 0, ry: 0 })
  }, [])

  const handleClick = () => {
    onToggle()
    if (colType === 'done' && !expanded) {
      setConfetti(true)
      setTimeout(() => setConfetti(false), 700)
    }
  }

  const accent = ACCENT[colType]
  const isFirst = index === 0 && colType === 'progress'

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' },
    }),
  }

  return (
    <motion.div
      ref={cardRef}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      layout
      className={`relative bg-white/[0.04] backdrop-blur-xl rounded-xl p-4 pl-6 border border-white/[0.06] cursor-pointer group transition-all duration-300 hover:bg-white/[0.08] hover:border-white/[0.12] ${isFirst ? 'kanban-active-glow' : ''}`}
      style={{
        transform: `perspective(800px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        transition: 'transform 0.15s ease-out, box-shadow 0.3s ease, background 0.3s ease, border-color 0.3s ease',
        boxShadow: tilt.rx !== 0 || tilt.ry !== 0 ? `0 4px 20px -4px ${accent.glow}` : 'none',
      }}
    >
      <DragHandle />
      <ConfettiParticles active={confetti} />

      {/* Title */}
      <p className={`text-sm font-medium ${colType === 'done' ? 'text-white/40 line-through' : 'text-white/90'}`}>
        {card.title}
      </p>

      {/* Progress bar (In Progress only) */}
      {card.progress !== undefined && (
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full bg-slate-800/80 overflow-hidden relative">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${card.progressColor}`}
              initial={{ width: 0 }}
              whileInView={{ width: `${card.progress}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3 }}
              style={{ boxShadow: `0 0 6px ${accent.border}` }}
            />
            <div className="absolute inset-0 kanban-shimmer" />
          </div>
          <span className={`text-[10px] font-mono ${accent.text}`}>{card.progress}%</span>
        </div>
      )}

      {/* Labels as minimal dots + text */}
      <div className="flex flex-wrap gap-3 mt-2.5">
        {card.labels.map(label => (
          <span key={label} className="flex items-center gap-1">
            <span
              className="w-[6px] h-[6px] rounded-full"
              style={{ backgroundColor: LABEL_DOT_COLORS[label] || '#64748b' }}
            />
            <span className="text-[11px] text-slate-400 font-mono">{label}</span>
          </span>
        ))}
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <PriorityIndicator priority={card.priority} />
          {card.due && <span className="text-[10px] text-slate-500 font-mono">{card.due}</span>}
          {card.completed && <span className="text-[10px] text-emerald-500/70 font-mono">&#10003; {card.completed}</span>}
        </div>
        <Avatar />
      </div>

      {/* Expandable detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-3">
              {card.description && (
                <p className="text-xs text-slate-400 font-mono leading-relaxed">{card.description}</p>
              )}
              {card.subtasks && card.subtasks.length > 0 && (
                <div className="space-y-1.5">
                  {card.subtasks.map((st, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[8px] ${st.done ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'border-white/10'}`}>
                        {st.done && '\u2713'}
                      </span>
                      <span className={`text-xs font-mono ${st.done ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                        {st.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2 pt-1">
                <Avatar />
                <span className="text-xs text-slate-400">Leo V.</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Column Component ────────────────────────────────────────────────────────

function Column({ title, cards, colType, count, delayIdx, expandedCard, setExpandedCard }: {
  title: string
  cards: KanbanCard[]
  colType: ColType
  count: number
  delayIdx: number
  expandedCard: string | null
  setExpandedCard: (t: string | null) => void
}) {
  const accent = ACCENT[colType]
  const columnVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { delay: delayIdx * 0.15, duration: 0.5, ease: 'easeOut' } },
  }

  return (
    <motion.div
      variants={columnVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className={`bg-white/[0.02] rounded-2xl p-4 border border-white/[0.04] transition-shadow duration-300 ${colType === 'progress' ? 'hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.15)]' : ''}`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-4 px-1 group/header">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${accent.dot}`} />
          <span className="text-sm font-semibold text-white">{title}</span>
        </div>
        <span className={`text-xs font-mono px-2.5 py-0.5 rounded-full bg-white/[0.06] ${accent.text} group-hover/header:scale-110 transition-transform`}>
          {count}
        </span>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {cards.map((card, i) => (
          <Card
            key={card.title}
            card={card}
            colType={colType}
            index={i}
            expanded={expandedCard === card.title}
            onToggle={() => setExpandedCard(expandedCard === card.title ? null : card.title)}
          />
        ))}
      </div>
    </motion.div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function KanbanBoard() {
  const [activeFilter, setActiveFilter] = useState(0)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  return (
    <>
      <style>{`
        @keyframes kanban-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .kanban-shimmer::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          animation: kanban-shimmer 2s infinite;
        }
        @keyframes kanban-glow-pulse {
          0%, 100% { box-shadow: inset 3px 0 0 rgba(59,130,246,0.2); }
          50% { box-shadow: inset 3px 0 0 rgba(59,130,246,0.6); }
        }
        .kanban-active-glow {
          animation: kanban-glow-pulse 2s ease-in-out infinite;
        }
      `}</style>

      <div className="bg-gradient-to-br from-slate-900/80 via-slate-950/90 to-slate-900/80 border border-white/5 rounded-3xl backdrop-blur-sm p-6 md:p-8">
        {/* Top bar — minimal toolbar */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">&#9889;</span>
            <span className="text-lg font-semibold text-white">Sprint Board</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs text-slate-400">7 active</span>
          </div>
        </div>

        {/* Gradient separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-5" />

        {/* Filter pills */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {FILTERS.map((pill, i) => (
            <button
              key={pill}
              onClick={() => setActiveFilter(i)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                i === activeFilter
                  ? 'bg-white/10 text-white border border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.05)]'
                  : 'text-slate-500 border border-transparent hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              {pill === 'Urgent' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5" />}
              {pill}
            </button>
          ))}
        </div>

        {/* Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          <Column
            title="Backlog"
            cards={BACKLOG_CARDS}
            colType="backlog"
            count={3}
            delayIdx={0}
            expandedCard={expandedCard}
            setExpandedCard={setExpandedCard}
          />
          <Column
            title="In Progress"
            cards={IN_PROGRESS_CARDS}
            colType="progress"
            count={3}
            delayIdx={1}
            expandedCard={expandedCard}
            setExpandedCard={setExpandedCard}
          />
          <Column
            title="Done"
            cards={DONE_CARDS}
            colType="done"
            count={4}
            delayIdx={2}
            expandedCard={expandedCard}
            setExpandedCard={setExpandedCard}
          />
        </div>

        {/* Keyboard hint */}
        <div className="flex justify-end mt-4">
          <span className="text-[10px] text-slate-600 border border-white/[0.04] rounded px-2 py-0.5 font-mono">
            Press K to open board
          </span>
        </div>
      </div>
    </>
  )
}
