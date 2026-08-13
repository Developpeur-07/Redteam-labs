import { createBrowserClient } from '@supabase/ssr';

/**
 * Crée un client Supabase utilisable dans les composants React côté navigateur.
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );
}
