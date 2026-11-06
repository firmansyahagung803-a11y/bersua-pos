import { createClient, SupabaseClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabase: SupabaseClient<any> | null = null;

// Server-side client pakai service_role key (bypass RLS)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDb(): SupabaseClient<any> {
  if (!_supabase) {
    let supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
    const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

    // Normalisasi URL (buang /rest/v1 dan trailing slash jika ada)
    supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Missing Supabase env vars.\n' +
        'Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local'
      );
    }

    _supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
  }
  return _supabase;
}

export default getDb;
