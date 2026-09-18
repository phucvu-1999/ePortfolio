// ═══════════════════════════════════════════════════════════════════════════
// Sound — tiny Web Audio blips, strictly opt-in (default OFF, persisted).
// Respects prefers-reduced-motion by silencing the high-frequency key clicks.
// Toggle from anywhere via the 'leo-sound-toggle' event (command palette).
// ═══════════════════════════════════════════════════════════════════════════

export type SoundKind = 'key' | 'open' | 'success' | 'error' | 'unlock'

const STORAGE_KEY = 'leo-sound-on'

let ctx: AudioContext | null = null
let enabled = false
try { enabled = localStorage.getItem(STORAGE_KEY) === '1' } catch { /* ignore */ }

const listeners = new Set<(on: boolean) => void>()

function reducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

function ensureCtx(): AudioContext | null {
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return null
      ctx = new AC()
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

export function isSoundOn(): boolean {
  return enabled
}

export function setSoundOn(on: boolean): void {
  enabled = on
  try { localStorage.setItem(STORAGE_KEY, on ? '1' : '0') } catch { /* ignore */ }
  listeners.forEach(l => l(on))
  if (on) ensureCtx() // warm up on a user gesture
}

export function toggleSound(): boolean {
  setSoundOn(!enabled)
  return enabled
}

export function onSoundChange(fn: (on: boolean) => void): () => void {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}

// Module-level toggle listener (installed once)
if (typeof window !== 'undefined') {
  window.addEventListener('leo-sound-toggle', () => toggleSound())
}

/** One oscillator note with a quick attack/decay envelope. */
function tone(
  ac: AudioContext,
  freq: number,
  start: number,
  dur: number,
  gain: number,
  type: OscillatorType = 'sine',
  slideTo?: number,
) {
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + dur)
  g.gain.setValueAtTime(0.0001, start)
  g.gain.exponentialRampToValueAtTime(gain, start + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  osc.connect(g).connect(ac.destination)
  osc.start(start)
  osc.stop(start + dur + 0.05)
}

export function playSound(kind: SoundKind): void {
  if (!enabled) return
  // Reduced motion → skip the per-keystroke ticks (event sounds stay on)
  if (kind === 'key' && reducedMotion()) return

  const ac = ensureCtx()
  if (!ac) return
  const t = ac.currentTime + 0.005

  switch (kind) {
    case 'key':
      tone(ac, 2100 + Math.random() * 300, t, 0.035, 0.012, 'square')
      break
    case 'open':
      tone(ac, 440, t, 0.14, 0.035, 'sine', 880)
      break
    case 'success':
      tone(ac, 660, t, 0.09, 0.04)
      tone(ac, 990, t + 0.09, 0.12, 0.04)
      break
    case 'error':
      tone(ac, 190, t, 0.16, 0.04, 'sawtooth', 140)
      break
    case 'unlock':
      tone(ac, 523.25, t, 0.1, 0.045)          // C5
      tone(ac, 659.25, t + 0.1, 0.1, 0.045)    // E5
      tone(ac, 783.99, t + 0.2, 0.18, 0.05)    // G5
      break
  }
}
