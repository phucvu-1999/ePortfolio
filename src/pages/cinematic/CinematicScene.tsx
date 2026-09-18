// ─── Cinematic Scene — R3F hero scene for Portfolio 1 ───────────────────────
// Starfield, wireframe shapes and organic distort shapes with scroll parallax.
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'
import type { Mesh } from 'three'
import * as THREE from 'three'
import { scrollYProgress } from './CinematicChrome'

/* ═══════════════════════════════════════════════════════════════════════════
   3-D HERO SCENE — starfield, wireframes, distort shapes, lights
   ═══════════════════════════════════════════════════════════════════════════ */

function Starfield({ count = 400 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!)
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [count])

  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.y = clock.elapsedTime * 0.01
    ref.current.rotation.x = clock.elapsedTime * 0.005
  })

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial color="#ffffff" size={0.03} transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}

function WireShape({
  pos,
  kind,
  color,
  spd = 1,
  scrollFactor = 0,
}: {
  pos: [number, number, number]
  kind: 'torus' | 'ico' | 'octa' | 'dodeca' | 'tetra' | 'ring'
  color: string
  spd?: number
  scrollFactor?: number
}) {
  const ref = useRef<Mesh>(null!)
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.x += 0.002 * spd
    ref.current.rotation.y += 0.003 * spd
    ref.current.position.y =
      pos[1] +
      Math.sin(clock.elapsedTime * 0.4 * spd) * 0.3 +
      scrollYProgress * scrollFactor
  })
  return (
    <Float speed={1.4} rotationIntensity={0.35} floatIntensity={0.5}>
      <mesh ref={ref} position={pos}>
        {kind === 'torus' && <torusGeometry args={[1, 0.35, 16, 40]} />}
        {kind === 'ico' && <icosahedronGeometry args={[1.1, 0]} />}
        {kind === 'octa' && <octahedronGeometry args={[0.9, 0]} />}
        {kind === 'dodeca' && <dodecahedronGeometry args={[0.85, 0]} />}
        {kind === 'tetra' && <tetrahedronGeometry args={[0.8, 0]} />}
        {kind === 'ring' && <torusGeometry args={[0.7, 0.15, 8, 30]} />}
        <meshBasicMaterial color={color} wireframe transparent opacity={0.2} />
      </mesh>
    </Float>
  )
}

function DistortShape({
  pos,
  color,
  radius = 0.8,
  speed = 2,
  distort = 0.4,
}: {
  pos: [number, number, number]
  color: string
  radius?: number
  speed?: number
  distort?: number
}) {
  const ref = useRef<Mesh>(null!)
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.x = clock.elapsedTime * 0.1
    ref.current.rotation.z = clock.elapsedTime * 0.15
    ref.current.position.y = pos[1] + scrollYProgress * -3
  })
  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
      <mesh ref={ref} position={pos}>
        <icosahedronGeometry args={[radius, 4]} />
        <MeshDistortMaterial
          color={color}
          speed={speed}
          distort={distort}
          transparent
          opacity={0.15}
          wireframe
        />
      </mesh>
    </Float>
  )
}

export function HeroCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      style={{ position: 'absolute', inset: 0 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
    >
      {/* Ambient + colored point lights for depth */}
      <ambientLight intensity={0.15} />
      <pointLight position={[5, 5, 5]} intensity={0.3} color="#10b981" />
      <pointLight position={[-5, -3, 3]} intensity={0.2} color="#3b82f6" />
      <pointLight position={[0, -5, -3]} intensity={0.15} color="#8b5cf6" />

      <Starfield count={400} />

      {/* 6 wireframe shapes at different z-depths for parallax */}
      <WireShape pos={[-2.8, 1.2, 0]} kind="torus" color="#10b981" spd={1} scrollFactor={-2} />
      <WireShape pos={[2.6, -0.4, -1]} kind="ico" color="#3b82f6" spd={0.8} scrollFactor={-4} />
      <WireShape pos={[0.2, -1.8, -2]} kind="octa" color="#8b5cf6" spd={1.2} scrollFactor={-6} />
      <WireShape pos={[-1.2, 2.2, -1.5]} kind="dodeca" color="#f59e0b" spd={0.6} scrollFactor={-3} />
      <WireShape pos={[3.5, 2.0, -3]} kind="tetra" color="#ec4899" spd={0.9} scrollFactor={-8} />
      <WireShape pos={[-3.2, -1.6, -4]} kind="ring" color="#06b6d4" spd={0.5} scrollFactor={-10} />

      {/* 2 organic distort shapes */}
      <DistortShape pos={[1.5, 1.8, -2.5]} color="#10b981" radius={0.7} speed={2.5} distort={0.5} />
      <DistortShape pos={[-2.0, -0.8, -3.5]} color="#8b5cf6" radius={0.6} speed={1.8} distort={0.3} />
    </Canvas>
  )
}
