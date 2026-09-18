import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { isSoundOn } from '../lib/sound'
import { toggleLang } from '../pages/portfolio/i18n'

interface CommandPaletteProps {
  onNavigate: (sectionIdx: number) => void
  onToggleTheme: () => void
  onToggleProfessional?: () => void
}

const COMMANDS = [
  { id: 'hero', label: 'Go to Hero', icon: '🏠', category: 'Navigation', action: 'nav:0' },
  { id: 'checkout', label: 'Go to Skill Checkout', icon: '🛒', category: 'Navigation', action: 'nav:1' },
  { id: 'about', label: 'Go to About', icon: '👤', category: 'Navigation', action: 'nav:2' },
  { id: 'chronicle', label: 'Go to Career Chronicle', icon: '📖', category: 'Navigation', action: 'nav:3' },
  { id: 'tender', label: 'Go to Money Layer', icon: '💳', category: 'Navigation', action: 'nav:4' },
  { id: 'loyalty', label: 'Go to Loyalty Vault', icon: '🏅', category: 'Navigation', action: 'nav:5' },
  { id: 'metrics', label: 'Go to Metrics', icon: '📊', category: 'Navigation', action: 'nav:6' },
  { id: 'activity', label: 'Go to Activity Graph', icon: '🟩', category: 'Navigation', action: 'nav:7' },
  { id: 'skills', label: 'Go to Skills', icon: '⚡', category: 'Navigation', action: 'nav:8' },
  { id: 'works', label: 'Browse Selected Works', icon: '✦', category: 'Navigation', action: 'nav:9' },
  { id: 'projects', label: 'Go to Project Explorer', icon: '💻', category: 'Navigation', action: 'nav:10' },
  { id: 'lab', label: 'Go to The Lab', icon: '🧪', category: 'Navigation', action: 'nav:11' },
  { id: 'testimonials', label: 'Go to Testimonials', icon: '⭐', category: 'Navigation', action: 'nav:12' },
  { id: 'kanban', label: 'Go to Kanban Board', icon: '📋', category: 'Navigation', action: 'nav:13' },
  { id: 'contact', label: 'Go to Contact', icon: '✉️', category: 'Navigation', action: 'nav:14' },
  { id: 'theme', label: 'Toggle Theme', icon: '🎨', category: 'Actions', action: 'theme' },
  { id: 'top', label: 'Back to Top', icon: '⬆️', category: 'Actions', action: 'nav:0' },
  { id: 'github', label: 'Open GitHub', icon: '🐙', category: 'Links', action: 'link:https://github.com' },
  { id: 'linkedin', label: 'Open LinkedIn', icon: '💼', category: 'Links', action: 'link:https://linkedin.com' },
  { id: 'email', label: 'Copy Email', icon: '📧', category: 'Actions', action: 'copy-email' },
  { id: 'terminal', label: 'Open Terminal', icon: '💻', category: 'Actions', action: 'open-terminal' },
  { id: 'help', label: 'Keyboard Shortcuts & Secrets', icon: '⌨️', category: 'Actions', action: 'help' },
  { id: 'confetti', label: 'Party Mode 🎉', icon: '🎊', category: 'Fun', action: 'confetti' },
  { id: 'crt', label: 'Toggle CRT Mode', icon: '🕹️', category: 'Fun', action: 'crt' },
  { id: 'achievements', label: 'View Achievements', icon: '🏆', category: 'Fun', action: 'achievements' },
  { id: 'konami-hint', label: 'Konami Hint', icon: '🗝️', category: 'Fun', action: 'konami-hint' },
  { id: 'sound', label: 'Toggle Sound FX', icon: '🔊', category: 'Actions', action: 'sound' },
  { id: 'professional', label: 'Toggle Professional Mode', icon: '💼', category: 'Actions', action: 'professional' },
  { id: 'language', label: 'Switch Language (EN/VI)', icon: '🌐', category: 'Actions', action: 'language' },
]

function HighlightedLabel({ text, query }: { text: string; query: string }) {
  if (!query) return <span>{text}</span>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <span>{text}</span>
  return (
    <span>
      {text.slice(0, idx)}
      <span className="font-bold text-emerald-400">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </span>
  )
}

function ConfettiEffect() {
  const particles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'][Math.floor(Math.random() * 6)],
      delay: Math.random() * 0.5,
      duration: 1.5 + Math.random() * 1.5,
      size: 6 + Math.random() * 6,
      rotation: Math.random() * 360,
      shape: Math.random() > 0.5 ? 'circle' : 'square',
    })), [])

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute top-0"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, backgroundColor: p.color, borderRadius: p.shape === 'circle' ? '50%' : '2px' }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: '100vh', opacity: 0, rotate: p.rotation + 360 }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  )
}

export default function CommandPalette({ onNavigate, onToggleTheme, onToggleProfessional }: CommandPaletteProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [copiedToast, setCopiedToast] = useState(false)
  const [hintToast, setHintToast] = useState(false)
  const [soundToast, setSoundToast] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Global keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore hotkeys while a case-study overlay is open (its modal sits above
      // the palette in the z-order, so opening it here would be invisible)
      if (window.location.pathname.includes('/portfolio/project/')) return
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(prev => !prev)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Open via external trigger (⌘K button in the mobile section dock)
  useEffect(() => {
    const openPalette = () => { setOpen(true); setQuery('') }
    window.addEventListener('leo-palette-open', openPalette)
    return () => window.removeEventListener('leo-palette-open', openPalette)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Filter commands
  const filtered = useMemo(() => {
    if (!query) return COMMANDS
    const q = query.toLowerCase()
    return COMMANDS.filter(c => c.label.toLowerCase().includes(q) || c.category.toLowerCase().includes(q))
  }, [query])

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<string, typeof COMMANDS>()
    for (const cmd of filtered) {
      if (!map.has(cmd.category)) map.set(cmd.category, [])
      map.get(cmd.category)!.push(cmd)
    }
    return map
  }, [filtered])

  // Flat list for navigation
  const flatList = useMemo(() => filtered, [filtered])

  // Execute command
  const execute = useCallback((action: string) => {
    setOpen(false)
    if (action.startsWith('nav:')) {
      onNavigate(parseInt(action.split(':')[1]))
    } else if (action === 'theme') {
      onToggleTheme()
    } else if (action.startsWith('link:')) {
      window.open(action.slice(5), '_blank')
    } else if (action === 'copy-email') {
      navigator.clipboard.writeText('hello@portfolio.dev')
      setCopiedToast(true)
      setTimeout(() => setCopiedToast(false), 2000)
    } else if (action === 'confetti') {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    } else if (action === 'open-terminal') {
      window.dispatchEvent(new CustomEvent('leo-terminal-open'))
    } else if (action === 'help') {
      window.dispatchEvent(new CustomEvent('leo-help-open'))
    } else if (action === 'crt') {
      window.dispatchEvent(new CustomEvent('leo-crt-toggle'))
    } else if (action === 'achievements') {
      window.dispatchEvent(new CustomEvent('leo-achievements-open'))
    } else if (action === 'konami-hint') {
      setHintToast(true)
      setTimeout(() => setHintToast(false), 3000)
    } else if (action === 'sound') {
      window.dispatchEvent(new CustomEvent('leo-sound-toggle'))
      setSoundToast(isSoundOn() ? '🔊 Sound FX on' : '🔇 Sound FX off')
      setTimeout(() => setSoundToast(null), 2000)
    } else if (action === 'professional') {
      onToggleProfessional?.()
    } else if (action === 'language') {
      const newLang = toggleLang()
      setSoundToast(newLang === 'vi' ? '🌐 Tiếng Việt' : '🌐 English')
      setTimeout(() => setSoundToast(null), 2000)
    }
  }, [onNavigate, onToggleTheme, onToggleProfessional])

  // Keyboard navigation inside palette
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, flatList.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (flatList[selectedIndex]) execute(flatList[selectedIndex].action)
    }
  }

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return
    const selected = listRef.current.querySelector(`[data-idx="${selectedIndex}"]`)
    selected?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />

            {/* Modal */}
            <motion.div
              className="relative max-w-lg w-full mx-4 mt-[20vh] h-fit bg-[#1e1e2e] border border-slate-700/60 rounded-xl shadow-2xl overflow-hidden"
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {/* Search input */}
              <div className="px-4 py-3 border-b border-slate-700/40 flex items-center gap-3">
                <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => { setQuery(e.target.value); setSelectedIndex(0) }}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Type a command..."
                  className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none font-mono"
                />
                <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-[10px] text-slate-400 font-mono shrink-0">⌘K</kbd>
              </div>

              {/* Results */}
              <div ref={listRef} className="overflow-y-auto" style={{ maxHeight: '320px' }}>
                {flatList.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-500">No commands found</div>
                ) : (
                  Array.from(grouped.entries()).map(([category, items]) => (
                    <div key={category}>
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 px-4 py-1.5">{category}</div>
                      {items.map(cmd => {
                        const idx = flatList.indexOf(cmd)
                        const isSelected = idx === selectedIndex
                        return (
                          <div
                            key={cmd.id}
                            data-idx={idx}
                            className={`px-4 py-2.5 flex items-center gap-3 cursor-pointer transition-colors ${isSelected ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]'}`}
                            onClick={() => execute(cmd.action)}
                            onMouseEnter={() => setSelectedIndex(idx)}
                          >
                            <span className="text-lg w-6 text-center">{cmd.icon}</span>
                            <span className="text-sm text-slate-200">
                              <HighlightedLabel text={cmd.label} query={query} />
                            </span>
                            {isSelected && (
                              <span className="text-[10px] text-slate-500 ml-auto font-mono">↵ to select</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Copied toast */}
      <AnimatePresence>
        {copiedToast && (
          <motion.div
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[150] px-4 py-2 rounded-lg bg-emerald-500/90 text-white text-sm font-mono shadow-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            Copied!
          </motion.div>
        )}
        {hintToast && (
          <motion.div
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[150] px-4 py-2 rounded-lg bg-violet-500/90 text-white text-sm font-mono shadow-lg tracking-widest"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            ↑ ↑ ↓ ↓ ← → ← → B A
          </motion.div>
        )}
        {soundToast && (
          <motion.div
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[150] px-4 py-2 rounded-lg bg-blue-500/90 text-white text-sm font-mono shadow-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {soundToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti */}
      {showConfetti && <ConfettiEffect />}
    </>
  )
}
