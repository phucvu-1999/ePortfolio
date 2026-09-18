// ═══════════════════════════════════════════════════════════════════════════
// ShortcutsHelp — "?" overlay listing every hotkey and hidden feature.
// Self-contained: listens for the 'leo-help-open' custom event (fired by the
// "?" hotkey, the bottom-left hint chip, and the command palette), closes on
// Esc / backdrop click.
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Keyboard, Sparkles } from 'lucide-react'

interface Entry {
  keys: string[]
  desc: string
}

const SHORTCUTS: Entry[] = [
  { keys: ['Ctrl', 'K'], desc: 'Command palette — jump anywhere, toggle anything' },
  { keys: ['Ctrl', '`'], desc: 'Interactive terminal (try `sudo hire-me`)' },
  { keys: ['?'], desc: 'Toggle this shortcuts panel' },
  { keys: ['Esc'], desc: 'Close any open overlay or case study' },
]

const SECRETS: Entry[] = [
  { keys: ['↑', '↑', '↓', '↓', '←', '→', '←', '→', 'B', 'A'], desc: 'CRT retro mode for 10 seconds' },
  { keys: ['l', 'e', 'o'], desc: 'Type it anywhere — scrambles the hero name' },
  { keys: ['🏆'], desc: 'Achievements drawer — unlock them all' },
  { keys: ['🎊'], desc: 'Party mode — via the command palette' },
  { keys: ['#'], desc: 'Shareable section links — the URL hash follows your scroll' },
]

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[1.65rem] h-[1.65rem] px-1.5 rounded-md border border-slate-600/60 bg-slate-800/80 font-mono text-[11px] text-slate-300 shadow-[inset_0_-1px_0_rgba(0,0,0,0.4)]">
      {children}
    </kbd>
  )
}

function Row({ entry }: { entry: Entry }) {
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="flex items-center gap-1 shrink-0 min-w-[7.5rem] flex-wrap">
        {entry.keys.map((k, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && entry.keys.length <= 4 && <span className="text-slate-600 text-xs">+</span>}
            <Kbd>{k}</Kbd>
          </span>
        ))}
      </div>
      <span className="text-sm text-slate-400 leading-snug">{entry.desc}</span>
    </div>
  )
}

export default function ShortcutsHelp() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const openHelp = () => setOpen(o => !o)
    window.addEventListener('leo-help-open', openHelp)
    return () => window.removeEventListener('leo-help-open', openHelp)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Ignore while a case-study overlay is open (it sits above this panel)
      if (window.location.pathname.includes('/portfolio/project/')) return
      // Ignore keystrokes typed into form fields / the terminal
      const node = e.target as HTMLElement | null
      if (node && (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA' || node.isContentEditable)) return
      if (e.key === '?') {
        e.preventDefault()
        setOpen(o => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
            className="relative w-full max-w-lg rounded-xl border border-slate-700/60 bg-[#1e1e2e] shadow-2xl overflow-hidden"
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-700/40">
              <div className="flex items-center gap-2.5">
                <Keyboard size={15} className="text-emerald-400" />
                <span className="font-mono text-sm font-semibold text-slate-200">keyboard & secrets</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close shortcuts"
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">
              {/* Shortcuts */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400">shortcuts</span>
                <span className="flex-1 h-px bg-slate-700/40" />
              </div>
              {SHORTCUTS.map(s => <Row key={s.desc} entry={s} />)}

              {/* Secrets */}
              <div className="flex items-center gap-2 mt-5 mb-1.5">
                <Sparkles size={11} className="text-violet-400" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet-400">secrets & easter eggs</span>
                <span className="flex-1 h-px bg-slate-700/40" />
              </div>
              {SECRETS.map(s => <Row key={s.desc} entry={s} />)}

              <p className="mt-4 text-xs text-slate-600 font-mono leading-relaxed">
                tip — everything is reachable from the command palette, including sound FX, theme
                cycling, professional mode and party confetti.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
