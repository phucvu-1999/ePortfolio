// ─── Cinematic Sections B — Works · Skills ──────────────────────────────────
// Portfolio 1 (Cinematic Scroll).
// Works: pinned horizontal scroll with perspective tilt cards that link to
// their case studies. Skills: orbital ring display with connection lines.
import { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { Star, ArrowUpRight } from 'lucide-react'
import { PROJECTS, SKILLS_GRAPH, SKILL_CAT_COLORS, SKILL_CAT_LABELS } from '../portfolio/content'
import type { SkillCategory, Project } from '../portfolio/content'
import { reducedMotion, isMobileQuery, SplitReveal } from './CinematicChrome'

/* ═══════════════════════════════════════════════════════════════════════════
   4. PROJECTS — perspective tilt cards, gradient overlay, case-study links
   ═══════════════════════════════════════════════════════════════════════════ */

function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = useCallback((e: React.MouseEvent) => {
    if (reducedMotion() || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    gsap.to(ref.current, { rotateY: px * 8, rotateX: -py * 8, duration: 0.4, ease: 'power2.out' })
  }, [])

  const onLeave = useCallback(() => {
    if (!ref.current) return
    gsap.to(ref.current, { rotateY: 0, rotateX: 0, duration: 0.7, ease: 'elastic.out(1,0.5)' })
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{ perspective: '800px', transformStyle: 'preserve-3d' }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false)
  const hasCase = !!project.caseStudy

  const card = (
    <div
      className="group relative flex h-[70vh] flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.04] bg-white/[0.02] p-10 transition-all duration-700 hover:border-white/10 hover:bg-white/[0.04] md:p-14"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Gradient overlay on hover */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `linear-gradient(135deg, ${project.color}10 0%, transparent 50%, ${project.color}08 100%)`,
        }}
      />

      <div className="relative z-10">
        {project.featured && (
          <span
            className="mb-4 inline-block rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider"
            style={{ backgroundColor: project.color + '18', color: project.color }}
          >
            Featured
          </span>
        )}

        <h3
          className="font-bold tracking-tight text-white"
          style={{ fontSize: 'clamp(1.5rem, 3vw, 3rem)' }}
        >
          {project.title}
        </h3>

        <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/45 md:text-base">
          {project.desc}
        </p>

        {/* Tags */}
        <div className="mt-6 flex flex-wrap gap-2">
          {project.tags.map((t) => (
            <span
              key={t}
              className="rounded border border-white/8 bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] text-white/50"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Case study metrics revealed on hover */}
        {hovered && project.caseStudy?.metrics && (
          <div className="mt-6 grid grid-cols-2 gap-3">
            {project.caseStudy.metrics.slice(0, 4).map((m, i) => (
              <div key={i} className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
                <span className="block text-sm font-bold" style={{ color: project.color }}>
                  {m.value}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-white/30">
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer: stars + case study CTA */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-white/30">
          <Star size={14} />
          <span className="font-mono text-sm">{project.stars}</span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider opacity-0 transition-all duration-500 group-hover:opacity-100"
            style={{ color: project.color }}
          >
            {hasCase ? 'View Case Study' : 'View Project'}
            {hasCase && <ArrowUpRight size={13} />}
          </span>
          <div
            className="h-1 w-16 rounded-full transition-all duration-500 group-hover:w-24"
            style={{ backgroundColor: project.color + '60' }}
          />
        </div>
      </div>

      {/* Gallery preview top-right on hover */}
      {hovered && project.caseStudy?.gallery?.[0] && (
        <div className="pointer-events-none absolute right-10 top-10 h-40 w-56 overflow-hidden rounded-xl border border-white/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <img
            src={project.caseStudy.gallery[0]}
            alt={project.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}
    </div>
  )

  /* Cards with a case study navigate to the in-place overlay route */
  return (
    <TiltCard className="h-full">
      {hasCase ? (
        <Link
          to={`/portfolio-1/project/${project.slug}`}
          className="block h-full rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
          aria-label={`${project.title} — read the case study`}
        >
          {card}
        </Link>
      ) : (
        card
      )}
    </TiltCard>
  )
}

export function ProjectsSection() {
  const wrapRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [mob, setMob] = useState(false)

  useEffect(() => setMob(isMobileQuery()), [])

  const featured = useMemo(() => PROJECTS.filter((p) => p.featured), [])

  useGSAP(
    () => {
      if (reducedMotion() || mob || !trackRef.current || !wrapRef.current) return
      const totalScroll = trackRef.current.scrollWidth - window.innerWidth
      if (totalScroll <= 0) return
      gsap.to(trackRef.current, {
        x: -totalScroll,
        ease: 'none',
        scrollTrigger: {
          trigger: wrapRef.current,
          start: 'top top',
          end: () => `+=${totalScroll}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })
    },
    { scope: wrapRef, dependencies: [mob] },
  )

  if (mob) {
    return (
      <section id="works" className="px-6 py-24">
        <SplitReveal
          as="h2"
          className="mb-16 font-bold tracking-tighter text-white"
          style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}
        >
          Selected Works
        </SplitReveal>
        <div className="space-y-8">
          {PROJECTS.map((p, i) => (
            <ProjectCard key={i} project={p} />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section id="works" ref={wrapRef} className="relative overflow-hidden">
      <div
        ref={trackRef}
        className="flex h-screen items-center gap-8 pl-[10vw] will-change-transform"
      >
        {/* Title panel */}
        <div className="w-[35vw] flex-shrink-0 pr-8">
          <span className="font-mono text-xs uppercase tracking-widest text-emerald-500/60">
            Portfolio
          </span>
          <SplitReveal
            as="h2"
            className="mt-2 font-bold tracking-tighter text-white"
            style={{ fontSize: 'clamp(3rem, 6vw, 6rem)' }}
          >
            Selected Works
          </SplitReveal>
          <p className="mt-4 text-white/30">
            {PROJECTS.length} projects · {featured.length} featured
          </p>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-white/25">
            Click a card to read the case study
          </p>
          <div className="mt-6 h-px w-16 bg-emerald-500/40" />
        </div>

        {/* Project cards */}
        {PROJECTS.map((p, i) => (
          <div key={i} className="w-[60vw] flex-shrink-0">
            <ProjectCard project={p} />
          </div>
        ))}

        {/* End spacer */}
        <div className="w-[15vw] flex-shrink-0" />
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   5. SKILLS — orbital ring display with connection lines & level bars
   ═══════════════════════════════════════════════════════════════════════════ */

export function SkillsSection() {
  const ref = useRef<HTMLElement>(null)
  const [activeSkill, setActiveSkill] = useState<string | null>(null)
  const reduced = reducedMotion()

  /* Build adjacency for edge highlighting */
  const adjacencyMap = useMemo(() => {
    const map = new Map<string, Set<string>>()
    SKILLS_GRAPH.edges.forEach(([a, b]) => {
      if (!map.has(a)) map.set(a, new Set())
      if (!map.has(b)) map.set(b, new Set())
      map.get(a)!.add(b)
      map.get(b)!.add(a)
    })
    return map
  }, [])

  const isConnected = useCallback(
    (id: string) => {
      if (!activeSkill) return true
      if (id === activeSkill) return true
      return adjacencyMap.get(activeSkill)?.has(id) ?? false
    },
    [activeSkill, adjacencyMap],
  )

  const rings = useMemo(() => {
    const nodes = SKILLS_GRAPH.nodes
    const perRing = Math.ceil(nodes.length / 3)
    return [nodes.slice(0, perRing), nodes.slice(perRing, perRing * 2), nodes.slice(perRing * 2)]
  }, [])

  /* Stable node positions for SVG edge lines */
  const nodePositions = useMemo(() => {
    const center = 310
    const positions = new Map<string, { x: number; y: number }>()
    rings.forEach((ring, ri) => {
      const radius = 110 + ri * 85
      ring.forEach((node, ni) => {
        const angle = ((360 / ring.length) * ni * Math.PI) / 180
        positions.set(node.id, {
          x: center + Math.cos(angle) * radius,
          y: center + Math.sin(angle) * radius,
        })
      })
    })
    return positions
  }, [rings])

  useGSAP(
    () => {
      if (reduced) return
      gsap.from('.skills-heading', {
        opacity: 0,
        scale: 0.85,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 75%' },
      })
      gsap.from('.skills-orbit', {
        opacity: 0,
        scale: 0.7,
        stagger: 0.15,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 65%' },
      })
    },
    { scope: ref },
  )

  return (
    <section id="skills" ref={ref} className="relative overflow-hidden px-6 py-32">
      <div className="mb-8 text-center">
        <span className="font-mono text-xs uppercase tracking-widest text-emerald-500/60">
          Expertise
        </span>
      </div>
      <SplitReveal
        as="h2"
        className="skills-heading mb-28 text-center font-bold tracking-tighter text-white"
        style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}
      >
        {'Skills & Technologies'}
      </SplitReveal>

      {/* Orbital container */}
      <div
        className="relative mx-auto"
        style={{ width: 'min(620px, 88vw)', height: 'min(620px, 88vw)' }}
      >
        {/* SVG connection lines between related skills */}
        <svg
          className="pointer-events-none absolute inset-0"
          style={{ width: '100%', height: '100%' }}
          viewBox="0 0 620 620"
        >
          {SKILLS_GRAPH.edges.map(([a, b], i) => {
            const pa = nodePositions.get(a)
            const pb = nodePositions.get(b)
            if (!pa || !pb) return null
            const both = isConnected(a) && isConnected(b)
            return (
              <line
                key={i}
                x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                stroke={both ? 'rgba(16,185,129,0.18)' : 'rgba(255,255,255,0.03)'}
                strokeWidth={both && activeSkill ? 1.5 : 0.5}
                style={{ transition: 'all 0.3s ease' }}
              />
            )
          })}
        </svg>

        {/* Center hub */}
        <div className="absolute left-1/2 top-1/2 z-10 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
          <span className="text-xs font-bold tracking-wider text-emerald-400">CORE</span>
        </div>

        {/* Orbit rings */}
        {rings.map((ring, ri) => {
          const radius = 110 + ri * 85
          const dur = 45 + ri * 18
          const reverse = ri % 2 === 1
          return (
            <div
              key={ri}
              className="skills-orbit absolute left-1/2 top-1/2 rounded-full border border-white/[0.03]"
              style={{
                width: radius * 2,
                height: radius * 2,
                marginLeft: -radius,
                marginTop: -radius,
                animation: reduced
                  ? 'none'
                  : `orbit-spin ${dur}s linear infinite${reverse ? ' reverse' : ''}`,
              }}
            >
              {ring.map((node, ni) => {
                const angle = (360 / ring.length) * ni
                const cat = node.category as SkillCategory
                const color = SKILL_CAT_COLORS[cat]
                const active = activeSkill === node.id
                const connected = isConnected(node.id)
                const size = 36 + node.level * 5

                return (
                  <div
                    key={node.id}
                    className="absolute left-1/2 top-1/2 cursor-pointer"
                    style={{
                      transform: `rotate(${angle}deg) translateX(${radius}px) rotate(-${angle}deg)`,
                      marginLeft: -size / 2,
                      marginTop: -size / 2,
                      zIndex: active ? 20 : 1,
                      opacity: connected ? 1 : 0.25,
                      transition: 'opacity 0.3s ease',
                    }}
                    onMouseEnter={() => setActiveSkill(node.id)}
                    onMouseLeave={() => setActiveSkill(null)}
                  >
                    {/* Counter-rotation to keep upright */}
                    <div
                      style={{
                        animation: reduced
                          ? 'none'
                          : `orbit-spin ${dur}s linear infinite${reverse ? '' : ' reverse'}`,
                      }}
                    >
                      <div
                        className="flex flex-col items-center justify-center rounded-full border transition-all duration-300"
                        style={{
                          width: size,
                          height: size,
                          borderColor: active ? color : color + '44',
                          backgroundColor: active ? color + '28' : color + '10',
                          transform: active ? 'scale(1.3)' : 'scale(1)',
                          boxShadow: active ? `0 0 24px ${color}30` : 'none',
                        }}
                      >
                        <span
                          className="select-none text-center font-mono leading-tight"
                          style={{ fontSize: active ? 11 : 9, color: active ? color : color + '99' }}
                        >
                          {node.label}
                        </span>
                      </div>

                      {/* Tooltip with level bar */}
                      {active && (
                        <div
                          className="absolute left-1/2 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-black/95 px-3 py-2 text-[11px] shadow-xl"
                          style={{ color, top: '100%' }}
                        >
                          <div>{SKILL_CAT_LABELS[cat]} · Lv {node.level}/5</div>
                          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${(node.level / 5) * 100}%`, backgroundColor: color }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}

        {/* Category legend */}
        <div className="absolute -bottom-20 left-1/2 flex -translate-x-1/2 flex-wrap justify-center gap-5">
          {(Object.entries(SKILL_CAT_LABELS) as [SkillCategory, string][]).map(([cat, label]) => (
            <div key={cat} className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: SKILL_CAT_COLORS[cat] }} />
              <span className="text-[11px] text-white/35">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
