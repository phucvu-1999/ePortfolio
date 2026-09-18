/**
 * Portfolio Live — Supabase backend for guestbook + visitor counter
 *
 * Required Supabase tables (run in Supabase SQL editor):
 *
 * ```sql
 * -- Guestbook entries
 * create table guestbook_entries (
 *   id uuid primary key default gen_random_uuid(),
 *   name text not null,
 *   message text not null,
 *   created_at timestamptz default now()
 * );
 *
 * alter table guestbook_entries enable row level security;
 *
 * create policy "Anyone can read guestbook"
 *   on guestbook_entries for select
 *   to anon
 *   using (true);
 *
 * create policy "Anyone can sign guestbook"
 *   on guestbook_entries for insert
 *   to anon
 *   with check (true);
 *
 * -- Visitor counter (single-row)
 * create table portfolio_visits (
 *   id int primary key default 1,
 *   count bigint not null default 0,
 *   constraint single_row check (id = 1)
 * );
 *
 * insert into portfolio_visits (id, count) values (1, 0);
 *
 * alter table portfolio_visits enable row level security;
 *
 * create policy "Anyone can read visit count"
 *   on portfolio_visits for select
 *   to anon
 *   using (true);
 *
 * create policy "Anyone can increment visits"
 *   on portfolio_visits for update
 *   to anon
 *   using (true);
 * ```
 */

import { supabase } from '../lib/supabase'
import { isSupabaseConfigured } from './contact'

export { isSupabaseConfigured }

// ─── Guestbook ──────────────────────────────────────────────────────────────

export interface LiveGuestbookEntry {
  name: string
  message: string
  created_at: string
}

/** Fetch guestbook entries from Supabase (newest last, limit 50). */
export async function fetchGuestbookEntries(): Promise<LiveGuestbookEntry[]> {
  const { data, error } = await supabase
    .from('guestbook_entries')
    .select('name, message, created_at')
    .order('created_at', { ascending: true })
    .limit(50)

  if (error) throw new Error(error.message)
  return (data ?? []) as LiveGuestbookEntry[]
}

/** Insert a guestbook entry into Supabase. */
export async function insertGuestbookEntry(name: string, message: string): Promise<void> {
  const { error } = await supabase
    .from('guestbook_entries')
    .insert([{ name, message }])

  if (error) throw new Error(error.message)
}

// ─── Visitor Counter ────────────────────────────────────────────────────────

const SESSION_KEY = 'portfolio-visit-counted'

/** Increment the visitor counter (session-deduped). Returns new count or null. */
export async function incrementVisits(): Promise<number | null> {
  try {
    if (sessionStorage.getItem(SESSION_KEY)) return null
  } catch { /* sessionStorage unavailable */ }

  // Read current count
  const { data, error: readErr } = await supabase
    .from('portfolio_visits')
    .select('count')
    .eq('id', 1)
    .single()

  if (readErr) return null

  const newCount = (data?.count ?? 0) + 1

  const { error: writeErr } = await supabase
    .from('portfolio_visits')
    .update({ count: newCount })
    .eq('id', 1)

  if (writeErr) return null

  try { sessionStorage.setItem(SESSION_KEY, '1') } catch { /* ignore */ }
  return newCount
}

/** Fetch current visit count without incrementing. */
export async function fetchVisitCount(): Promise<number | null> {
  const { data, error } = await supabase
    .from('portfolio_visits')
    .select('count')
    .eq('id', 1)
    .single()

  if (error) return null
  return data?.count ?? 0
}
