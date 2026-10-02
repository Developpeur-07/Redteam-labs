import { NextResponse } from 'next/server';

/**
 * Refuse les fonctionnalités protégées quand l'accès payant n'est pas actif.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} userId
 * @returns {Promise<NextResponse | null>}
 */
export async function requireActiveEntitlement(supabase, userId) {
  const { data, error } = await supabase
    .from('user_entitlements')
    .select('status')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: 'Impossible de vérifier votre accès pour le moment.' }, { status: 503 });
  }

  if (data?.status !== 'active') {
    return NextResponse.json({ error: 'Un accès CyberRoad actif est nécessaire.' }, { status: 403 });
  }

  return null;
}