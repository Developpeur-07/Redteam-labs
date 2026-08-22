import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAllBadgesWithUserStatus } from '@/lib/badges';

/**
 * GET /api/badges — Récupère l'ensemble des badges avec le statut de déblocage pour l'utilisateur connecté.
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { badges, unlockedCount, totalCount, error } = await getAllBadgesWithUserStatus(supabase, user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      badges,
      unlockedCount,
      totalCount,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
