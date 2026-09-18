import { useEffect, useMemo, useRef } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, ChevronLeft, Terminal, Tag, AlertTriangle } from 'lucide-react'
import { PROJECTS, CONTENT_FLAGS } from './content'
import { usePortfolioSEO } from './seo'
import { styleBaseOf } from '../../components/StyleSwitcher'

// ─── Animation variants ─────────────────────────────────────────────────────
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }
const stagger = { visible: { transition: { staggerChildren: 0.07 } } }

export default function CaseStudyPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const scrollRef = useRef<HTMLDivElement>(null)
  const projectIndex = PROJECTS.findIndex((p) => p.slug === slug)
  const project = projectIndex >= 0 ? PROJECTS[projectIndex] : null

  // The case study is mounted under whichever portfolio variant the visitor is
  // browsing (e.g. /portfolio-3/project/xyz). Derive that base so "back",
  // Escape, 404 and prev/next all stay within the same visual style.
  const base = useMemo(() => styleBaseOf(location.pathname), [location.pathname])

  // SEO — must be called unconditionally (hooks rule)
  usePortfolioSEO(
    project?.caseStudy
      ? { title: `${project.title} — Case Study`, description: project.caseStudy.problem }
      : undefined,
  )

  // ─── Overlay behaviour ────────────────────────────────────────────────────
  // The case study renders ON TOP of the still-mounted portfolio (nested route
  // + <Outlet />), so going back never reloads the page — the portfolio keeps
  // its exact scroll position. Lock the body scroll while the overlay is open.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Escape works like the browser back button
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') navigate(base) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate, base])

  // Reset scroll + focus when switching projects via prev/next (this component
  // stays mounted across param changes)
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
    scrollRef.current?.focus()
  }, [slug])

  // ─── Not Found ──────────────────────────────────────────────────────────────
  if (!project || !project.caseStudy) {
    return (
      <div className="fixed inset-0 z-[130] bg-[#0a0a0f] flex items-center justify-center px-6">
        <div className="max-w-lg w-full text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono mb-6">
            <AlertTriangle size={12} />
            <span>404 — project not found</span>
          </div>
          <pre className="font-mono text-sm text-slate-500 mb-8 text-left mx-auto max-w-xs">
{`$ cd ~/projects/${slug ?? '???'}
bash: cd: no such file or directory`}
          </pre>
          <Link
            to={base}
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-mono text-sm transition-colors"
          >
            <ChevronLeft size={14} />
            cd ..
          </Link>
        </div>
      </div>
    )
  }

  const cs = project.caseStudy
  const prevIdx = (projectIndex - 1 + PROJECTS.length) % PROJECTS.length
  const nextIdx = (projectIndex + 1) % PROJECTS.length
  const prevProject = PROJECTS[prevIdx]
  const nextProject = PROJECTS[nextIdx]

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      className="fixed inset-0 z-[130] bg-[#0a0a0f] text-slate-200 selection:bg-emerald-500/30"
    >
      {/* Own scroll container — overscroll-contain stops scroll chaining to the
          portfolio underneath, which keeps its scroll position for the return. */}
      <div ref={scrollRef} tabIndex={-1} className="h-full overflow-y-auto overscroll-contain outline-none">
      {/* ─── Terminal Header ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-800/60 backdrop-blur-xl bg-[#0a0a0f]/80">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to={base}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-emerald-400 font-mono text-xs transition-colors"
          >
            <ChevronLeft size={14} />
            cd ..
          </Link>
          <div className="flex items-center gap-2 font-mono text-xs text-slate-500">
            <Terminal size={12} className="text-emerald-400" />
            <span className="text-emerald-400">~</span>/projects/<span className="text-slate-300">{slug}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] text-slate-600">
            <kbd className="px-1.5 py-0.5 rounded border border-slate-700/60 bg-slate-800/60 text-slate-500">esc</kbd>
            <span>to close</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        {/* ─── Title + Tags ─────────────────────────────────────────────────── */}
        <motion.div initial="hidden" animate="visible" variants={stagger} className="mb-16">
          {CONTENT_FLAGS.showSampleDataBadges && (
            <motion.div variants={fadeUp} className="mb-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono uppercase tracking-wider">
                <Tag size={10} />
                Sample data
              </span>
            </motion.div>
          )}
          <motion.h1
            variants={fadeUp}
            className="font-mono text-4xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-violet-400 bg-clip-text text-transparent mb-4"
          >
            {project.title}
          </motion.h1>
          <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full border text-xs font-mono"
                style={{ borderColor: `${project.color}50`, color: project.color }}
              >
                {tag}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* ─── Problem ──────────────────────────────────────────────────────── */}
        <Section title="The Problem" color={project.color} delay={0.1}>
          <p className="text-slate-300 leading-relaxed text-lg">{cs.problem}</p>
        </Section>

        {/* ─── Approach ─────────────────────────────────────────────────────── */}
        <Section title="The Approach" color={project.color} delay={0.2}>
          <p className="text-slate-300 leading-relaxed text-lg">{cs.approach}</p>
        </Section>

        {/* ─── Architecture ─────────────────────────────────────────────────── */}
        <Section title="Architecture" color={project.color} delay={0.3}>
          <ul className="space-y-3">
            {cs.architecture.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-3 text-slate-300"
              >
                <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full" style={{ background: project.color }} />
                <span className="leading-relaxed">{item}</span>
              </motion.li>
            ))}
          </ul>
        </Section>

        {/* ─── Stack ────────────────────────────────────────────────────────── */}
        <Section title="Tech Stack" color={project.color} delay={0.35}>
          <div className="flex flex-wrap gap-2">
            {cs.stack.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-sm font-mono text-slate-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </Section>

        {/* ─── Metrics ──────────────────────────────────────────────────────── */}
        <Section title="Key Metrics" color={project.color} delay={0.4}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cs.metrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 text-center"
              >
                <p className="font-mono text-2xl font-bold mb-1" style={{ color: project.color }}>
                  {m.value}
                </p>
                <p className="text-xs text-slate-500 leading-tight">{m.label}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ─── Gallery (only when non-empty) ────────────────────────────────── */}
        {cs.gallery.length > 0 && (
          <Section title="Gallery" color={project.color} delay={0.45}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {cs.gallery.map((url, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.94 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.4 }}
                  className="group rounded-xl border border-slate-800/60 bg-gradient-to-br from-slate-100 via-white to-slate-200 overflow-hidden">
                  <img src={url} alt={`${project.title} visual ${i + 1}`} loading="lazy"
                    className="w-full h-44 object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-110" />
                </motion.div>
              ))}
            </div>
          </Section>
        )}

        {/* ─── Learnings ────────────────────────────────────────────────────── */}
        <Section title="Learnings" color={project.color} delay={0.5}>
          <ul className="space-y-3">
            {cs.learnings.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-3 text-slate-300"
              >
                <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="leading-relaxed">{item}</span>
              </motion.li>
            ))}
          </ul>
        </Section>

        {/* ─── Prev / Next Navigation ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 pt-8 border-t border-slate-800/60 flex items-center justify-between"
        >
          <Link
            to={`${base}/project/${prevProject.slug}`}
            className="group flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <div className="text-left">
              <span className="block text-[10px] font-mono uppercase text-slate-600">Previous</span>
              <span className="text-sm font-mono">{prevProject.title}</span>
            </div>
          </Link>
          <Link
            to={`${base}/project/${nextProject.slug}`}
            className="group flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <div className="text-right">
              <span className="block text-[10px] font-mono uppercase text-slate-600">Next</span>
              <span className="text-sm font-mono">{nextProject.title}</span>
            </div>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </main>
      </div>
    </motion.div>
  )
}

// ─── Reusable Section Component ────────────────────────────────────────────────
function Section({
  title,
  color,
  delay,
  children,
}: {
  title: string
  color: string
  delay: number
  children: React.ReactNode
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay, duration: 0.5 }}
      className="mb-16"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
        <h2 className="font-mono text-sm uppercase tracking-widest text-slate-500">{title}</h2>
      </div>
      {children}
    </motion.section>
  )
}
