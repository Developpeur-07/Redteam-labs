/** Nombre total de jours du cursus. */
export const ROADMAP_TOTAL_DAYS = 365;

/**
 * Borne un numéro de jour entre 1 et 365.
 * @param {number} day
 * @returns {number}
 */
export function clampDayNumber(day) {
  return Math.min(Math.max(Math.trunc(day), 1), ROADMAP_TOTAL_DAYS);
}

/**
 * Calcule le numéro de jour depuis la date de début du profil.
 * Jour 1 = date_debut (calendaire, minuit local ignoré via UTC date parts).
 * @param {string | Date} dateDebut
 * @param {Date} [referenceDate]
 * @returns {number}
 */
export function calculateDayNumber(dateDebut, referenceDate = new Date()) {
  const start = new Date(dateDebut);
  const ref = new Date(referenceDate);

  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const refUtc = Date.UTC(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const diffDays = Math.floor((refUtc - startUtc) / (1000 * 60 * 60 * 24));

  return clampDayNumber(diffDays + 1);
}

/**
 * Parse le paramètre ?jour= depuis l'URL.
 * @param {string | string[] | undefined} raw
 * @returns {number | null}
 */
export function parseDayParam(raw) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return null;

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return null;

  return clampDayNumber(parsed);
}

/**
 * Récupère le profil de l'utilisateur connecté (serveur).
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @returns {Promise<{ profile: any, user: any, error: any }>}
 */
export async function getProfileForRoadmap(supabase) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { profile: null, user: null, error: authError || 'Non authentifié' };
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('user_id, objectif, date_debut')
    .eq('user_id', user.id)
    .maybeSingle();

  const enrichedProfile = profile
    ? { ...profile, user_id: profile.user_id || user.id }
    : { user_id: user.id };

  return { profile: enrichedProfile, user, error };
}

/**
 * Charge un jour de roadmap et ses tâches (avec domaine joint).
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {number} jourNumero
 * @returns {Promise<{ day: any, tasks: any[], error: any }>}
 */
export async function getRoadmapDayWithTasks(supabase, jourNumero) {
  const { data: day, error: dayError } = await supabase
    .from('roadmap_days')
    .select('id, jour_numero, titre')
    .eq('jour_numero', jourNumero)
    .maybeSingle();

  if (dayError) {
    return { day: null, tasks: [], error: dayError };
  }

  if (!day) {
    return { day: null, tasks: [], error: null };
  }

  const { data: tasks, error: tasksError } = await supabase
    .from('roadmap_tasks')
    .select(`
      id,
      titre,
      description,
      ordre,
      domain:domains (
        id,
        nom,
        description
      )
    `)
    .eq('roadmap_day_id', day.id)
    .order('ordre', { ascending: true });

  return { day, tasks: tasks || [], error: tasksError };
}
