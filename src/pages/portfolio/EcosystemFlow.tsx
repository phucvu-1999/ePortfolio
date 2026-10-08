// ─── Ecosystem Flow — EPOS V5 Architecture Diagram ─────────────────────────
// Animated interactive flow diagram showing the complete EPOS V5 ecosystem:
// how POS, Kiosk, KDS, Stock Take, Customer Display, Core Service, and
// third-party integrations all connect and communicate via gRPC, streaming,
// webhooks and offline sync.
import { useState, useMemo, type FC } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Monitor, Tablet, Flame, ScanLine, MonitorPlay, Package,
  Database, Truck, BarChart3, Shield, X,
} from 'lucide-react'

/* ── Types ────────────────────────────────────────────────────────────────── */
interface EcoNode {
  id: string; label: string; platform: string
  desc: string; protocol: string; features: string[]
  icon: FC<{ size?: number }>
  color: string; x: number; y: number; large?: boolean
}
interface Link {
  from: string; to: string
  type: 'grpc' | 'stream' | 'webhook' | 'sync' | 'internal'
  label: string; bidi?: boolean
}

/* ── Nodes ────────────────────────────────────────────────────────────────── */
const NODES: EcoNode[] = [
  {
    id: 'core', label: 'Core Service', platform: 'gRPC Backend · 40+ Endpoints',
    desc: 'The gRPC backend powering the entire ecosystem — 40+ service endpoints',
    protocol: 'gRPC / REST',
    features: ['Orders, Products, Inventory, Payments, Members', 'KDS streaming via StreamServiceImpl', 'Promotion engine with combo & discount', 'Hangfire background jobs & scheduling'],
    icon: Shield, color: '#8b5cf6', x: 50, y: 38, large: true,
  },
  {
    id: 'pos', label: 'POS Terminal', platform: 'Windows · WPF',
    desc: 'Full-featured point-of-sale on Windows — sale, payment, receipt, shift management',
    protocol: 'gRPC bidirectional',
    features: ['20+ payment methods', 'Offline-first with SQLite', 'Receipt printing', 'Shift & cashbox management'],
    icon: Monitor, color: '#3b82f6', x: 8, y: 38,
  },
  {
    id: 'kiosk', label: 'Self-Service Kiosk', platform: 'Android · Touch',
    desc: 'Customer-facing self-service ordering on 10″ Android tablet',
    protocol: 'gRPC bidirectional',
    features: ['Touch-to-order UI', 'Same promotion engine as POS', 'QR payment integration', 'Offline queue'],
    icon: Tablet, color: '#06b6d4', x: 20, y: 6,
  },
  {
    id: 'kds', label: 'Kitchen Display', platform: 'Android · gRPC Stream',
    desc: 'Real-time order display for kitchen staff — orders appear instantly via streaming',
    protocol: 'gRPC Server Streaming',
    features: ['Server-push via StreamServiceImpl', 'Multi-station routing', 'Bump-to-complete workflow', 'Priority ordering'],
    icon: Flame, color: '#f97316', x: 90, y: 26,
  },
  {
    id: 'stock', label: 'Stock Take', platform: 'Android · Batch Sync',
    desc: 'Barcode-scanning inventory app on Android — count, detect discrepancies, batch sync',
    protocol: 'gRPC batch sync',
    features: ['Camera barcode scanning', 'Offline counting with SQLite', 'Batch reconciliation', 'Discrepancy alerts'],
    icon: ScanLine, color: '#84cc16', x: 10, y: 78,
  },
  {
    id: 'cds', label: 'Customer Display', platform: 'Windows · Local',
    desc: 'Second screen showing order info and promotional content to customers',
    protocol: 'Local WPF connection',
    features: ['Live order mirror', 'Ad/promo rotation', 'Separate GPU for smooth playback', 'Dual-display architecture'],
    icon: MonitorPlay, color: '#10b981', x: 88, y: 66,
  },
  {
    id: 'warehouse', label: 'Warehouse', platform: 'Windows · Inventory',
    desc: 'Warehouse management for inventory tracking, purchase orders and logistics',
    protocol: 'gRPC bidirectional',
    features: ['Inventory management', 'Stock level monitoring', 'Purchase order sync', 'Multi-location support'],
    icon: Package, color: '#f59e0b', x: 26, y: 86,
  },
  {
    id: 'db', label: 'PostgreSQL', platform: 'Database',
    desc: 'Primary relational database storing all transactional and master data',
    protocol: 'TCP / Connection Pool',
    features: ['ACID transactions', 'Full-text search', 'Connection pooling via Npgsql', 'Automated backups'],
    icon: Database, color: '#3b82f6', x: 34, y: 64,
  },
  {
    id: 'webhook', label: 'Foodpanda · Hawk', platform: 'Webhooks · HMAC',
    desc: 'Third-party food delivery orders flowing into the kitchen automatically',
    protocol: 'HMAC-SHA256 webhooks',
    features: ['Auto-route to kitchen', 'Order validation & mapping', 'Menu sync', 'Status callbacks'],
    icon: Truck, color: '#ec4899', x: 84, y: 4,
  },
  {
    id: 'sls', label: 'Aliyun SLS', platform: 'Telemetry',
    desc: 'Centralized log service for monitoring, alerting and telemetry pipeline',
    protocol: 'HTTPS push',
    features: ['Structured logging', 'Real-time dashboards', 'Alert rules & escalation', 'Log retention policies'],
    icon: BarChart3, color: '#64748b', x: 66, y: 64,
  },
]

/* ── Connections ──────────────────────────────────────────────────────────── */
const LINKS: Link[] = [
  { from: 'pos',       to: 'core', type: 'grpc',     label: 'gRPC',        bidi: true },
  { from: 'kiosk',     to: 'core', type: 'grpc',     label: 'gRPC',        bidi: true },
  { from: 'stock',     to: 'core', type: 'sync',     label: 'SQLite Sync', bidi: true },
  { from: 'warehouse', to: 'core', type: 'grpc',     label: 'gRPC',        bidi: true },
  { from: 'core',      to: 'kds',  type: 'stream',   label: 'Stream',      bidi: false },
  { from: 'core',      to: 'cds',  type: 'grpc',     label: 'Local',       bidi: false },
  { from: 'webhook',   to: 'core', type: 'webhook',  label: 'Webhook',     bidi: false },
  { from: 'core',      to: 'db',   type: 'internal', label: 'TCP',         bidi: true },
  { from: 'core',      to: 'sls',  type: 'internal', label: 'Telemetry',   bidi: false },
]

/* ── Link visual config ──────────────────────────────────────────────────── */
const LCFG: Record<Link['type'], { stroke: string; dash: string; w: number; dur: string }> = {
  grpc:     { stroke: '#3b82f6', dash: '6 10',  w: 2,   dur: '1.8s' },
  stream:   { stroke: '#10b981', dash: '12 8',  w: 3,   dur: '1.2s' },
  webhook:  { stroke: '#ec4899', dash: '4 8',   w: 2,   dur: '2s'   },
  sync:     { stroke: '#f59e0b', dash: '3 8',   w: 2,   dur: '2.2s' },
  internal: { stroke: '#475569', dash: '2 6',   w: 1.5, dur: '3s'   },
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */
const NM = new Map(NODES.map(n => [n.id, n]))
const nodeOf = (id: string) => NM.get(id)!

function neighborsOf(id: string) {
  const s = new Set<string>()
  for (const l of LINKS) {
    if (l.from === id) s.add(l.to)
    if (l.to === id) s.add(l.from)
  }
  return s
}

function linkInvolves(l: Link, id: string) {
  return l.from === id || l.to === id
}

/* ── FlowNode ─────────────────────────────────────────────────────────────── */
function FlowNode({ node, idx, hovered, connSet, onHover, onClick }: {
  node: EcoNode; idx: number; hovered: string | null
  connSet: Set<string> | null
  onHover: (id: string | null) => void; onClick: (id: string) => void
}) {
  const Icon = node.icon
  const isDimmed = hovered !== null && hovered !== node.id && connSet !== null && !connSet.has(node.id)
  const isHighlighted = hovered === node.id

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, y: 12 }}
      animate={{ opacity: isDimmed ? 0.25 : 1, scale: 1, y: 0 }}
      transition={{ delay: 0.15 + idx * 0.07, duration: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
      whileHover={{ scale: 1.08 }}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(node.id)}
      style={{
        position: 'absolute', left: `${node.x}%`, top: `${node.y}%`,
        transform: 'translate(-50%,-50%)', zIndex: isHighlighted ? 20 : 10,
        cursor: 'pointer', userSelect: 'none',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: node.large ? 12 : 8,
        padding: node.large ? '14px 20px' : '10px 14px',
        borderRadius: 14,
        background: `${node.color}12`,
        border: `1.5px solid ${isHighlighted ? node.color : node.color + '40'}`,
        boxShadow: isHighlighted ? `0 0 24px ${node.color}30` : 'none',
        backdropFilter: 'blur(12px)',
        transition: 'border-color .3s, box-shadow .3s',
        whiteSpace: 'nowrap',
      }}>
        <div style={{
          width: node.large ? 40 : 32, height: node.large ? 40 : 32,
          borderRadius: 10, display: 'grid', placeItems: 'center',
          background: `${node.color}20`, flexShrink: 0,
        }}>
          <Icon size={node.large ? 22 : 16} />
        </div>
        <div>
          <div style={{
            fontSize: node.large ? 14 : 12, fontWeight: 600,
            color: '#f1f5f9', lineHeight: 1.2,
          }}>{node.label}</div>
          <div style={{
            fontSize: 10, color: node.color, fontFamily: 'ui-monospace, monospace',
            marginTop: 2, opacity: 0.9, lineHeight: 1.2,
          }}>{node.platform}</div>
        </div>
      </div>
      {/* Pulse ring for core service */}
      {node.large && (
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', inset: -6, borderRadius: 20,
            border: `2px solid ${node.color}40`, pointerEvents: 'none',
          }}
        />
      )}
    </motion.div>
  )
}

/* ── Connection SVG layer ─────────────────────────────────────────────────── */
function Connections({ hovered }: { hovered: string | null }) {
  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {LINKS.map((l, i) => {
        const a = nodeOf(l.from)
        const b = nodeOf(l.to)
        const cfg = LCFG[l.type]
        const involved = hovered ? linkInvolves(l, hovered) : true
        const dashTotal = cfg.dash.split(' ').reduce((s, v) => s + Number(v), 0)

        return (
          <line
            key={i}
            x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke={cfg.stroke}
            strokeWidth={cfg.w}
            strokeDasharray={cfg.dash}
            vectorEffect="non-scaling-stroke"
            opacity={hovered ? (involved ? 0.85 : 0.08) : 0.45}
            style={{ transition: 'opacity .3s' }}
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0" to={String(-dashTotal)}
              dur={cfg.dur}
              repeatCount="indefinite"
            />
          </line>
        )
      })}
    </svg>
  )
}

/* ── Connection labels ────────────────────────────────────────────────────── */
function ConnectionLabels({ hovered }: { hovered: string | null }) {
  return (
    <>
      {LINKS.map((l, i) => {
        const a = nodeOf(l.from)
        const b = nodeOf(l.to)
        const mx = (a.x + b.x) / 2
        const my = (a.y + b.y) / 2
        const involved = hovered ? linkInvolves(l, hovered) : true
        return (
          <div key={i} style={{
            position: 'absolute', left: `${mx}%`, top: `${my}%`,
            transform: 'translate(-50%,-50%)',
            fontSize: 9, fontFamily: 'ui-monospace, monospace',
            color: LCFG[l.type].stroke, padding: '2px 6px',
            borderRadius: 4, background: '#0f172a', whiteSpace: 'nowrap',
            border: `1px solid ${LCFG[l.type].stroke}30`,
            opacity: hovered ? (involved ? 0.95 : 0.1) : 0.7,
            transition: 'opacity .3s', pointerEvents: 'none', zIndex: 5,
          }}>
            {l.label}{l.bidi ? ' ↔' : ' →'}
          </div>
        )
      })}
    </>
  )
}

/* ── Info panel (slide-in) ────────────────────────────────────────────────── */
function InfoPanel({ node, onClose }: { node: EcoNode; onClose: () => void }) {
  const Icon = node.icon
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      style={{
        position: 'absolute', top: 16, right: 16, width: 300,
        background: '#0f172aee', border: `1px solid ${node.color}40`,
        borderRadius: 16, padding: 24, zIndex: 50,
        backdropFilter: 'blur(16px)',
        boxShadow: `0 8px 40px ${node.color}18`,
      }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 12, right: 12, background: 'none',
          border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4,
        }}
      ><X size={16} /></button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${node.color}20`, display: 'grid', placeItems: 'center',
        }}>
          <Icon size={24} />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>{node.label}</div>
          <div style={{
            fontSize: 11, color: node.color,
            fontFamily: 'ui-monospace, monospace',
          }}>{node.platform}</div>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.5, margin: '0 0 16px' }}>
        {node.desc}
      </p>

      {/* Protocol badge */}
      <div style={{
        display: 'inline-block', padding: '4px 10px', borderRadius: 6,
        background: `${node.color}18`, border: `1px solid ${node.color}30`,
        fontSize: 11, fontFamily: 'ui-monospace, monospace', color: node.color,
        marginBottom: 16,
      }}>
        {node.protocol}
      </div>

      {/* Features */}
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {node.features.map((f, i) => (
          <li key={i} style={{
            fontSize: 12, color: '#94a3b8', padding: '5px 0',
            borderTop: i > 0 ? '1px solid #1e293b' : 'none',
            display: 'flex', alignItems: 'baseline', gap: 8,
          }}>
            <span style={{ color: node.color, fontSize: 8, flexShrink: 0 }}>●</span>
            {f}
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

/* ── Legend ────────────────────────────────────────────────────────────────── */
const LEGEND: { type: Link['type']; label: string }[] = [
  { type: 'grpc',     label: 'gRPC Bidirectional' },
  { type: 'stream',   label: 'gRPC Server Streaming' },
  { type: 'webhook',  label: 'HMAC Webhook' },
  { type: 'sync',     label: 'SQLite Offline Sync' },
  { type: 'internal', label: 'Internal / Infra' },
]

function Legend() {
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: '10px 20px',
      justifyContent: 'center', padding: '16px 0 0',
    }}>
      {LEGEND.map(({ type, label }) => {
        const cfg = LCFG[type]
        return (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width={28} height={4} viewBox="0 0 28 4">
              <line
                x1={0} y1={2} x2={28} y2={2}
                stroke={cfg.stroke} strokeWidth={cfg.w}
                strokeDasharray={cfg.dash}
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="0"
                  to={String(-cfg.dash.split(' ').reduce((s, v) => s + Number(v), 0))}
                  dur={cfg.dur}
                  repeatCount="indefinite"
                />
              </line>
            </svg>
            <span style={{
              fontSize: 11, color: '#94a3b8',
              fontFamily: 'ui-monospace, monospace',
            }}>{label}</span>
          </div>
        )
      })}
    </div>
  )
}

/* ── Main ─────────────────────────────────────────────────────────────────── */
export default function EcosystemFlow() {
  const [hovered, setHovered] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)

  const connSet = useMemo(
    () => (hovered ? neighborsOf(hovered) : null),
    [hovered],
  )

  const activeNode = selected ? NM.get(selected) ?? null : null

  const handleClick = (id: string) =>
    setSelected(prev => (prev === id ? null : id))

  return (
    <section style={{ padding: '64px 0' }}>
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: 32 }}
      >
        <h2 style={{
          fontSize: 28, fontWeight: 800, color: '#f1f5f9',
          margin: '0 0 8px', letterSpacing: '-0.02em',
        }}>
          System Architecture
        </h2>
        <p style={{
          fontSize: 14, color: '#64748b', margin: 0,
          fontFamily: 'ui-monospace, monospace',
        }}>
          How every device and service connects — tap a node to explore
        </p>
      </motion.div>

      {/* Diagram container */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: 1100,
        margin: '0 auto', aspectRatio: '16 / 9', minHeight: 480,
        background: '#0f172a60', borderRadius: 20,
        border: '1px solid #1e293b', overflow: 'hidden',
      }}>
        {/* Connection lines (SVG) */}
        <Connections hovered={hovered} />

        {/* Connection labels */}
        <ConnectionLabels hovered={hovered} />

        {/* Nodes */}
        {NODES.map((node, i) => (
          <FlowNode
            key={node.id}
            node={node}
            idx={i}
            hovered={hovered}
            connSet={connSet}
            onHover={setHovered}
            onClick={handleClick}
          />
        ))}

        {/* Info panel */}
        <AnimatePresence>
          {activeNode && (
            <InfoPanel
              key={activeNode.id}
              node={activeNode}
              onClose={() => setSelected(null)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <Legend />
    </section>
  )
}
