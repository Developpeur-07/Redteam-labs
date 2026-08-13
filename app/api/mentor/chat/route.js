import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateMentorResponse } from '@/lib/mentor';

/**
 * Endpoint API POST pour échanger avec le Mentor IA.
 * Payload JSON : { messages: Array<{role, content}>, contextTask?: object, contextNote?: object }
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
    const { messages, contextTask, contextNote } = body;

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Paramètre messages invalide (tableau requis)' },
        { status: 400 }
      );
    }

    const result = await generateMentorResponse(messages, contextTask, contextNote);

    return NextResponse.json({
      message: {
        role: 'assistant',
        content: result.content,
      },
      error: result.error,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Erreur serveur lors de la communication avec le Mentor' },
      { status: 500 }
    );
  }
}
