import { useEffect, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════
// useEasterEggs — global keyboard secrets for the portfolio.
//  · Konami code (↑↑↓↓←→←→BA) → CRT retro mode for 10 seconds
//  · Typing "leo" anywhere (outside inputs) → fires 'leo-scramble' event
// Emits achievement events via the optional onEvent callback.
// ═══════════════════════════════════════════════════════════════════════════

const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a',
]

function isTypingTarget(el: EventTarget | null): boolean {
  const node = el as HTMLElement | null
  if (!node || !node.tagName) return false
  const tag = node.tagName.toUpperCase()
  return tag === 'INPUT' || tag === 'TEXTAREA' || node.isContentEditable
}

export function useEasterEggs(onEvent?: (event: string) => void) {
  const [crtActive, setCrtActive] = useState(false)
  const konamiIdx = useRef(0)
  const leoBuffer = useRef('')
  const leoCooldown = useRef(false)
  const crtTimer = useRef<number | null>(null)
  const onEventRef = useRef(onEvent)
  onEventRef.current = onEvent

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // ── Konami code ──
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      if (key === KONAMI[konamiIdx.current]) {
        konamiIdx.current += 1
        if (konamiIdx.current === KONAMI.length) {
          konamiIdx.current = 0
          setCrtActive(true)
          onEventRef.current?.('konami')
          if (crtTimer.current) window.clearTimeout(crtTimer.current)
          crtTimer.current = window.setTimeout(() => setCrtActive(false), 10000)
        }
      } else {
        konamiIdx.current = key === KONAMI[0] ? 1 : 0
      }

      // ── "leo" typed anywhere (outside form fields) ──
      if (isTypingTarget(e.target)) {
        leoBuffer.current = ''
        return
      }
      if (e.key.length === 1) {
        leoBuffer.current = (leoBuffer.current + e.key.toLowerCase()).slice(-3)
        if (leoBuffer.current === 'leo' && !leoCooldown.current) {
          leoBuffer.current = ''
          leoCooldown.current = true
          onEventRef.current?.('leo-typed')
          window.dispatchEvent(new CustomEvent('leo-scramble'))
          window.setTimeout(() => { leoCooldown.current = false }, 8000)
        }
      }
    }

    window.addEventListener('keydown', handleKey)

    // External toggle (command palette)
    const toggleHandler = () => {
      setCrtActive(true)
      onEventRef.current?.('konami')
      if (crtTimer.current) window.clearTimeout(crtTimer.current)
      crtTimer.current = window.setTimeout(() => setCrtActive(false), 10000)
    }
    window.addEventListener('leo-crt-toggle', toggleHandler)

    return () => {
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('leo-crt-toggle', toggleHandler)
      if (crtTimer.current) window.clearTimeout(crtTimer.current)
    }
  }, [])

  return { crtActive }
}

// ─── CRT overlay rendered while retro mode is active ───────────────────────
export function CrtOverlay({ active }: { active: boolean }) {
  useEffect(() => {
    if (active) document.body.classList.add('crt-mode')
    else document.body.classList.remove('crt-mode')
    return () => document.body.classList.remove('crt-mode')
  }, [active])

  if (!active) return null
  return (
    <div className="fixed inset-0 z-[96] pointer-events-none" aria-hidden>
      <style>{`
        @keyframes crt-flicker { 0%, 100% { opacity: 0.85; } 50% { opacity: 0.65; } }
        @keyframes crt-roll { 0% { top: -12%; } 100% { top: 112%; } }
        body.crt-mode { filter: saturate(1.35) contrast(1.06); }
        body.crt-mode h1, body.crt-mode h2, body.crt-mode h3,
        body.crt-mode p, body.crt-mode span, body.crt-mode div,
        body.crt-mode button, body.crt-mode input {
          font-family: 'JetBrains Mono', monospace !important;
          letter-spacing: 0.02em;
        }
        @media (prefers-reduced-motion: reduce) {
          body.crt-mode * { animation: none !important; }
        }
      `}</style>
      {/* Scanlines */}
      <div
        className="absolute inset-0 opacity-25"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.55) 2px, rgba(0,0,0,0.55) 4px)', animation: 'crt-flicker 0.12s steps(2) infinite' }}
      />
      {/* RGB fringe */}
      <div className="absolute inset-0 opacity-[0.06]" style={{ background: 'linear-gradient(90deg, #ff0040, transparent 33%, #00ff88 50%, transparent 66%, #0080ff)' }} />
      {/* Rolling band */}
      <div className="absolute left-0 right-0 h-24 opacity-[0.08] bg-white blur-sm" style={{ animation: 'crt-roll 4s linear infinite' }} />
      {/* Vignette */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)' }} />
      {/* Mode badge */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded border border-emerald-400/60 bg-black/70 font-mono text-xs text-emerald-400 tracking-[0.3em] uppercase">
        ◉ CRT MODE — 30 free credits
      </div>
    </div>
  )
}
