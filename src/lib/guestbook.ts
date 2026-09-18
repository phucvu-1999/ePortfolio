// ═══════════════════════════════════════════════════════════════════════════
// Guestbook storage — Supabase-backed with localStorage fallback.
// When Supabase is configured, reads/writes go to the guestbook_entries table.
// Otherwise, falls back to localStorage with seed data.
// ═══════════════════════════════════════════════════════════════════════════

import { isSupabaseConfigured, fetchGuestbookEntries, insertGuestbookEntry } from '../services/portfolioLive'

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

/** Whether we're using Supabase (live mode) or localStorage (fallback). */
export function isLiveMode(): boolean {
  return isSupabaseConfigured()
}

// ─── LocalStorage helpers (fallback) ────────────────────────────────────────

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

// ─── Public API ─────────────────────────────────────────────────────────────

/** Synchronous load — returns localStorage/seed data immediately. */
export function loadGuestbook(): GuestbookEntry[] {
  return loadLocal()
}

/** Async load — fetches from Supabase when configured, else localStorage. */
export async function loadGuestbookAsync(): Promise<GuestbookEntry[]> {
  if (!isSupabaseConfigured()) return loadLocal()
  try {
    const rows = await fetchGuestbookEntries()
    return rows.map(r => ({ name: r.name, message: r.message, ts: new Date(r.created_at).getTime() }))
  } catch {
    return loadLocal()
  }
}

/** Synchronous add (localStorage only) — kept for terminal `sign` command compat. */
export function addGuestbookEntry(name: string, message: string): GuestbookEntry[] {
  const next = [...loadLocal(), { name, message, ts: Date.now() }].slice(-MAX_ENTRIES)
  saveLocal(next)
  window.dispatchEvent(new CustomEvent('leo-guestbook-updated'))
  // Fire-and-forget Supabase insert when configured
  if (isSupabaseConfigured()) {
    insertGuestbookEntry(name, message).catch(() => { /* silent */ })
  }
  return next
}

/** Async add — writes to Supabase first (when configured), then localStorage. */
export async function addGuestbookEntryAsync(name: string, message: string): Promise<GuestbookEntry[]> {
  if (isSupabaseConfigured()) {
    await insertGuestbookEntry(name, message)
  }
  const next = [...loadLocal(), { name, message, ts: Date.now() }].slice(-MAX_ENTRIES)
  saveLocal(next)
  window.dispatchEvent(new CustomEvent('leo-guestbook-updated'))
  return next
}
