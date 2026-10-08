// ─── Android Fleet — 3D Device Showcase ──────────────────────────────────────
// Interactive 3D scene showing every Android form factor running V5 POS:
// phone (POS), tablet (kiosk), small screen (KDS), and handheld (Stock Take).
import { Suspense, useState, useRef, useEffect } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { Float, Text, RoundedBox, PresentationControls, Environment } from '@react-three/drei'
import { TextureLoader, type Mesh } from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Smartphone, Tablet, Monitor, ScanBarcode } from 'lucide-react'

// ── Device data ──────────────────────────────────────────────────────────────
interface DeviceInfo {
  id: string
  name: string
  platform: string
  texture: string
  features: string[]
  tech: string[]
  /** 3D dimensions [w, h, d] */
  size: [number, number, number]
  /** 3D position [x, y, z] */
  position: [number, number, number]
  color: string
  icon: typeof Smartphone
}

const DEVICES: DeviceInfo[] = [
  {
    id: 'epos_pos_android',
    name: 'Android POS',
    platform: 'Android Phone',
    texture: '/epos/epos.png',
    features: ['Full POS on Android', 'Shared core with Windows', 'Offline-first SQLite', 'Multi-tender checkout'],
    tech: ['.NET MAUI', 'gRPC', 'SQLite', 'Shared Core'],
    size: [1.6, 2.8, 0.12],
    position: [-2.6, 0.3, 0],
    color: '#10b981',
    icon: Smartphone,
  },
  {
    id: 'epos_kiosk_android',
    name: 'Self-Service Kiosk',
    platform: 'Android Tablet 10″',
    texture: '/epos/welcome_screen.png',
    features: ['Customer-facing ordering', '10″ tablet optimized', 'Same promotion engine', 'gRPC order sync'],
    tech: ['Kotlin', 'Jetpack Compose', 'gRPC', 'epos_client_lib'],
    size: [2.4, 3.4, 0.12],
    position: [-0.2, -0.1, 0.6],
    color: '#3b82f6',
    icon: Tablet,
  },
  {
    id: 'epos_kitchen_display',
    name: 'Kitchen Display',
    platform: 'Android Tablet',
    texture: '/epos/food_delivery.png',
    features: ['gRPC streaming orders', 'Bump-to-complete workflow', 'Priority routing', 'Multi-station support'],
    tech: ['Kotlin', 'gRPC Streaming', 'Room DB', 'Flow/Coroutines'],
    size: [2.2, 1.5, 0.1],
    position: [2.6, 0.6, 0.2],
    color: '#8b5cf6',
    icon: Monitor,
  },
  {
    id: 'epos_stocktake',
    name: 'Stock Take',
    platform: 'Android Handheld',
    texture: '/epos/offline_sync.png',
    features: ['Barcode scanning', 'Batch counting', 'Offline sync queue', 'Inventory reconciliation'],
    tech: ['Kotlin', 'CameraX', 'SQLite', 'WorkManager'],
    size: [1.4, 2.4, 0.12],
    position: [3.0, -1.2, -0.4],
    color: '#f59e0b',
    icon: ScanBarcode,
  },
]

const METRICS = [
  { value: '4', label: 'Android Apps' },
  { value: '3', label: 'Platforms' },
  { value: '1', label: 'Shared Core Library' },
  { value: 'gRPC', label: 'Streaming' },
]

// ── 3D Device Component ──────────────────────────────────────────────────────
function Device({
  device,
  onSelect,
}: {
  device: DeviceInfo
  onSelect: (d: DeviceInfo) => void
}) {
  const meshRef = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const texture = useLoader(TextureLoader, device.texture)

  useFrame((_state, delta) => {
    if (!meshRef.current) return
    if (hovered) {
      meshRef.current.scale.lerp({ x: 1.08, y: 1.08, z: 1.08 } as never, delta * 5)
    } else {
      meshRef.current.scale.lerp({ x: 1, y: 1, z: 1 } as never, delta * 5)
    }
  })

  return (
    <Float speed={1.8} rotationIntensity={0.3} floatIntensity={0.6}>
      <group position={device.position}>
        <mesh
          ref={meshRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={(e) => {
            e.stopPropagation()
            onSelect(device)
          }}
        >
          <RoundedBox
            args={device.size}
            radius={0.08}
            smoothness={4}
          >
            <meshStandardMaterial
              color={hovered ? device.color : '#1e293b'}
              metalness={0.3}
              roughness={0.6}
            />
          </RoundedBox>
        </mesh>
        {/* Screen face */}
        <mesh position={[0, 0, device.size[2] / 2 + 0.001]}>
          <planeGeometry args={[device.size[0] * 0.85, device.size[1] * 0.82]} />
          <meshBasicMaterial map={texture} />
        </mesh>
        {/* Device label */}
        <Text
          position={[0, -(device.size[1] / 2 + 0.25), 0]}
          fontSize={0.2}
          color={device.color}
          anchorX="center"
          anchorY="top"
          font={undefined}
        >
          {device.name}
        </Text>
      </group>
    </Float>
  )
}

// ── Scene ────────────────────────────────────────────────────────────────────
function Scene({ onSelect }: { onSelect: (d: DeviceInfo) => void }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-3, 2, 4]} intensity={0.4} color="#10b981" />
      <Environment preset="city" />
      <PresentationControls
        global
        rotation={[0.05, 0.1, 0]}
        polar={[-0.2, 0.2]}
        azimuth={[-0.6, 0.6]}
        speed={1.4}
        zoom={0.9}
      >
        {DEVICES.map((d) => (
          <Device key={d.id} device={d} onSelect={onSelect} />
        ))}
      </PresentationControls>
    </>
  )
}

// ── Loading fallback ─────────────────────────────────────────────────────────
function CanvasFallback() {
  return (
    <div className="flex items-center justify-center h-[400px] rounded-2xl border border-slate-700/50 bg-slate-900/60">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 mx-auto border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        <p className="font-mono text-xs text-slate-500">Loading 3D fleet…</p>
      </div>
    </div>
  )
}

// ── Reduced-motion flat fallback ─────────────────────────────────────────────
function FlatFallback({ onSelect }: { onSelect: (d: DeviceInfo) => void }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {DEVICES.map((d) => {
        const Icon = d.icon
        return (
          <button
            key={d.id}
            onClick={() => onSelect(d)}
            className="group rounded-xl border border-slate-700/60 bg-slate-900/40 p-4 text-center transition-all hover:border-slate-500/70 hover:-translate-y-1"
            style={{ '--accent': d.color } as React.CSSProperties}
          >
            <div className="w-full aspect-[3/4] rounded-lg overflow-hidden mb-3 border border-slate-700/40 bg-slate-800/50">
              <img src={d.texture} alt={d.name} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <Icon size={16} className="mx-auto mb-1" style={{ color: d.color }} />
            <p className="font-mono text-xs font-semibold" style={{ color: d.color }}>{d.name}</p>
            <p className="font-mono text-[10px] text-slate-500 mt-0.5">{d.platform}</p>
          </button>
        )
      })}
    </div>
  )
}

// ── Info Panel (2D overlay) ──────────────────────────────────────────────────
function InfoPanel({ device, onClose }: { device: DeviceInfo; onClose: () => void }) {
  const Icon = device.icon
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl border overflow-hidden"
        style={{ borderColor: `${device.color}40`, background: '#0d1117' }}
      >
        {/* Header image */}
        <div className="h-44 relative overflow-hidden">
          <img src={device.texture} alt={device.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 text-white/80 hover:text-white transition-colors"
            aria-label="Close panel"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 pb-5 -mt-8 relative">
          {/* Name + platform */}
          <div className="flex items-center gap-2.5 mb-3">
            <span
              className="flex items-center justify-center w-10 h-10 rounded-xl"
              style={{ background: `${device.color}20`, border: `1px solid ${device.color}40`, color: device.color }}
            >
              <Icon size={20} />
            </span>
            <div>
              <h3 className="font-mono text-lg font-bold" style={{ color: device.color }}>{device.name}</h3>
              <p className="font-mono text-[11px] text-slate-500">{device.platform}</p>
            </div>
          </div>

          {/* Features */}
          <p className="font-mono text-[9.5px] uppercase tracking-widest text-slate-500 mb-2">Features</p>
          <ul className="space-y-1.5 mb-4">
            {device.features.map((f) => (
              <li key={f} className="flex items-start gap-2 font-mono text-xs text-slate-300">
                <span className="mt-0.5 shrink-0" style={{ color: device.color }}>▸</span>
                {f}
              </li>
            ))}
          </ul>

          {/* Tech stack badges */}
          <p className="font-mono text-[9.5px] uppercase tracking-widest text-slate-500 mb-2">Tech Stack</p>
          <div className="flex flex-wrap gap-1.5">
            {device.tech.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-md font-mono text-[10.5px] border"
                style={{ color: device.color, borderColor: `${device.color}35`, background: `${device.color}0d` }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function AndroidFleet() {
  const [selected, setSelected] = useState<DeviceInfo | null>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      aria-label="Android device fleet"
    >
      {/* ── 3D Canvas or flat fallback ── */}
      {prefersReducedMotion ? (
        <FlatFallback onSelect={setSelected} />
      ) : (
        <div className="rounded-2xl border border-slate-700/50 overflow-hidden" style={{ background: '#0a0f18' }}>
          <Suspense fallback={<CanvasFallback />}>
            <Canvas
              style={{ height: 400 }}
              camera={{ position: [0, 0, 8], fov: 42 }}
              dpr={[1, 1.5]}
            >
              <Scene onSelect={setSelected} />
            </Canvas>
          </Suspense>
          <p className="text-center font-mono text-[10px] text-slate-600 py-2.5">
            drag to orbit · click a device to inspect
          </p>
        </div>
      )}

      {/* ── Metrics strip ── */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        {METRICS.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            className="rounded-lg border border-slate-700/50 bg-slate-900/40 px-3 py-2.5 text-center"
          >
            <p className="font-mono text-base font-bold text-emerald-400">{m.value}</p>
            <p className="font-mono text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">{m.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Detail overlay ── */}
      <AnimatePresence>
        {selected && <InfoPanel device={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </motion.section>
  )
}
