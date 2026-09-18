import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTheme, type Theme } from '../contexts/ThemeContext'

const ORDER: Theme[] = ['romantic', 'light', 'dark']

const META: Record<
  Theme,
  {
    label: string
    next: Theme
    iconColor: string
    bg: string
    border: string
    ring: string
  }
> = {
  romantic: {
    label: 'Fresh',
    next: 'light',
    iconColor: 'text-emerald-500',
    bg: 'bg-white/80',
    border: 'border-emerald-200',
    ring: 'focus-visible:ring-emerald-300',
  },
  light: {
    label: 'Light',
    next: 'dark',
    iconColor: 'text-amber-500',
    bg: 'bg-white/85',
    border: 'border-slate-200',
    ring: 'focus-visible:ring-amber-300',
  },
  dark: {
    label: 'Dark',
    next: 'romantic',
    iconColor: 'text-indigo-300',
    bg: 'bg-slate-700/80',
    border: 'border-slate-500',
    ring: 'focus-visible:ring-indigo-400',
  },
}

function LeafIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="w-4 h-4"
    >
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.71c.79.74 1.63 1.36 2.5 1.82C11.33 22.39 13.81 23 17 23c0-3.87-.97-7.32-2.78-9.88C12.38 10.44 10.05 8.79 7.5 7.74c2.42-.71 5.5-.87 9.5.26V8z" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="w-4 h-4"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="w-4 h-4"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" />
    </svg>
  )
}

const ICONS: Record<Theme, ReactNode> = {
  romantic: <LeafIcon />,
  light: <SunIcon />,
  dark: <MoonIcon />,
}

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [hover, setHover] = useState(false)
  const [spinKey, setSpinKey] = useState(0)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  // ensure animation re-plays on every cycle
  useEffect(() => {
    setSpinKey((n) => n + 1)
  }, [theme])

  const meta = META[theme]

  const cycle = () => {
    const idx = ORDER.indexOf(theme)
    const nextTheme = ORDER[(idx + 1) % ORDER.length]
    setTheme(nextTheme)
  }

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col items-end gap-1.5"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={cycle}
        aria-label={`Theme: ${meta.label}. Click to switch to ${META[meta.next].label}.`}
        title={`${meta.label} theme`}
        className={[
          'relative w-9 h-9 flex items-center justify-center rounded-full',
          'backdrop-blur-sm shadow-md border transition-all',
          'hover:scale-110 active:scale-95',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          meta.bg,
          meta.border,
          meta.ring,
          meta.iconColor,
        ].join(' ')}
      >
        {/* soft halo behind icon */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full opacity-60 blur-md -z-10"
          style={{ background: 'var(--toggle-ring, transparent)' }}
        />

        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={`${theme}-${spinKey}`}
            initial={{ rotate: -180, scale: 0.4, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 180, scale: 0.4, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 320,
              damping: 18,
              mass: 0.6,
            }}
            className="flex items-center justify-center"
          >
            {ICONS[theme]}
          </motion.span>
        </AnimatePresence>

        {/* tiny progress dots */}
        <span
          aria-hidden
          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex gap-[3px]"
        >
          {ORDER.map((t) => (
            <span
              key={t}
              className={[
                'block h-[3px] rounded-full transition-all',
                t === theme
                  ? 'w-2.5 bg-current opacity-90'
                  : 'w-[3px] bg-current opacity-30',
              ].join(' ')}
            />
          ))}
        </span>
      </button>

      {/* tooltip */}
      <AnimatePresence>
        {hover && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.18, ease: [0.2, 0.7, 0.2, 1] }}
            className={[
              'pointer-events-none select-none',
              'px-2.5 py-1 rounded-full text-[10px] uppercase',
              'tracking-[0.18em] font-mono shadow-md backdrop-blur-sm border',
              meta.bg,
              meta.border,
              meta.iconColor,
            ].join(' ')}
          >
            {meta.label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
