import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProfileForRoadmap } from '@/lib/roadmap';
import { getProgressionOverview } from '@/lib/progression';
import { getUserNotes } from '@/lib/notes';
import { analyzeUserSkills } from '@/lib/skillAnalyzer';

/**
 * POST /api/skill-analyzer — Génère une analyse de compétences personnalisée par l'Agent IA Skill Analyzer.
 */
export async function POST() {
  try {
    const supabase = await createClient();

    // 1. Vérification auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // 2. Récupération des données utilisateur en parallèle
    const [{ profile }, overview, { notes }] = await Promise.all([
      getProfileForRoadmap(supabase),
      getProgressionOverview(supabase, user.id),
      getUserNotes(supabase, user.id),
    ]);

    // 3. Appel de l'Agent IA Skill Analyzer
    const { analysis, error: analyzerErr } = await analyzeUserSkills({
      profile: profile || {},
      overview: overview || {},
      notes: notes || [],
    });

    if (analyzerErr) {
      return NextResponse.json({ error: analyzerErr }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
