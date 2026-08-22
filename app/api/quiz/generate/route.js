import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateQuizForTask } from '@/lib/quiz';

/**
 * POST /api/quiz/generate — Génère un quiz QCM de 3 questions pour une tâche donnée.
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
    const { task, domainNom } = body;

    if (!task || !task.titre) {
      return NextResponse.json({ error: 'La tâche est requise pour générer le quiz.' }, { status: 400 });
    }

    const { quizTitle, questions, error } = await generateQuizForTask({
      task,
      domainNom: domainNom || task.domain?.nom || 'Cybersécurité',
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      quizTitle,
      questions,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
