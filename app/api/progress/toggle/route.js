import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { toggleTaskProgress } from '@/lib/progression';

/**
 * Endpoint API POST pour valider ou dé-valider une tâche.
 * Payload JSON : { taskId: string, completed: boolean }
 */
export async function POST(request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { taskId, completed } = body;

    if (!taskId || typeof completed !== 'boolean') {
      return NextResponse.json(
        { error: 'Paramètres invalides (taskId et completed requis)' },
        { status: 400 }
      );
    }

    const { success, error } = await toggleTaskProgress(supabase, user.id, taskId, completed);

    if (!success || error) {
      return NextResponse.json(
        { error: error?.message || 'Erreur lors de la mise à jour de la tâche' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, taskId, completed });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}
