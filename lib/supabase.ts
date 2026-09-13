import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';

let supabase: SupabaseClient<Database> | null = null;
let supabaseAdmin: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> | null {
  if (supabase) return supabase;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!url || !publishableKey) return null;

  supabase = createClient(url, publishableKey, {
    auth: { persistSession: false },
    global: { headers: { 'x-from-server': 'true' } },
  });

  return supabase;
}

export function getSupabaseAdminClient(): SupabaseClient<Database> | null {
  if (supabaseAdmin) return supabaseAdmin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) return null;

  supabaseAdmin = createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false },
    global: { headers: { 'x-from-server': 'true' } },
  });

  return supabaseAdmin;
}

export default getSupabaseClient;
