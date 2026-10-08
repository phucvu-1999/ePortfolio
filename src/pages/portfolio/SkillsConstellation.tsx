// ─── 3D Skills Constellation ─────────────────────────────────────────────────
// Immersive star-map of skills — each node is a glowing sphere in 3D space,
// connected by light-trail edges, color-coded by category.

import { Suspense, useMemo, useRef, useState, useCallback, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, Line, Billboard, Text } from '@react-three/drei'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Loader2, Sparkles } from 'lucide-react'
import * as THREE from 'three'

import { SKILLS_GRAPH, SKILL_CAT_COLORS, SKILL_CAT_LABELS } from './content'
import type { SkillCategory, SkillNode } from './content'

// ─── Constants ───────────────────────────────────────────────────────────────

const CAT_OFFSETS: Record<SkillCategory, [number, number]> = {
  frontend: [-3.5, 2.5],   // upper-left
  backend: [3.5, 2.5],     // upper-right
  devops: [-3.5, -2.5],    // lower-left
  design: [3.5, -2.5],     // lower-right
}

/** Deterministic pseudo-random from a seed (mulberry32). */
function seededRandom(seed: number) {
  let t = (seed + 0x6d2b79f5) | 0
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

/** Build deterministic 3D positions for each node. */
function buildPositions(nodes: SkillNode[]): Record<string, [number, number, number]> {
  const positions: Record<string, [number, number, number]> = {}
  const catIndex: Record<string, number> = {}
  nodes.forEach((node, i) => {
    const ci = catIndex[node.category] ?? 0
    catIndex[node.category] = ci + 1
    const [ox, oy] = CAT_OFFSETS[node.category]
    const r1 = seededRandom(i * 137 + 17)
    const r2 = seededRandom(i * 251 + 43)
    const r3 = seededRandom(i * 389 + 71)
    const spread = 2.2
    positions[node.id] = [
      ox + (r1 - 0.5) * spread,
      oy + (r2 - 0.5) * spread,
      (r3 - 0.5) * 2.5,
    ]
  })
  return positions
}

const NODE_POSITIONS = buildPositions(SKILLS_GRAPH.nodes)

// ─── 3D Skill Node ───────────────────────────────────────────────────────────

interface SkillSphereProps {
  node: SkillNode
  position: [number, number, number]
  color: string
  onSelect: (n: SkillNode) => void
}

function SkillSphere({ node, position, color, onSelect }: SkillSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const [hovered, setHovered] = useState(false)
  const baseScale = 0.12 + node.level * 0.06
  const targetScale = hovered ? baseScale * 1.5 : baseScale
  const col = useMemo(() => new THREE.Color(color), [color])

  useFrame((_state, delta) => {
    if (!meshRef.current) return
    const s = meshRef.current.scale.x
    const next = THREE.MathUtils.lerp(s, targetScale, Math.min(delta * 8, 1))
    meshRef.current.scale.setScalar(next)
    // gentle float
    meshRef.current.position.y =
      position[1] + Math.sin(Date.now() * 0.001 + position[0] * 2) * 0.06
  })

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = '' }}
      onClick={(e) => { e.stopPropagation(); onSelect(node) }}
    >
      <sphereGeometry args={[1, 24, 24]} />
      <meshStandardMaterial
        color={col}
        emissive={col}
        emissiveIntensity={hovered ? 2.5 : 1.2}
        roughness={0.3}
        metalness={0.4}
        toneMapped={false}
      />
      {/* Outer glow shell */}
      <mesh scale={1.6}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color={col} transparent opacity={hovered ? 0.22 : 0.08} />
      </mesh>
      {/* Label on hover */}
      {hovered && (
        <Billboard>
          <Text
            position={[0, 1.8, 0]}
            fontSize={0.6}
            color="white"
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.04}
            outlineColor="#000000"
          >
            {node.label}
          </Text>
        </Billboard>
      )}
    </mesh>
  )
}

// ─── Edge Line ───────────────────────────────────────────────────────────────

interface EdgeLineProps {
  from: [number, number, number]
  to: [number, number, number]
  colorA: string
  colorB: string
}

function EdgeLine({ from, to, colorA, colorB }: EdgeLineProps) {
  const cA = useMemo(() => new THREE.Color(colorA), [colorA])
  const cB = useMemo(() => new THREE.Color(colorB), [colorB])
  const blended = useMemo(() => {
    const c = cA.clone().lerp(cB, 0.5)
    return c.getStyle()
  }, [cA, cB])

  return (
    <Line
      points={[from, to]}
      color={blended}
      lineWidth={1}
      transparent
      opacity={0.25}
    />
  )
}

// ─── Scene ───────────────────────────────────────────────────────────────────

interface SceneProps {
  onSelect: (n: SkillNode) => void
}

function Scene({ onSelect }: SceneProps) {
  const controlsRef = useRef<any>(null)

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.15} />
      <pointLight position={[10, 10, 10]} intensity={0.6} />
      <pointLight position={[-10, -10, -5]} intensity={0.3} color="#8b5cf6" />

      {/* Starfield */}
      <Stars radius={60} depth={50} count={1500} factor={3} saturation={0.2} fade speed={0.8} />

      {/* Edges */}
      {SKILLS_GRAPH.edges.map(([fromId, toId], i) => {
        const from = NODE_POSITIONS[fromId]
        const to = NODE_POSITIONS[toId]
        if (!from || !to) return null
        const nodeA = SKILLS_GRAPH.nodes.find((n) => n.id === fromId)
        const nodeB = SKILLS_GRAPH.nodes.find((n) => n.id === toId)
        if (!nodeA || !nodeB) return null
        return (
          <EdgeLine
            key={`e-${i}`}
            from={from}
            to={to}
            colorA={SKILL_CAT_COLORS[nodeA.category]}
            colorB={SKILL_CAT_COLORS[nodeB.category]}
          />
        )
      })}

      {/* Nodes */}
      {SKILLS_GRAPH.nodes.map((node) => (
        <SkillSphere
          key={node.id}
          node={node}
          position={NODE_POSITIONS[node.id]}
          color={SKILL_CAT_COLORS[node.category]}
          onSelect={onSelect}
        />
      ))}

      {/* Controls */}
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        autoRotate
        autoRotateSpeed={0.4}
        minDistance={5}
        maxDistance={18}
      />
    </>
  )
}

// ─── Detail Panel (2D overlay) ───────────────────────────────────────────────

interface DetailPanelProps {
  node: SkillNode | null
  onClose: () => void
}

function DetailPanel({ node, onClose }: DetailPanelProps) {
  const connected = useMemo(() => {
    if (!node) return []
    return SKILLS_GRAPH.edges
      .filter(([a, b]) => a === node.id || b === node.id)
      .map(([a, b]) => (a === node.id ? b : a))
      .map((id) => SKILLS_GRAPH.nodes.find((n) => n.id === id))
      .filter(Boolean) as SkillNode[]
  }, [node])

  return (
    <AnimatePresence>
      {node && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute', inset: 0, zIndex: 20,
              background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
            }}
          />
          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 260 }}
            style={{
              position: 'absolute', right: 0, top: 0, bottom: 0, zIndex: 30,
              width: 'min(320px, 85vw)', background: 'rgba(15,15,25,0.95)',
              borderLeft: `2px solid ${SKILL_CAT_COLORS[node.category]}40`,
              padding: '24px 20px', overflowY: 'auto',
              display: 'flex', flexDirection: 'column', gap: '16px',
            }}
          >
            {/* Close */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute', top: 12, right: 12, background: 'none',
                border: 'none', color: '#888', cursor: 'pointer', padding: 4,
              }}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Title */}
            <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>
              {node.label}
            </h3>

            {/* Category badge */}
            <span
              style={{
                display: 'inline-block', padding: '3px 10px', borderRadius: 999,
                fontSize: '0.75rem', fontWeight: 600, width: 'fit-content',
                background: `${SKILL_CAT_COLORS[node.category]}22`,
                color: SKILL_CAT_COLORS[node.category],
                border: `1px solid ${SKILL_CAT_COLORS[node.category]}44`,
              }}
            >
              {SKILL_CAT_LABELS[node.category]}
            </span>

            {/* Level bar */}
            <div>
              <p style={{ color: '#aaa', fontSize: '0.8rem', margin: '0 0 6px' }}>
                Proficiency
              </p>
              <div style={{ display: 'flex', gap: 5 }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 28, height: 6, borderRadius: 3,
                      background: i < node.level
                        ? SKILL_CAT_COLORS[node.category]
                        : 'rgba(255,255,255,0.1)',
                      transition: 'background 0.3s',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Connected skills */}
            {connected.length > 0 && (
              <div>
                <p style={{ color: '#aaa', fontSize: '0.8rem', margin: '0 0 8px' }}>
                  Connected Skills
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {connected.map((c) => (
                    <span
                      key={c.id}
                      style={{
                        padding: '3px 10px', borderRadius: 6,
                        fontSize: '0.75rem', fontWeight: 500,
                        background: `${SKILL_CAT_COLORS[c.category]}18`,
                        color: SKILL_CAT_COLORS[c.category],
                        border: `1px solid ${SKILL_CAT_COLORS[c.category]}30`,
                      }}
                    >
                      {c.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Category Legend ──────────────────────────────────────────────────────────

function CategoryLegend() {
  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    SKILLS_GRAPH.nodes.forEach((n) => { c[n.category] = (c[n.category] || 0) + 1 })
    return c
  }, [])

  return (
    <div
      style={{
        display: 'flex', justifyContent: 'center', flexWrap: 'wrap',
        gap: '12px 20px', padding: '12px 0',
      }}
    >
      {(Object.keys(SKILL_CAT_LABELS) as SkillCategory[]).map((cat) => (
        <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 10, height: 10, borderRadius: '50%',
              background: SKILL_CAT_COLORS[cat],
              boxShadow: `0 0 6px ${SKILL_CAT_COLORS[cat]}88`,
            }}
          />
          <span style={{ color: '#ccc', fontSize: '0.8rem', fontWeight: 500 }}>
            {SKILL_CAT_LABELS[cat]}
          </span>
          <span style={{ color: '#666', fontSize: '0.7rem' }}>({counts[cat] ?? 0})</span>
        </div>
      ))}
    </div>
  )
}

// ─── Spinner fallback ────────────────────────────────────────────────────────

function CanvasSpinner() {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100%', color: '#666',
      }}
    >
      <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ─── 2D Fallback (mobile / prefers-reduced-motion) ───────────────────────────

function FlatSkillsGrid() {
  const grouped = useMemo(() => {
    const g: Record<SkillCategory, SkillNode[]> = {
      frontend: [], backend: [], devops: [], design: [],
    }
    SKILLS_GRAPH.nodes.forEach((n) => g[n.category].push(n))
    return g
  }, [])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
      {(Object.keys(grouped) as SkillCategory[]).map((cat) => (
        <div
          key={cat}
          style={{
            background: `${SKILL_CAT_COLORS[cat]}08`,
            border: `1px solid ${SKILL_CAT_COLORS[cat]}22`,
            borderRadius: 12, padding: '16px 18px',
          }}
        >
          <h4
            style={{
              margin: '0 0 10px', fontSize: '0.85rem', fontWeight: 700,
              color: SKILL_CAT_COLORS[cat], display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <span
              style={{
                width: 8, height: 8, borderRadius: '50%',
                background: SKILL_CAT_COLORS[cat],
                boxShadow: `0 0 6px ${SKILL_CAT_COLORS[cat]}88`,
              }}
            />
            {SKILL_CAT_LABELS[cat]}
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {grouped[cat].map((n) => (
              <span
                key={n.id}
                style={{
                  padding: '4px 10px', borderRadius: 6,
                  fontSize: '0.75rem', fontWeight: 500,
                  background: `${SKILL_CAT_COLORS[cat]}14`,
                  color: SKILL_CAT_COLORS[cat],
                  border: `1px solid ${SKILL_CAT_COLORS[cat]}28`,
                }}
              >
                {n.label}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function SkillsConstellation() {
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null)
  const [useFallback, setUseFallback] = useState(false)

  // Detect reduced motion or small viewport
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const checkFallback = () => setUseFallback(mq.matches || window.innerWidth < 768)
    checkFallback()
    mq.addEventListener('change', checkFallback)
    window.addEventListener('resize', checkFallback)
    return () => {
      mq.removeEventListener('change', checkFallback)
      window.removeEventListener('resize', checkFallback)
    }
  }, [])

  const handleSelect = useCallback((n: SkillNode) => setSelectedNode(n), [])
  const handleClose = useCallback(() => setSelectedNode(null), [])

  return (
    <section style={{ position: 'relative', width: '100%' }}>
      {/* Section heading */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 12, color: '#e2e8f0',
        }}
      >
        <Sparkles size={18} style={{ color: '#8b5cf6' }} />
        <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>
          Skills Constellation
        </h2>
      </div>

      {useFallback ? (
        <FlatSkillsGrid />
      ) : (
        <div
          style={{
            position: 'relative', width: '100%',
            height: 'clamp(350px, 40vw, 450px)',
            borderRadius: 16, overflow: 'hidden',
            background: '#0a0a0f',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Suspense fallback={<CanvasSpinner />}>
            <Canvas
              camera={{ position: [0, 0, 12], fov: 50 }}
              gl={{ antialias: true, alpha: false }}
              style={{ background: '#0a0a0f' }}
              onPointerMissed={() => setSelectedNode(null)}
            >
              <Scene onSelect={handleSelect} />
            </Canvas>
          </Suspense>

          {/* Detail panel overlay */}
          <DetailPanel node={selectedNode} onClose={handleClose} />
        </div>
      )}

      {/* Category legend */}
      <CategoryLegend />
    </section>
  )
}
