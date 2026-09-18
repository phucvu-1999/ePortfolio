import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../contexts/ToastContext'
import { addGuestbookEntry, loadGuestbook } from '../lib/guestbook'
import { playSound } from '../lib/sound'

// ═══════════════════════════════════════════════════════════════════════════
// InteractiveTerminal — a visitor-facing CLI (leo-cli) docked bottom-right.
// Open via the launcher button, Ctrl+` , or the 'leo-terminal-open' event.
// ═══════════════════════════════════════════════════════════════════════════

interface InteractiveTerminalProps {
  onNavigate: (sectionIdx: number) => void
  onEvent?: (event: string) => void
  professionalMode?: boolean
}

type LineKind = 'input' | 'output' | 'error' | 'success' | 'system'
interface Line { id: number; kind: LineKind; text: string }

const HISTORY_KEY = 'leo-cli-history'
const SECTION_NAMES = ['hero', 'checkout', 'about', 'chronicle', 'tender', 'loyalty', 'metrics', 'activity', 'skills', 'works', 'projects', 'lab', 'testimonials', 'kanban', 'contact', 'footer']

const BANNER = [
  '██╗     ███████╗ ██████╗      ██╗     ██████╗',
  '██║     ██╔════╝██╔═══██╗    ███║    ██╔═████╗',
  '██║     █████╗  ██║   ██║    ╚██║    ██║██╔██║',
  '██║     ██╔══╝  ██║   ██║     ██║    ████╔╝██║',
  '███████╗███████╗╚██████╔╝     ██║    ╚██████╔╝',
  '╚══════╝╚══════╝ ╚═════╝      ╚═╝     ╚═════╝ ',
].join('\n')

const HELP_TEXT = [
  'Available commands:',
  '',
  '  help              show this list',
  '  whoami            who is leo?',
  '  skills            technical arsenal',
  '  projects          browse the showcase',
  '  contact           reach out',
  '  socials           links & profiles',
  '  sign <name> <msg> sign the guestbook (shows in the footer!)',
  '  guestbook         read what visitors wrote',
  '  goto <section>    jump to a section (e.g. goto contact)',
  '  theme <name>      set theme: dark | light | romantic',
  '  neofetch          system info card',
  '  history           command history',
  '  clear             wipe the screen',
  '',
  'Tip: use ↑/↓ for history, Tab to autocomplete.',
].join('\n')

const WHOAMI_TEXT = [
  'leo — creative developer & designer',
  '',
  'Builds cinematic web experiences with React, TypeScript and',
  'Framer Motion. Obsessed with terminals, motion and pixels',
  'that feel alive. Currently open to interesting problems.',
].join('\n')

const SKILLS_TEXT = [
  'languages    TypeScript · JavaScript · HTML · CSS · SQL',
  'frontend     React · Next.js · Framer Motion · GSAP · Tailwind',
  'backend      Node.js · Supabase · PostgreSQL · REST',
  'tooling      Vite · Git · Figma · Vitest',
  'practices    motion design · a11y · performance · DX',
].join('\n')

const PROJECTS_TEXT = [
  'Featured builds (run `goto projects` to explore):',
  '',
  '  [01] epos-v5          enterprise POS ecosystem — my flagship',
  '  [02] payment-gateway  NETS · NTUC · NEA payments & loyalty',
  '  [03] sync-engine      offline-first sync with conflict resolution',
  '  [04] sales-engine     high-velocity sales & order processing',
].join('\n')

const CONTACT_TEXT = [
  'email      hello@portfolio.dev   (click the mail icon in Contact)',
  'github     github.com/leo',
  'linkedin   linkedin.com/in/leo',
  '',
  'or run:  goto contact',
].join('\n')

const SOCIALS_TEXT = [
  '🐙 github     github.com/leo',
  '💼 linkedin   linkedin.com/in/leo',
  '🐦 twitter    twitter.com/leo_dev',
  '✉️  email      hello@portfolio.dev',
].join('\n')

const LS_TEXT = [
  'about.tsx        chronicle.tsx    metrics.tsx',
  'skills.tsx       projects.tsx     contact.tsx',
  'secrets/         .vimrc           .regrets (0 bytes)',
].join('\n')

const RESUME_TEXT = [
  'resume.txt — leo, creative developer',
  '',
  '2021–now   Senior Frontend Engineer — various rockets 🚀',
  '2019–21    UI Engineer — design systems & motion',
  '2017–19    Web Developer — agency life, 100+ launches',
  '',
  '(the real one is available on request — run `goto contact`)',
].join('\n')

const COMMAND_NAMES = [
  'help', 'whoami', 'skills', 'projects', 'contact', 'socials', 'goto',
  'theme', 'neofetch', 'history', 'clear', 'banner', 'ls', 'cat',
  'sudo', 'sign', 'guestbook', 'vim', 'vi', 'exit', 'quit', 'logout',
]

function TerminalConfetti() {
  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899']
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 36 }).map((_, i) => {
        const angle = (i / 36) * Math.PI * 2
        const dist = 90 + (i % 6) * 38
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 w-1.5 h-2.5 rounded-[2px]"
            style={{ background: colors[i % colors.length] }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist + 70, opacity: 0, rotate: (i % 2 ? 1 : -1) * 420 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        )
      })}
    </div>
  )
}

export default function InteractiveTerminal({ onNavigate, onEvent, professionalMode }: InteractiveTerminalProps) {
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [lines, setLines] = useState<Line[]>([])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') as string[] } catch { return [] }
  })
  const [burst, setBurst] = useState(0)

  const { theme, setTheme } = useTheme()
  const { showToast } = useToast()
  const idRef = useRef(0)
  const histIdxRef = useRef(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const openedOnceRef = useRef(false)
  const launcherRef = useRef<HTMLButtonElement>(null)
  const touchYRef = useRef<number | null>(null)

  const push = useCallback((entries: Array<{ kind: LineKind; text: string }>) => {
    setLines(prev => [...prev, ...entries.map(e => ({ id: ++idRef.current, kind: e.kind, text: e.text }))])
    for (const e of entries) {
      if (e.kind === 'success') playSound('success')
      else if (e.kind === 'error') playSound('error')
    }
  }, [])

  // Open via external event (command palette, achievements, etc.)
  useEffect(() => {
    const handler = () => { setOpen(true); setMinimized(false) }
    window.addEventListener('leo-terminal-open', handler)
    return () => window.removeEventListener('leo-terminal-open', handler)
  }, [])

  // Ctrl+` shortcut, Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore hotkeys while a case-study overlay is open (the terminal would
      // open invisibly behind it)
      if (window.location.pathname.includes('/portfolio/project/')) return
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault()
        setOpen(prev => !prev)
        setMinimized(false)
      }
      if (e.key === 'Escape') {
        setOpen(prev => {
          if (prev) launcherRef.current?.focus()
          return false
        })
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Boot banner on first open
  useEffect(() => {
    if (open && !openedOnceRef.current) {
      openedOnceRef.current = true
      playSound('open')
      push([
        { kind: 'system', text: BANNER },
        { kind: 'system', text: 'leo-cli v2.0 · welcome, visitor · type `help` to begin' },
      ])
      onEvent?.('terminal-opened')
      window.dispatchEvent(new CustomEvent('leo-achievement', { detail: 'hello-world' }))
    }
  }, [open, push, onEvent])

  // Focus + auto-scroll
  useEffect(() => {
    if (open && !minimized) setTimeout(() => inputRef.current?.focus(), 80)
  }, [open, minimized])
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [lines, open, minimized])

  const execute = useCallback((raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed) return
    push([{ kind: 'input', text: trimmed }])
    setHistory(prev => {
      const next = [...prev, trimmed].slice(-50)
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
    histIdxRef.current = -1

    const [cmd, ...args] = trimmed.split(/\s+/)
    const name = cmd.toLowerCase()
    onEvent?.(`cmd:${name}`)

    switch (name) {
      case 'help':
        push([{ kind: 'output', text: HELP_TEXT }])
        break
      case 'whoami':
        push([{ kind: 'output', text: WHOAMI_TEXT }])
        break
      case 'skills':
        push([{ kind: 'output', text: SKILLS_TEXT }])
        break
      case 'projects':
        push([{ kind: 'output', text: PROJECTS_TEXT }])
        break
      case 'contact':
        push([{ kind: 'output', text: CONTACT_TEXT }])
        break
      case 'socials':
        push([{ kind: 'output', text: SOCIALS_TEXT }])
        break
      case 'sign': {
        const name = args[0]
        const message = args.slice(1).join(' ')
        if (!name || !message) {
          push([{ kind: 'error', text: 'usage: sign <name> <message>   e.g. sign ada nice terminal!' }])
        } else if (name.length > 20 || message.length > 120) {
          push([{ kind: 'error', text: 'keep it short — name ≤ 20 chars, message ≤ 120 chars.' }])
        } else {
          addGuestbookEntry(name, message)
          push([{ kind: 'success', text: `✍️ signed! thanks, ${name} — your words are rolling through the footer now.` }])
          showToast('✍️ Guestbook signed — check the footer!', 'success')
        }
        break
      }
      case 'guestbook': {
        const entries = loadGuestbook()
        push([{
          kind: 'output',
          text: entries.length
            ? 'Recent signatures:\n\n' + entries.slice(-8).reverse().map(e => `  ✍️  ${e.name.padEnd(14)} ${e.message}`).join('\n') + '\n\n(add yours: sign <name> <message>)'
            : '(empty — be the first: sign <name> <message>)',
        }])
        break
      }
      case 'banner':
        push([{ kind: 'system', text: BANNER }])
        break
      case 'ls':
        push([{ kind: 'output', text: LS_TEXT }])
        break
      case 'cat': {
        const file = args[0] || ''
        if (file === 'resume.txt') push([{ kind: 'output', text: RESUME_TEXT }])
        else if (file === '.regrets') push([{ kind: 'output', text: '(empty — zero regrets, ship it)' }])
        else if (file) push([{ kind: 'error', text: `cat: ${file}: permission denied (nice try)` }])
        else push([{ kind: 'error', text: 'usage: cat <file>   try: cat resume.txt' }])
        break
      }
      case 'goto': {
        const target = (args[0] || '').toLowerCase()
        const idx = SECTION_NAMES.findIndex(s => s.startsWith(target))
        if (idx >= 0) {
          push([{ kind: 'success', text: `→ warping to ${SECTION_NAMES[idx]}...` }])
          onNavigate(idx)
        } else {
          push([{ kind: 'error', text: `unknown section '${target || '?'}' — options: ${SECTION_NAMES.join(', ')}` }])
        }
        break
      }
      case 'theme': {
        const want = (args[0] || '').toLowerCase()
        if (!want) {
          push([{ kind: 'output', text: `current theme: ${theme} — usage: theme dark|light|romantic` }])
        } else if (want === 'dark' || want === 'light' || want === 'romantic') {
          setTheme(want)
          push([{ kind: 'success', text: `theme set to ${want} ✓` }])
        } else {
          push([{ kind: 'error', text: `unknown theme '${want}' — try dark, light or romantic` }])
        }
        break
      }
      case 'neofetch':
        push([{
          kind: 'output',
          text: [
            '       /\\        leo@portfolio',
            '      /  \\       ─────────────',
            '     / /\\ \\      shell   leo-cli 2.0',
            '    / ____ \\     theme   ' + theme,
            '   /_/    \\_\\    uptime  since you opened this tab',
          ].join('\n'),
        }])
        break
      case 'history':
        push([{ kind: 'output', text: history.length ? history.map((h, i) => `  ${i + 1}  ${h}`).join('\n') : '(history is empty — make some noise)' }])
        break
      case 'clear':
        setLines([])
        break
      case 'sudo':
        if (args.join(' ') === 'hire-me') {
          setBurst(b => b + 1)
          push([{ kind: 'success', text: 'ACCESS GRANTED — excellent decision. taking you to contact...' }])
          showToast('🎉 Hired! (well, almost — say hi below)', 'success')
          window.dispatchEvent(new CustomEvent('leo-achievement', { detail: 'deal-maker' }))
          setTimeout(() => onNavigate(14), 500)
        } else {
          push([{ kind: 'error', text: 'leo is not in the sudoers file. this incident will be reported. 🚨' }])
        }
        break
      case 'rm':
        push([{ kind: 'error', text: 'nice try. this portfolio is indestructible. 💪' }])
        window.dispatchEvent(new CustomEvent('leo-achievement', { detail: 'jailbreak' }))
        break
      case 'vim':
      case 'vi':
        push([{ kind: 'error', text: 'you can check out any time you like, but you can never leave. 🏨' }])
        window.dispatchEvent(new CustomEvent('leo-achievement', { detail: 'jailbreak' }))
        break
      case 'exit':
      case 'quit':
      case 'logout':
        push([{ kind: 'error', text: 'there is no escape from the portfolio. (but the ✕ button works)' }])
        window.dispatchEvent(new CustomEvent('leo-achievement', { detail: 'jailbreak' }))
        break
      default:
        push([{ kind: 'error', text: `command not found: ${name} — type \`help\`` }])
    }
  }, [push, history, theme, onNavigate, onEvent, setTheme, showToast])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      execute(input)
      setInput('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!history.length) return
      histIdxRef.current = histIdxRef.current === -1 ? history.length - 1 : Math.max(0, histIdxRef.current - 1)
      setInput(history[histIdxRef.current])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (histIdxRef.current === -1) return
      histIdxRef.current += 1
      if (histIdxRef.current >= history.length) { histIdxRef.current = -1; setInput('') }
      else setInput(history[histIdxRef.current])
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const frag = input.trim().toLowerCase()
      if (!frag) return
      const matches = COMMAND_NAMES.filter(c => c.startsWith(frag))
      if (matches.length === 1) setInput(matches[0] + ' ')
      else if (matches.length > 1) push([{ kind: 'system', text: matches.join('   ') }])
    }
  }

  const kindColor: Record<LineKind, string> = {
    input: 'text-slate-100',
    output: 'text-slate-300',
    error: 'text-red-400',
    success: 'text-emerald-400',
    system: 'text-blue-400',
  }

  return (
    <>
      {/* Launcher button */}
      <motion.button
        ref={launcherRef}
        onClick={() => { setOpen(prev => !prev); setMinimized(false) }}
        className="fixed bottom-6 right-6 z-[80] w-12 h-12 rounded-full bg-[#0d1117] border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:scale-110 transition-all"
        whileTap={{ scale: 0.92 }}
        aria-label="Open terminal"
        title="Open terminal (Ctrl+`)"
      >
        <span className="font-mono text-sm font-bold">&gt;_</span>
        {!professionalMode && <span className="absolute inset-0 rounded-full border border-emerald-400/40" style={{ animation: 'glowpulse 2.4s ease-in-out infinite' }} />}
      </motion.button>

      {/* Terminal window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed bottom-22 right-4 sm:right-6 z-[85] w-[calc(100vw-2rem)] max-w-[560px] rounded-xl overflow-hidden border border-slate-700/60 bg-[#0d1117]/95 backdrop-blur-md shadow-2xl shadow-black/60"
            style={{ bottom: minimized ? '5.5rem' : '5.5rem' }}
            onClick={() => inputRef.current?.focus()}
          >
            {/* Title bar (swipe down on mobile to dismiss) */}
            <div
              className="flex items-center gap-2 px-3.5 py-2.5 bg-[#161b22] border-b border-slate-700/50 select-none touch-none"
              onTouchStart={e => { touchYRef.current = e.touches[0].clientY }}
              onTouchEnd={e => {
                if (touchYRef.current === null) return
                const dy = e.changedTouches[0].clientY - touchYRef.current
                touchYRef.current = null
                if (dy > 56) { setOpen(false); launcherRef.current?.focus() }
              }}
            >
              <button onClick={() => { setOpen(false); launcherRef.current?.focus() }} className="w-6 h-6 -ml-1.5 flex items-center justify-center rounded-md hover:bg-white/5" aria-label="Close terminal">
                <span className="w-3 h-3 rounded-full bg-red-500/90 group-hover:bg-red-400 transition-colors" />
              </button>
              <button onClick={() => setMinimized(m => !m)} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/5" aria-label={minimized ? 'Expand terminal' : 'Minimize terminal'}>
                <span className="w-3 h-3 rounded-full bg-yellow-500/90 hover:bg-yellow-400 transition-colors" />
              </button>
              <div className="w-3 h-3 rounded-full bg-emerald-500/90" />
              <span className="ml-3 font-mono text-[11px] text-slate-400 flex items-center gap-1.5">
                <ChevronRight size={12} className="text-emerald-400" /> leo@portfolio: ~
              </span>
              <span className="ml-auto font-mono text-[10px] text-slate-600 hidden sm:block">Ctrl+` to toggle</span>
              <button onClick={() => { setOpen(false); launcherRef.current?.focus() }} className="ml-2 p-1.5 -mr-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors" aria-label="Close">
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            {!minimized && (
              <div className="relative">
                {burst > 0 && <TerminalConfetti key={burst} />}
                <div ref={scrollRef} role="log" aria-live="polite" aria-label="Terminal output" className="h-[300px] max-h-[48dvh] sm:h-[360px] sm:max-h-none overflow-y-auto px-4 py-3 font-mono text-[12.5px] leading-relaxed">
                  {lines.map(line => (
                    <div key={line.id} className={`whitespace-pre-wrap break-words mb-1.5 ${kindColor[line.kind]}`}>
                      {line.kind === 'input' && (
                        <>
                          <span className="text-emerald-400">leo@portfolio</span>
                          <span className="text-slate-500">:</span>
                          <span className="text-blue-400">~</span>
                          <span className="text-slate-500">$ </span>
                        </>
                      )}
                      {line.text}
                    </div>
                  ))}
                  {/* Input line */}
                  <div className="flex items-center gap-0">
                    <span className="text-emerald-400 shrink-0">leo@portfolio</span>
                    <span className="text-slate-500 shrink-0">:</span>
                    <span className="text-blue-400 shrink-0">~</span>
                    <span className="text-slate-500 shrink-0">$&nbsp;</span>
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={e => { setInput(e.target.value); playSound('key') }}
                      onKeyDown={handleKeyDown}
                      onFocus={() => setTimeout(() => inputRef.current?.scrollIntoView({ block: 'nearest' }), 300)}
                      className="flex-1 min-w-0 min-h-[32px] bg-transparent outline-none text-slate-100 font-mono text-[12.5px] caret-emerald-400"
                      spellCheck={false}
                      autoComplete="off"
                      autoCapitalize="off"
                      aria-label="Terminal input"
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
