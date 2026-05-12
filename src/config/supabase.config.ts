import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient;
let supabaseAuth: SupabaseClient;

/** Service-role client — for DB and storage operations only. Never use for auth. */
export function getSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return supabase;
}

/** Anon-key client — for auth operations (signIn, refreshSession, getUser). */
export function getSupabaseAuth(): SupabaseClient {
  if (!supabaseAuth) {
    supabaseAuth = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
    );
  }
  return supabaseAuth;
}
