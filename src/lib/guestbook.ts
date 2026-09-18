// ═══════════════════════════════════════════════════════════════════════════
// Guestbook storage — localStorage-backed with seed data.
// The `sign <name> <message>` command in leo-cli writes here.
// ═══════════════════════════════════════════════════════════════════════════

export interface GuestbookEntry {
  name: string
  message: string
  ts: number
}

const KEY = 'leo-guestbook'
const MAX_ENTRIES = 50

const SEED: GuestbookEntry[] = [
  { name: 'ada', message: 'nice terminal — you have a job if you want it', ts: 1704067200000 },
  { name: 'linus', message: 'LGTM 🚀 ship it', ts: 1706745600000 },
  { name: 'grace', message: 'smooth scrolling, even smoother code', ts: 1709251200000 },
  { name: 'margaret', message: 'the konami code made my day', ts: 1711929600000 },
]

function loadLocal(): GuestbookEntry[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]') as GuestbookEntry[]
    if (!Array.isArray(raw) || raw.length === 0) return SEED
    return raw.filter(e => typeof e.name === 'string' && typeof e.message === 'string')
  } catch {
    return SEED
  }
}

function saveLocal(entries: GuestbookEntry[]) {
  try { localStorage.setItem(KEY, JSON.stringify(entries)) } catch { /* ignore */ }
}

/** Load guestbook entries (localStorage, seeded on first visit). */
export function loadGuestbook(): GuestbookEntry[] {
  return loadLocal()
}

/** Add an entry, persist to localStorage, and notify listeners. */
export function addGuestbookEntry(name: string, message: string): GuestbookEntry[] {
  const next = [...loadLocal(), { name, message, ts: Date.now() }].slice(-MAX_ENTRIES)
  saveLocal(next)
  window.dispatchEvent(new CustomEvent('leo-guestbook-updated'))
  return next
}
