import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateNote, deleteNote, getNoteById } from '@/lib/notes';

/**
 * GET /api/notes/[id] - Détails d'une note
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { note, error } = await getNoteById(supabase, user.id, id);
    if (error || !note) {
      return NextResponse.json({ error: 'Note introuvable' }, { status: 404 });
    }

    return NextResponse.json({ note });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * PUT /api/notes/[id] - Mise à jour d'une note
 */
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
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

    const { note, error } = await updateNote(supabase, user.id, id, {
      titre: String(titre).trim(),
      contenu_markdown: contenu_markdown || '',
      domain_id,
      task_id,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ note });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * DELETE /api/notes/[id] - Suppression d'une note
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { success, error } = await deleteNote(supabase, user.id, id);
    if (error || !success) {
      return NextResponse.json({ error: error?.message || 'Impossible de supprimer la note' }, { status: 500 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
