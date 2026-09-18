import { useEffect, useState } from 'react'
import { PenLine, Sparkles } from 'lucide-react'
import { loadGuestbook } from '../lib/guestbook'
import type { GuestbookEntry } from '../lib/guestbook'

// ═══════════════════════════════════════════════════════════════════════════
// GuestbookMarquee — scrolling ticker of visitor signatures, fed by the
// `sign <name> <message>` command in leo-cli. Pauses on hover.
// Enhanced: animated gradient border, glowing entry pills with cycling
// accent colors, sparkle separators, and a light-sweep shimmer.
// ═══════════════════════════════════════════════════════════════════════════

// Cycling accent palette for entry pills (dark-terminal friendly)
const ACCENTS = [
  { text: 'text-emerald-300', border: 'border-emerald-500/40', glow: 'shadow-[0_0_18px_-4px_rgba(16,185,129,0.45)]', dot: 'bg-emerald-400' },
  { text: 'text-cyan-300', border: 'border-cyan-500/40', glow: 'shadow-[0_0_18px_-4px_rgba(34,211,238,0.45)]', dot: 'bg-cyan-400' },
  { text: 'text-violet-300', border: 'border-violet-500/40', glow: 'shadow-[0_0_18px_-4px_rgba(139,92,246,0.45)]', dot: 'bg-violet-400' },
  { text: 'text-blue-300', border: 'border-blue-500/40', glow: 'shadow-[0_0_18px_-4px_rgba(59,130,246,0.45)]', dot: 'bg-blue-400' },
  { text: 'text-pink-300', border: 'border-pink-500/40', glow: 'shadow-[0_0_18px_-4px_rgba(236,72,153,0.45)]', dot: 'bg-pink-400' },
] as const

function EntryPill({ entry, index }: { entry: GuestbookEntry; index: number }) {
  const a = ACCENTS[index % ACCENTS.length]
  return (
    <span
      className={`
        gb-pill group/pill inline-flex items-center gap-2.5
        rounded-full border ${a.border} ${a.glow}
        bg-slate-900/70 backdrop-blur-sm
        px-4 py-2
        transition-all duration-300
        hover:-translate-y-0.5 hover:bg-slate-800/80
      `}
    >
      <span className={`relative flex h-1.5 w-1.5 shrink-0`}>
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${a.dot} opacity-60`} />
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${a.dot}`} />
      </span>
      <span className={`font-mono text-xs font-semibold ${a.text}`}>{entry.name}</span>
      <span className="text-slate-600 select-none">·</span>
      <span className="font-mono text-xs text-slate-300/90">{entry.message}</span>
    </span>
  )
}

function SparkleDivider() {
  return (
    <span className="gb-sparkle inline-flex items-center text-emerald-500/60 select-none" aria-hidden>
      <Sparkles size={13} />
    </span>
  )
}

export default function GuestbookMarquee() {
  const [entries, setEntries] = useState<GuestbookEntry[]>(() => loadGuestbook())

  useEffect(() => {
    const handler = () => setEntries(loadGuestbook())
    window.addEventListener('leo-guestbook-updated', handler)
    return () => window.removeEventListener('leo-guestbook-updated', handler)
  }, [])

  if (entries.length === 0) return null

  // Duplicate the list so the -50% translate loops seamlessly
  const loop = [...entries, ...entries]

  return (
    <div className="mt-12">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <span className="relative flex items-center justify-center h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
          <PenLine size={13} className="text-emerald-400 gb-pen" />
        </span>
        <span className="gb-header-text font-mono text-[11px] uppercase tracking-[0.25em] bg-gradient-to-r from-emerald-300 via-cyan-300 to-violet-300 bg-clip-text text-transparent">
          guestbook
        </span>
        <span className="font-mono text-[10px] text-slate-600">
          — sign it from the terminal: <code className="text-emerald-400/80">sign &lt;name&gt; &lt;message&gt;</code>
        </span>
      </div>

      {/* Animated gradient-border container */}
      <div className="gb-border-wrap relative rounded-2xl p-px overflow-hidden">
        {/* Animated gradient border layer */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-2xl"
          style={{
            background:
              'linear-gradient(115deg, rgba(16,185,129,0.5), rgba(34,211,238,0.35), rgba(139,92,246,0.4), rgba(236,72,153,0.35), rgba(16,185,129,0.5))',
            backgroundSize: '300% 300%',
            animation: 'gb-border-flow 8s linear infinite',
          }}
        />

        {/* Inner content */}
        <div className="group relative overflow-hidden rounded-2xl bg-[#0b0f16]/95 py-4">
          {/* Edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-20 z-10 bg-gradient-to-r from-[#0b0f16] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 z-10 bg-gradient-to-l from-[#0b0f16] to-transparent" />

          {/* Light-sweep shimmer */}
          <div
            aria-hidden
            className="gb-shimmer pointer-events-none absolute inset-y-0 w-1/3 z-[5]"
            style={{
              background:
                'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.045) 50%, transparent 80%)',
              animation: 'gb-shimmer-sweep 6s ease-in-out infinite',
            }}
          />

          <div
            className="gb-marquee flex w-max items-center gap-6 whitespace-nowrap group-hover:[animation-play-state:paused]"
            style={{ animation: 'guestbook-marquee 45s linear infinite' }}
          >
            {loop.map((e, i) => (
              <span key={`${e.ts}-${i}`} className="flex items-center gap-6">
                <EntryPill entry={e} index={i % entries.length} />
                <SparkleDivider />
              </span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes guestbook-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes gb-border-flow { 0% { background-position: 0% 50%; } 100% { background-position: 300% 50%; } }
        @keyframes gb-shimmer-sweep { 0% { transform: translateX(-120%); } 60%, 100% { transform: translateX(420%); } }
        @keyframes gb-sparkle-twinkle { 0%, 100% { opacity: 0.35; transform: scale(1); } 50% { opacity: 1; transform: scale(1.25); } }
        @keyframes gb-pen-write { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-12deg); } 75% { transform: rotate(12deg); } }
        .gb-sparkle { animation: gb-sparkle-twinkle 2.4s ease-in-out infinite; }
        .gb-pen { animation: gb-pen-write 2.8s ease-in-out infinite; transform-origin: 70% 80%; }
        .gb-header-text { background-size: 200% auto; animation: gb-header-shine 5s linear infinite; }
        @keyframes gb-header-shine { 0% { background-position: 0% center; } 100% { background-position: 200% center; } }
        @media (prefers-reduced-motion: reduce) {
          .gb-marquee, .gb-sparkle, .gb-pen, .gb-header-text, .gb-shimmer { animation: none !important; }
          [style*="gb-border-flow"] { animation: none !important; }
        }
      `}</style>
    </div>
  )
}
