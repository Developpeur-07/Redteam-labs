import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserNotes, createNote } from '@/lib/notes';

/**
 * GET /api/notes - Liste des notes (avec filtre optionnel ?domainId=...)
 */
export async function GET(request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const domainId = searchParams.get('domainId');

    const { notes, error } = await getUserNotes(supabase, user.id, domainId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ notes });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * POST /api/notes - Création d'une nouvelle note
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
    const { titre, contenu_markdown, domain_id, task_id } = body;

    if (!titre || String(titre).trim() === '') {
      return NextResponse.json({ error: 'Le titre de la note est requis' }, { status: 400 });
    }

    const { note, error } = await createNote(supabase, user.id, {
      titre: String(titre).trim(),
      contenu_markdown: contenu_markdown || '',
      domain_id,
      task_id,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ note }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
