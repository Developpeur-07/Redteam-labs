import { createClient } from '@supabase/supabase-js';

/**
 * Client Supabase réservé aux routes serveur de confiance.
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('La configuration serveur Supabase est incomplète.');
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
