/**
 * Contact Messages — Supabase backend service
 *
 * Required Supabase table (run in Supabase SQL editor):
 *
 * ```sql
 * create table contact_messages (
 *   id uuid primary key default gen_random_uuid(),
 *   name text not null,
 *   email text not null,
 *   message text not null,
 *   created_at timestamptz default now()
 * );
 *
 * -- RLS: allow anonymous inserts only
 * alter table contact_messages enable row level security;
 *
 * create policy "Anyone can submit a contact message"
 *   on contact_messages for insert
 *   to anon
 *   with check (true);
 * ```
 */

import { supabase } from '../lib/supabase'

/** Returns false when Supabase env vars are empty/missing */
export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL || ''
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  return url.length > 0 && key.length > 0
}

/**
 * Insert a contact message into Supabase.
 * Throws on failure — caller is responsible for user-facing error display.
 */
export async function submitContactMessage(
  name: string,
  email: string,
  message: string,
): Promise<void> {
  const { error } = await supabase
    .from('contact_messages')
    .insert([{ name, email, message }])

  if (error) {
    throw new Error(error.message)
  }
}
