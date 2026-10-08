// ─── /awesome scenes — pinned, scroll-driven story beats ────────────────────
// Every scene handles its own GSAP context and pins only on desktop with
// motion allowed; mobile and reduced-motion visitors get the same content
// in a calm, stacked layout.

import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, ArrowUpRight, MapPin, Sparkles } from 'lucide-react'
import { reducedMotion } from '../cinematic/CinematicChrome'
import { PORTFOLIO_PROFILE } from '../portfolio/profile'
import { PROJECTS } from '../portfolio/content'

gsap.registerPlugin(ScrollTrigger)

const MOTION_OK = '(min-width: 768px) and (prefers-reduced-motion: no-preference)'
const MONO = 'font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-400/80'

/* ── Hero — kinetic name, role, proof chips, scroll cue ─────────────────── */

function KineticWord({ text }: { text: string }) {
  return (
    <span className="block overflow-hidden" aria-hidden="true">
      {text.split('').map((ch, i) => (
        <span key={`${ch}-${i}`} className="aw-letter inline-block will-change-transform">
          {ch}
        </span>
      ))}
    </span>
  )
}

export function HeroScene() {
  const ref = useRef<HTMLElement>(null)
  const first = PORTFOLIO_PROFILE.name.split(' ')[0].toUpperCase()
  const last = PORTFOLIO_PROFILE.name.split(' ').slice(1).join(' ').toUpperCase()

  /* Intro stagger + pinned scrub exit (desktop, motion allowed) */
  useEffect(() => {
    if (reducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.aw-letter',
        { yPercent: 115 },
        { yPercent: 0, duration: 0.9, ease: 'power4.out', stagger: 0.035, delay: 0.15 },
      )
      gsap.fromTo(
        '.aw-hero-fade',
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1, delay: 0.7 },
      )
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        gsap
          .timeline({
            scrollTrigger: { trigger: ref.current, start: 'top top', end: '+=75%', pin: true, scrub: 0.5 },
          })
          .to('.aw-hero-inner', { yPercent: -22, autoAlpha: 0, ease: 'none' })
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} aria-label="Introduction" className="relative flex min-h-screen items-center overflow-hidden">
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 h-[60vmin] w-[60vmin] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]"
      />
      <div className="aw-hero-inner mx-auto w-full max-w-6xl px-6 py-24">
        <p className={`${MONO} aw-hero-fade`}>Portfolio — {new Date().getFullYear()}</p>
        <h1 className="mt-6 font-black leading-[0.9] tracking-tight">
          <span className="sr-only">{PORTFOLIO_PROFILE.name}</span>
          <span className="block text-[clamp(3.5rem,13vw,11rem)]">
            <KineticWord text={first} />
            {last && <KineticWord text={last} />}
          </span>
        </h1>
        <p className="aw-hero-fade mt-8 max-w-xl text-lg text-white/60 md:text-xl">
          {PORTFOLIO_PROFILE.role}. I build point-of-sale systems where
          <span className="text-emerald-300"> every cent must reconcile</span> — online or offline.
        </p>
        <div className="aw-hero-fade mt-8 flex flex-wrap items-center gap-3 text-sm text-white/50">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5">
            <MapPin size={13} className="text-emerald-400" /> {PORTFOLIO_PROFILE.location}
          </span>
          <span className="rounded-full border border-white/10 px-3 py-1.5">
            {PORTFOLIO_PROFILE.experience} experience
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-emerald-300">
            <Sparkles size={13} /> {PORTFOLIO_PROFILE.availability}
          </span>
        </div>
        <div className="aw-hero-fade mt-16 flex items-center gap-3 text-white/35">
          <ArrowDown size={15} className="animate-bounce" aria-hidden="true" />
          <span className="font-mono text-[11px] uppercase tracking-[0.3em]">Scroll — 30 seconds</span>
        </div>
      </div>
    </section>
  )
}

/* ── Impact — pinned proof numbers (all from published case-study facts) ── */

const IMPACT_STATS = [
  { target: 5, suffix: '+', label: 'years building enterprise POS in production' },
  { target: 22, suffix: '/22', label: 'modules covered by the .NET 8 migration plan' },
  { target: 20, suffix: '+', label: 'payment strategies in one strategy engine' },
  { target: 6, suffix: '', label: 'device types sharing one codebase' },
]

export function ImpactScene() {
  const ref = useRef<HTMLElement>(null)

  /* Count-up once on entry; desktop pins briefly while rows stagger in */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const nums = gsap.utils.toArray<HTMLElement>('.aw-stat-num', ref.current)
      if (reducedMotion()) return
      ScrollTrigger.create({
        trigger: ref.current,
        start: 'top 70%',
        once: true,
        onEnter: () => {
          nums.forEach((el, i) => {
            const target = Number(el.dataset.target ?? 0)
            const suffix = el.dataset.suffix ?? ''
            const proxy = { v: 0 }
            el.textContent = `0${suffix}`
            gsap.to(proxy, {
              v: target,
              duration: 1.6,
              delay: i * 0.12,
              ease: 'power2.out',
              onUpdate: () => {
                el.textContent = `${Math.round(proxy.v)}${suffix}`
              },
            })
          })
        },
      })
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        gsap
          .timeline({
            scrollTrigger: { trigger: ref.current, start: 'top top', end: '+=60%', pin: true, scrub: 0.5 },
          })
          .fromTo(
            '.aw-stat-row',
            { autoAlpha: 0.15, x: -32 },
            { autoAlpha: 1, x: 0, ease: 'none', stagger: 0.25 },
          )
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} aria-label="Impact numbers" className="relative flex min-h-screen items-center border-t border-white/5">
      <div className="mx-auto w-full max-w-6xl px-6 py-24">
        <p className={MONO}>Proof, not promises</p>
        <h2 className="mt-6 max-w-3xl text-3xl font-bold leading-tight text-white/85 md:text-5xl">
          The numbers recruiters ask about — every one traceable to a case study.
        </h2>
        <dl className="mt-14 divide-y divide-white/8 border-y border-white/8">
          {IMPACT_STATS.map((s) => (
            <div key={s.label} className="aw-stat-row flex flex-wrap items-baseline gap-x-8 gap-y-1 py-6 md:py-8">
              <dd
                className="aw-stat-num w-44 shrink-0 text-5xl font-black tabular-nums text-emerald-300 md:text-7xl"
                data-target={s.target}
                data-suffix={s.suffix}
              >
                {s.target}
                {s.suffix}
              </dd>
              <dt className="max-w-md text-base text-white/55 md:text-lg">{s.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

/* ── Works — pinned flagship case-study panels ──────────────────────────── */

const FEATURED = PROJECTS.filter((p) => p.featured && p.caseStudy).slice(0, 3)

export function WorksScene() {
  const ref = useRef<HTMLElement>(null)

  /* Desktop: pin and crossfade the stacked panels. Mobile: natural flow. */
  useEffect(() => {
    if (reducedMotion()) return
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const panels = gsap.utils.toArray<HTMLElement>('.aw-panel', ref.current)
        if (panels.length < 2) return
        gsap.set(panels, { autoAlpha: 0, scale: 0.94 })
        gsap.set(panels[0], { autoAlpha: 1, scale: 1 })
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ref.current,
            start: 'top top',
            end: `+=${panels.length * 90}%`,
            pin: true,
            scrub: 0.6,
          },
        })
        panels.forEach((panel, i) => {
          if (i === 0) return
          tl.to(panels[i - 1], { autoAlpha: 0, scale: 1.05, duration: 1 }, i)
            .fromTo(panel, { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 1 }, i)
        })
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} id="aw-works" aria-label="Selected case studies" className="relative min-h-screen border-t border-white/5">
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-24">
        <p className={MONO}>Selected work — 0{FEATURED.length} flagships</p>
        <div className="relative mt-10 md:h-[62vh]">
          {FEATURED.map((p, i) => {
            const metric = p.caseStudy?.metrics[0]
            return (
              <article
                key={p.slug}
                className="aw-panel relative mb-10 rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm will-change-transform last:mb-0 md:absolute md:inset-0 md:mb-0 md:flex md:flex-col md:justify-center md:p-14"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-6 right-6 select-none text-7xl font-black text-white/5 md:text-9xl"
                >
                  0{i + 1}
                </span>
                <p className="font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: p.color }}>
                  {p.tags.slice(0, 3).join(' · ')}
                </p>
                <h3 className="mt-4 max-w-2xl text-3xl font-black leading-tight md:text-5xl">{p.title}</h3>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/55 md:text-lg">
                  {p.caseStudy?.problem.split('.')[0]}.
                </p>
                {metric && (
                  <p className="mt-6 inline-flex items-baseline gap-3">
                    <span className="text-3xl font-black tabular-nums" style={{ color: p.color }}>
                      {metric.value}
                    </span>
                    <span className="text-sm text-white/45">{metric.label}</span>
                  </p>
                )}
                <Link
                  to={`/awesome/project/${p.slug}`}
                  className="group mt-8 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/80 transition-colors hover:border-emerald-400/50 hover:text-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
                >
                  Read the case study
                  <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ── Focus — current mission + stack marquee ────────────────────────────── */

const STACK_WORDS = [
  'C#', '.NET 8', 'WPF', 'gRPC', 'SQLite', 'EF Core 8', 'Xamarin',
  'Strategy Pattern', 'Offline-First', 'Idempotent Recovery', 'REST', 'Reconciliation',
]

export function FocusScene() {
  return (
    <section aria-label="Current focus" className="relative overflow-hidden border-t border-white/5 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <p className={MONO}>Currently</p>
        <p className="mt-6 max-w-3xl text-2xl font-bold leading-snug text-white/85 md:text-4xl">
          {PORTFOLIO_PROFILE.currentFocus}.
        </p>
      </div>
      <div className="mt-14 border-y border-white/5 py-5" aria-hidden="true">
        <div className="awesome-marquee-track flex w-max animate-[awesome-marquee_28s_linear_infinite] gap-10 whitespace-nowrap">
          {[...STACK_WORDS, ...STACK_WORDS].map((w, i) => (
            <span key={`${w}-${i}`} className="text-2xl font-black text-white/15 md:text-4xl">
              {w} <span className="text-emerald-500/40">·</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Contact — oversized finale CTA ─────────────────────────────────────── */

export function ContactScene() {
  const subject = encodeURIComponent(`Opportunity for ${PORTFOLIO_PROFILE.name}`)
  return (
    <section id="aw-contact" aria-label="Contact" className="relative flex min-h-screen flex-col border-t border-white/5">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 h-[50vmin] w-[80vmin] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[140px]"
      />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-start justify-center px-6 py-24">
        <p className={MONO}>Final scene — your move</p>
        <h2 className="mt-6 max-w-4xl text-4xl font-black leading-[1.02] md:text-7xl">
          Let&rsquo;s build systems that <span className="text-emerald-300">never lose a sale</span>.
        </h2>
        <p className="mt-6 max-w-xl text-lg text-white/55">
          {PORTFOLIO_PROFILE.availability} · {PORTFOLIO_PROFILE.location}. The fastest way to reach me:
        </p>
        <a
          href={`mailto:${PORTFOLIO_PROFILE.email}?subject=${subject}`}
          className="group mt-10 inline-flex items-center gap-3 rounded-full bg-emerald-400 px-8 py-4 text-lg font-bold text-black transition-colors hover:bg-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300"
        >
          {PORTFOLIO_PROFILE.email}
          <ArrowUpRight size={20} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
        <p className="mt-4 font-mono text-xs text-white/35">
          Opens your email client with a prepared draft — no forms, no tracking.
        </p>
      </div>
      <footer className="border-t border-white/5">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6 text-sm text-white/40">
          <span>
            © {new Date().getFullYear()} {PORTFOLIO_PROFILE.name} — {PORTFOLIO_PROFILE.role}
          </span>
          <span className="flex items-center gap-5">
            <Link to="/portfolio" className="transition-colors hover:text-emerald-300 focus-visible:outline-2 focus-visible:outline-emerald-400">
              Full engineering lab →
            </Link>
            <span className="hidden font-mono text-xs text-white/25 sm:inline">press 0–5 for more styles</span>
          </span>
        </div>
      </footer>
    </section>
  )
}
