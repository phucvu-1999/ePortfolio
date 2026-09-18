import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Trophy, X, Lock } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import { playSound } from '../lib/sound'

// ═══════════════════════════════════════════════════════════════════════════
// Achievement system — context + localStorage persistence + badge drawer.
// Any component can award a badge by dispatching:
//   window.dispatchEvent(new CustomEvent('leo-achievement', { detail: '<id>' }))
// or by calling `unlock(id)` from useAchievements().
// ═══════════════════════════════════════════════════════════════════════════

export interface Badge {
  id: string
  icon: string
  name: string
  desc: string
  secret: boolean
}

export const BADGES: Badge[] = [
  { id: 'hello-world', icon: '👋', name: 'Hello World', desc: 'Opened the leo-cli terminal', secret: false },
  { id: 'deep-diver', icon: '🤿', name: 'Deep Diver', desc: 'Scrolled all the way to the footer', secret: false },
  { id: 'sign-here', icon: '✍️', name: 'Sign Here', desc: 'Sent a message through the contact form', secret: false },
  { id: 'konami', icon: '🕹️', name: 'Konami Master', desc: '↑ ↑ ↓ ↓ ← → ← → B A', secret: true },
  { id: 'scrambler', icon: '🔀', name: 'Name Dropper', desc: 'Typed "leo" on the keyboard', secret: true },
  { id: 'deal-maker', icon: '💼', name: 'Deal Maker', desc: 'Ran sudo hire-me', secret: true },
  { id: 'jailbreak', icon: '🔓', name: 'Jailbreaker', desc: 'Tried to escape vim (or delete everything)', secret: true },
  { id: 'hacker', icon: '🧑‍💻', name: 'Hacker', desc: 'Found 3 secret easter eggs', secret: true },
]

// Eggs that count toward the "Hacker" meta badge
const EGG_IDS = ['konami', 'scrambler', 'deal-maker', 'jailbreak']
const STORAGE_KEY = 'leo-achievements'

interface AchievementsCtx {
  unlocked: string[]
  unlock: (id: string) => void
}

const Ctx = createContext<AchievementsCtx>({ unlocked: [], unlock: () => {} })

export function useAchievements() {
  return useContext(Ctx)
}

export function AchievementsProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState<string[]>(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as string[]
      return raw.filter(id => BADGES.some(b => b.id === id))
    } catch {
      return []
    }
  })
  const { showToast } = useToast()
  const unlockedRef = useRef(unlocked)
  unlockedRef.current = unlocked

  const unlock = useCallback((id: string) => {
    const badge = BADGES.find(b => b.id === id)
    if (!badge || unlockedRef.current.includes(id)) return

    const next = [...unlockedRef.current, id]
    // Auto-award the meta "Hacker" badge once 3 eggs are found
    const eggsFound = next.filter(x => EGG_IDS.includes(x)).length
    const hackerEarned = eggsFound >= 3 && !next.includes('hacker')
    if (hackerEarned) next.push('hacker')

    setUnlocked(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* ignore */ }

    showToast(`${badge.icon} Achievement unlocked — ${badge.name}`, 'success')
    playSound('unlock')
    if (hackerEarned) {
      const hacker = BADGES.find(b => b.id === 'hacker')!
      window.setTimeout(() => showToast(`${hacker.icon} Achievement unlocked — ${hacker.name}`, 'success'), 1500)
    }
  }, [showToast])

  // Global event bus — lets the terminal, easter eggs and forms award badges
  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<string>).detail
      if (typeof id === 'string') unlock(id)
    }
    window.addEventListener('leo-achievement', handler)
    return () => window.removeEventListener('leo-achievement', handler)
  }, [unlock])

  // "Deep Diver" — observe the footer section
  useEffect(() => {
    const el = document.querySelector('[data-section-idx="11"]')
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some(en => en.isIntersecting)) {
          unlock('deep-diver')
          obs.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [unlock])

  return <Ctx.Provider value={{ unlocked, unlock }}>{children}</Ctx.Provider>
}

// ─── Badge drawer (trophy button, bottom-left) ─────────────────────────────
export function AchievementDrawer({ suppressToasts }: { suppressToasts?: boolean } = {}) {
  const { unlocked } = useAchievements()
  const [open, setOpen] = useState(false)
  const [pulse, setPulse] = useState(0)
  const prevCount = useRef(unlocked.length)
  const reduce = useReducedMotion()

  // Pulse the trophy whenever a new badge lands (suppressed in professional mode)
  useEffect(() => {
    if (unlocked.length > prevCount.current && !suppressToasts) setPulse(p => p + 1)
    prevCount.current = unlocked.length
  }, [unlocked.length, suppressToasts])

  // Open via command palette
  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener('leo-achievements-open', handler)
    return () => window.removeEventListener('leo-achievements-open', handler)
  }, [])

  // Escape to close
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  const allDone = unlocked.length === BADGES.length

  return (
    <>
      {/* Trophy launcher */}
      <motion.button
        key={pulse}
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-5 left-5 z-[80] flex items-center gap-2 rounded-full border border-amber-400/40 bg-[#0d1117]/90 px-3.5 py-2.5 font-mono text-xs text-amber-300 shadow-lg shadow-black/40 backdrop-blur transition-colors hover:border-amber-300 hover:bg-[#161b22]"
        style={pulse > 0 ? { animation: 'trophy-pulse 0.9s ease-out 2' } : undefined}
        aria-label={`Achievements — ${unlocked.length} of ${BADGES.length} unlocked`}
        title="Achievements"
        initial={{ scale: pulse > 0 ? 1.25 : 1 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      >
        <style>{`@keyframes trophy-pulse { 0% { box-shadow: 0 0 0 0 rgba(251,191,36,0.55); } 100% { box-shadow: 0 0 0 18px rgba(251,191,36,0); } } @media (prefers-reduced-motion: reduce) { button[aria-label^="Achievements"] { animation: none !important; } }`}</style>
        <Trophy size={16} className={allDone ? 'text-amber-300' : 'text-amber-400/80'} />
        <span className="tabular-nums">{unlocked.length}/{BADGES.length}</span>
      </motion.button>

      {/* Drawer panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Achievements drawer"
            className="fixed bottom-20 left-5 z-[80] w-[320px] rounded-2xl border border-slate-700/70 bg-[#0d1117]/95 p-5 shadow-2xl shadow-black/60 backdrop-blur"
            initial={reduce ? false : { opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: reduce ? 0 : 0.18, ease: 'easeOut' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-amber-400">achievements</div>
                <div className="font-display text-lg font-bold text-slate-100" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Trophy Room
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-200"
                aria-label="Close achievements"
              >
                <X size={16} />
              </button>
            </div>

            {/* Progress bar */}
            <div className="mb-4 h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300"
                initial={false}
                animate={{ width: `${(unlocked.length / BADGES.length) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
              {BADGES.map(b => {
                const got = unlocked.includes(b.id)
                const hidden = b.secret && !got
                return (
                  <div
                    key={b.id}
                    className={`rounded-xl border p-3 transition-colors ${
                      got ? 'border-amber-400/40 bg-amber-400/[0.06]' : 'border-slate-800 bg-slate-900/40'
                    }`}
                    title={hidden ? 'Secret achievement — keep exploring' : b.desc}
                  >
                    <div className={`text-2xl mb-1.5 ${got ? '' : 'grayscale opacity-40'}`}>
                      {hidden ? '❓' : b.icon}
                    </div>
                    <div className={`text-xs font-semibold ${got ? 'text-slate-100' : 'text-slate-500'}`}>
                      {hidden ? '???' : b.name}
                    </div>
                    <div className="mt-0.5 flex items-start gap-1 text-[10px] leading-tight text-slate-500">
                      {!got && <Lock size={9} className="mt-0.5 shrink-0" />}
                      <span>{hidden ? 'Secret — find it yourself' : b.desc}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {allDone && (
              <div className="mt-3 rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-center font-mono text-[11px] text-amber-300">
                🏆 100% — you found everything. go outside.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
