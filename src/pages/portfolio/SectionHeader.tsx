import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export interface SectionHeaderProps {
  /** 1-based section number shown in the chip */
  index: number
  /** Total numbered sections — displayed as `NN / total` in the chip */
  total?: number
  /** Small uppercase label above the title */
  eyebrow: string
  /** Big display title */
  title: string
  /** Supporting line under the title */
  subtitle: string
  /** Section accent color (hex, e.g. '#10b981') — tints chip, title edges, divider */
  accent: string
  /** Optional small badge rendered under the subtitle (e.g. 'Sample data') */
  badge?: string
  /** Wrapper margin — matches the previous per-section mb-12 / mb-16 rhythm */
  className?: string
}

/** Word-by-word reveal variants for the title animation */
const wordContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.15 },
  },
}

const wordChild = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}

/**
 * Shared section header: numbered wayfinding chip + per-section accent color.
 * Title uses a word-by-word reveal animation (inspired by Josh Comeau / Brittany Chiang).
 * Title has a light center with accent-colored edges so big display text
 * stays readable on dark backgrounds while still carrying section identity.
 */
export default function SectionHeader({
  index,
  total = 12,
  eyebrow,
  title,
  subtitle,
  accent,
  badge,
  className = 'mb-12',
}: SectionHeaderProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  const words = title.split(' ')
  // Calculate delay for subtitle: after all words finish revealing
  const subtitleDelay = 0.15 + words.length * 0.07 + 0.4

  return (
    <div ref={ref} className={`text-center ${className}`}>
      {/* Wayfinding chip + eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex items-center justify-center gap-3 flex-wrap"
      >
        <span
          className="font-mono text-[11px] tracking-[0.18em] px-2.5 py-1 rounded-md border tabular-nums"
          style={{ color: accent, borderColor: `${accent}55`, background: `${accent}14` }}
        >
          {String(index).padStart(2, '0')}
          <span className="opacity-40 mx-1">/</span>
          {String(total).padStart(2, '0')}
        </span>
        <span className="font-mono text-xs uppercase tracking-widest" style={{ color: accent }}>
          {eyebrow}
        </span>
      </motion.div>

      {/* Title — word-by-word reveal with accent gradient */}
      <motion.h2
        variants={wordContainer}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        className="font-display text-5xl md:text-7xl font-bold mt-4 tracking-tight"
        style={{
          backgroundImage: `linear-gradient(100deg, ${accent} 0%, #f8fafc 45%, #f8fafc 55%, ${accent} 100%)`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}
        aria-label={title}
      >
        {words.map((word, i) => (
          <motion.span
            key={i}
            variants={wordChild}
            className="inline-block"
            style={{ willChange: 'transform, opacity, filter' }}
          >
            {word}
            {i < words.length - 1 && '\u00A0'}
          </motion.span>
        ))}
      </motion.h2>

      {/* Subtitle — fades in after title words finish */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: subtitleDelay, ease: 'easeOut' }}
        className="text-slate-400 text-lg mt-4 max-w-2xl mx-auto leading-relaxed"
      >
        {subtitle}
      </motion.p>

      {badge && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 0.7 } : {}}
          transition={{ duration: 0.4, delay: subtitleDelay + 0.2 }}
          className="inline-block mt-3 px-2 py-0.5 text-xs font-mono text-slate-500 border border-slate-700/40 rounded"
        >
          {badge}
        </motion.span>
      )}

      {/* Divider — hairlines converging on an accent diamond */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={inView ? { opacity: 1, scaleX: 1 } : {}}
        transition={{ duration: 0.6, delay: subtitleDelay + 0.15, ease: 'easeOut' }}
        className="mt-6 flex items-center justify-center gap-3"
        aria-hidden
      >
        <span className="h-px w-20" style={{ background: `linear-gradient(to right, transparent, ${accent}88)` }} />
        <span className="w-1.5 h-1.5 rotate-45" style={{ background: accent, boxShadow: `0 0 10px ${accent}aa` }} />
        <span className="h-px w-20" style={{ background: `linear-gradient(to left, transparent, ${accent}88)` }} />
      </motion.div>
    </div>
  )
}
