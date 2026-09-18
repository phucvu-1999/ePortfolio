interface MarqueeBandProps {
  /** Phrases that loop across the band — alternate phrases render outlined */
  phrases: string[]
  /** Accent color for the ✦ separators and the hover tint */
  accent?: string
  /** Scroll right-to-left (default) or left-to-right */
  reverse?: boolean
  /** Slight tilt in degrees for that printed-poster energy */
  tilt?: number
}

/**
 * Kinetic typography band — the Awwwards staple used between sections.
 * Big display type scrolls infinitely; alternating phrases are rendered
 * as hollow outlined text. Pauses on hover. Purely decorative.
 */
export default function MarqueeBand({ phrases, accent = '#10b981', reverse = false, tilt = -1.5 }: MarqueeBandProps) {
  const Row = () => (
    <div className="flex items-center shrink-0">
      {phrases.map((p, i) => (
        <span key={i} className="flex items-center shrink-0">
          <span
            className={`font-display text-4xl md:text-6xl font-bold uppercase tracking-tight whitespace-nowrap px-7 ${
              i % 2 === 0 ? 'text-slate-500' : 'text-transparent [-webkit-text-stroke:1.5px_#475569]'
            }`}
          >
            {p}
          </span>
          <span className="text-xl md:text-2xl shrink-0" style={{ color: accent }}>
            ✦
          </span>
        </span>
      ))}
    </div>
  )

  return (
    <div
      className="relative w-[110%] -ml-[5%] my-6 overflow-hidden border-y border-slate-800/60 bg-slate-900/20 py-5 md:py-7 group"
      style={{ transform: `rotate(${tilt}deg)` }}
      aria-hidden
    >
      <style>{`@keyframes marquee-band { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
      <div
        className="flex w-max group-hover:[animation-play-state:paused]"
        style={{ animation: `marquee-band ${reverse ? 44 : 34}s linear infinite ${reverse ? 'reverse' : ''}` }}
      >
        <Row />
        <Row />
      </div>
    </div>
  )
}
