import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { submitQuizResult } from '@/lib/quiz';

/**
 * POST /api/quiz/submit — Soumet les résultats du quiz, crédite le bonus d'XP et évalue l'obtention de badges.
 */
export async function POST(request) {
  try {
    const supabase = await createClient();

    // 1. Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { taskId, score, maxScore } = body;

    const { xpBonus, newlyUnlockedBadges, error } = await submitQuizResult(supabase, user.id, {
      taskId,
      score: score || 0,
      maxScore: maxScore || 3,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      xpBonus,
      newlyUnlockedBadges,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
