import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, Star } from 'lucide-react'
import { PROJECTS } from './content'

/**
 * Selected Works — editorial index of flagship projects.
 * Awwwards interaction pattern: huge typographic rows with a floating
 * image preview that trails the cursor on a spring. Clicking a row
 * opens the full case study.
 */
export default function SelectedWorks() {
  const [active, setActive] = useState<number | null>(null)

  // Cursor-follow preview: raw position → spring for that trailing feel
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 280, damping: 28, mass: 0.6 })
  const sy = useSpring(my, { stiffness: 280, damping: 28, mass: 0.6 })

  const onMove = (e: React.MouseEvent) => {
    mx.set(e.clientX)
    my.set(e.clientY)
  }

  const activeProject = active !== null ? PROJECTS[active] : null

  return (
    <div className="relative" onMouseMove={onMove} onMouseLeave={() => setActive(null)}>
      <p className="text-center font-mono text-xs text-slate-500 mb-10">
        hover a row to preview · click to open the case study
      </p>

      <div className="border-t border-slate-800/60">
        {PROJECTS.map((p, i) => {
          const img = p.caseStudy?.gallery?.[0]
          const isActive = active === i
          return (
            <Link
              key={p.slug}
              to={`/portfolio/project/${p.slug}`}
              onMouseEnter={() => setActive(i)}
              className="group relative flex items-center gap-5 md:gap-8 border-b border-slate-800/60 py-7 md:py-9 pl-2 pr-2 md:pl-6 md:pr-4 transition-colors hover:bg-slate-900/30"
            >
              {/* accent bar that grows on hover */}
              <span
                className="absolute left-0 top-0 bottom-0 w-[3px] origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-300"
                style={{ background: p.color }}
              />

              {/* index */}
              <span
                className={`font-mono text-sm md:text-base w-9 shrink-0 transition-colors tabular-nums ${isActive ? '' : 'text-slate-600'}`}
                style={isActive ? { color: p.color } : undefined}
              >
                {String(i + 1).padStart(2, '0')}
              </span>

              {/* title + tags */}
              <div className="min-w-0 flex-1">
                <h3
                  className="font-display text-2xl md:text-4xl font-bold tracking-tight truncate transition-all duration-300 group-hover:translate-x-2"
                  style={{ color: isActive ? p.color : undefined }}
                >
                  <span className={isActive ? '' : 'text-slate-200'}>{p.title}</span>
                </h3>
                <p className="font-mono text-[11px] md:text-xs text-slate-500 mt-1.5 md:mt-2.5 truncate">{p.tags.join(' · ')}</p>
              </div>

              {/* stars (desktop) */}
              <span className="hidden md:flex items-center gap-1.5 font-mono text-xs text-amber-400/90 shrink-0">
                <Star size={12} fill="currentColor" /> {p.stars.toLocaleString()}
              </span>

              {/* inline thumbnail (mobile — no hover there) */}
              {img && (
                <img
                  src={img}
                  alt=""
                  className="md:hidden w-16 h-12 object-cover rounded-md border border-slate-800 bg-white shrink-0"
                  loading="lazy"
                />
              )}

              {/* arrow reveal */}
              <ArrowUpRight
                size={20}
                className="shrink-0 text-slate-600 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-slate-300 transition-all duration-300"
              />
            </Link>
          )
        })}
      </div>

      {/* Floating cursor-trail preview (desktop only) */}
      <motion.div className="fixed left-0 top-0 z-40 pointer-events-none hidden md:block" style={{ x: sx, y: sy }}>
        {/* plain wrapper carries the CSS offset so framer-motion owns only x/y on the parent */}
        <div className="-translate-x-1/2 -translate-y-[115%]">
          <AnimatePresence>
            {activeProject?.caseStudy?.gallery?.[0] && (
              <motion.div
                key={activeProject.slug}
                initial={{ opacity: 0, scale: 0.8, rotate: -6 }}
                animate={{ opacity: 1, scale: 1, rotate: -3 }}
                exit={{ opacity: 0, scale: 0.85, rotate: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="relative w-80 h-52 rounded-xl overflow-hidden border-2 bg-white shadow-2xl"
                style={{ borderColor: activeProject.color, boxShadow: `0 24px 60px -12px ${activeProject.color}66` }}
              >
                <img src={activeProject.caseStudy.gallery[0]} alt="" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 to-transparent px-4 py-2.5">
                  <div className="font-mono text-[10px] text-slate-300 truncate">{activeProject.tags.join(' · ')}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
