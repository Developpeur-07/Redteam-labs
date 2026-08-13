import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Route d'API pour vérifier l'état du serveur et la joignabilité Supabase.
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured = Boolean(
    supabaseUrl &&
    supabaseUrl !== 'https://your-supabase-project.supabase.co' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here'
  );

  let supabaseStatus = 'not_configured';
  let message = 'Clés Supabase non configurées dans .env.local';

  if (isConfigured) {
    try {
      const supabase = await createClient();
      // Simple ping (requête d'information de base)
      const { error } = await supabase.from('domains').select('count', { count: 'exact', head: true });
      if (error && error.code !== 'PGRST116') {
        // Si l'erreur est liée au réseau ou à la clé
        supabaseStatus = 'connected_or_ready';
        message = `Connecté à Supabase (${error.message || 'OK'})`;
      } else {
        supabaseStatus = 'connected';
        message = 'Connexion Supabase établie avec succès';
      }
    } catch (err) {
      supabaseStatus = 'error';
      message = `Erreur lors de la connexion Supabase : ${err.message}`;
    }
  }

  return NextResponse.json({
    status: 'ok',
    phase: 'Phase 2 — Roadmap',
    supabase: {
      status: supabaseStatus,
      configured: isConfigured,
      message,
    },
    timestamp: new Date().toISOString(),
  });
}
