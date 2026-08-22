import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkAndUnlockBadges } from '@/lib/badges';

/**
 * POST /api/badges/check — Évalue la progression de l'utilisateur et lui attribue les badges auxquels il est éligible.
 */
export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { newlyUnlockedBadges, error } = await checkAndUnlockBadges(supabase, user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      newlyUnlockedBadges,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
