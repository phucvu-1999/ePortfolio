// ─── StyleSwitcher — floating dock to jump between portfolio variants ────────
// Mounted on every portfolio variant page (portfolio-1 … portfolio-4).
// Keyboard: press 0–4 to switch styles instantly.
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutGrid } from 'lucide-react'

export const PORTFOLIO_STYLES = [
  { path: '/portfolio', label: 'Original', num: '0' },
  { path: '/portfolio-1', label: 'Cinematic', num: '1' },
  { path: '/portfolio-2', label: 'Minimal', num: '2' },
  { path: '/portfolio-3', label: 'Brutal', num: '3' },
  { path: '/portfolio-4', label: 'Bento', num: '4' },
]

/** Extracts the variant base path from e.g. /portfolio-3/project/xyz → /portfolio-3 */
export function styleBaseOf(pathname: string): string {
  const m = pathname.match(/^(\/portfolio(?:-[1-4])?)/)
  return m ? m[1] : '/portfolio'
}

export default function StyleSwitcher({ variant = 'dark' }: { variant?: 'dark' | 'brutal' }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const active = styleBaseOf(pathname)
  const brutal = variant === 'brutal'

  /* ── Keyboard shortcuts: 0–4 switch styles ─────────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName ?? '').toLowerCase()
      if (tag === 'input' || tag === 'textarea' || e.metaKey || e.ctrlKey || e.altKey) return
      const style = PORTFOLIO_STYLES.find((s) => s.num === e.key)
      if (style && style.path !== active) navigate(style.path)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate, active])

  return (
    <div
      className="fixed bottom-4 left-1/2 z-[120] -translate-x-1/2"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div
        className={
          brutal
            ? 'flex items-center gap-1 border-[3px] border-black bg-white p-1 shadow-[6px_6px_0_#000]'
            : 'flex items-center gap-1 rounded-full border border-white/10 bg-black/70 p-1 shadow-xl backdrop-blur-xl'
        }
        role="navigation"
        aria-label="Portfolio style switcher"
      >
        <span
          className={
            brutal
              ? 'flex h-8 w-8 shrink-0 items-center justify-center bg-black'
              : 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5'
          }
          title="Portfolio styles — press 0-4 to switch"
        >
          <LayoutGrid size={13} className={brutal ? 'text-[#f5e100]' : 'text-emerald-400'} />
        </span>
        <div className="flex items-center gap-0.5">
          {PORTFOLIO_STYLES.map((s) => {
            const isActive = s.path === active
            return (
              <button
                key={s.path}
                onClick={() => navigate(s.path)}
                title={`${s.label} (press ${s.num})`}
                aria-current={isActive ? 'page' : undefined}
                className={
                  brutal
                    ? `px-2 py-1.5 text-[11px] font-black uppercase tracking-wide transition-colors ${
                        isActive ? 'bg-[#f5e100] text-black' : 'text-black hover:bg-black hover:text-white'
                      }`
                    : `rounded-full px-2 py-1.5 font-mono text-[11px] transition-colors ${
                        isActive
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'text-white/45 hover:bg-white/5 hover:text-white/80'
                      }`
                }
              >
                <span className="hidden sm:inline">{open || isActive ? s.label : s.num}</span>
                <span className="sm:hidden">{s.num}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
