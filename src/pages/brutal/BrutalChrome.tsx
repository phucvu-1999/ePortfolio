// ─── Brutal page chrome — rotating hire badge + square cursor ────────────────
// Shared extras for Portfolio3Brutal. Kept in its own module so the page
// component stays lean (same pattern as the cinematic/ modules).
import { useEffect, useRef, useState } from 'react'

const BORDER = '3px solid #000'
const SHADOW = '4px 4px 0px #000'

/* ── Rotating circular "HIRE ME" badge ─────────────────────────────────────── */
export function HireBadge() {
  const onClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const el = document.getElementById('contact')
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 64, behavior: 'smooth' })
  }
  return (
    <a
      href="#contact"
      onClick={onClick}
      aria-label="Hire me — jump to contact"
      style={{ position: 'relative', display: 'block', width: 116, height: 116 }}
    >
      <svg viewBox="0 0 100 100" width="116" height="116" style={{ display: 'block', animation: 'brutal-spin 12s linear infinite' }}>
        <defs>
          <path id="hire-circle-path" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" fill="none" />
        </defs>
        <circle cx="50" cy="50" r="48.5" fill="#fffdf5" stroke="#000" strokeWidth="3" />
        <text fill="#000" style={{ font: '900 9.5px system-ui, sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          <textPath href="#hire-circle-path">HIRE ME ★ LET'S TALK ★ HIRE ME</textPath>
        </text>
      </svg>
      <span style={{
        position: 'absolute', inset: '31% 31%', background: '#ff6b9d', border: BORDER, boxShadow: SHADOW,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.15rem',
      }}>
        ★
      </span>
    </a>
  )
}

/* ── Square custom cursor (fine pointers only) ─────────────────────────────── */
export function SquareCursor() {
  const [enabled] = useState(() => typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches)
  const dotRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enabled) return
    let x = -100, y = -100, fx = -100, fy = -100, raf = 0
    const onMove = (e: MouseEvent) => {
      x = e.clientX
      y = e.clientY
      const dot = dotRef.current
      if (dot) {
        dot.style.transform = `translate(${x - 4}px, ${y - 4}px)`
        dot.style.opacity = '1'
      }
      const frame = frameRef.current
      if (frame) frame.style.opacity = '1'
      const t = e.target as HTMLElement | null
      const interactive = !!t?.closest('a, button, input, textarea, select, label, [role="button"], .brutal-project-card')
      if (frame) frame.dataset.hover = interactive ? '1' : ''
    }
    const onLeave = () => {
      if (dotRef.current) dotRef.current.style.opacity = '0'
      if (frameRef.current) frameRef.current.style.opacity = '0'
    }
    const loop = () => {
      fx += (x - fx) * 0.16
      fy += (y - fy) * 0.16
      const frame = frameRef.current
      if (frame) {
        const hot = frame.dataset.hover === '1'
        frame.style.transform = `translate(${fx - 16}px, ${fy - 16}px) scale(${hot ? 1.45 : 1})`
        frame.style.background = hot ? 'rgba(245, 225, 0, 0.35)' : 'transparent'
      }
      raf = requestAnimationFrame(loop)
    }
    window.addEventListener('mousemove', onMove)
    document.documentElement.addEventListener('mouseleave', onLeave)
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('mousemove', onMove)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <>
      <div ref={dotRef} aria-hidden="true" style={{
        position: 'fixed', top: 0, left: 0, width: 8, height: 8, background: '#000',
        zIndex: 9999, pointerEvents: 'none', opacity: 0, transition: 'opacity .2s',
      }} />
      <div ref={frameRef} aria-hidden="true" data-hover="" style={{
        position: 'fixed', top: 0, left: 0, width: 32, height: 32, border: '3px solid #000',
        zIndex: 9998, pointerEvents: 'none', opacity: 0, transition: 'opacity .2s, background .15s',
      }} />
    </>
  )
}
