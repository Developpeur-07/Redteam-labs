import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Crée un client Supabase utilisable dans les composants/routes serveur (Next.js App Router).
 * @returns {Promise<import('@supabase/supabase-js').SupabaseClient>}
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Appelé depuis un Server Component : peut être ignoré si géré par middleware
          }
        },
      },
    }
  );
}
