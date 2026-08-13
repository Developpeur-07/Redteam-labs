import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';

/**
 * Inscription par Email + Mot de passe.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ data: any, error: any }>}
 */
export async function signUpUser(email, password) {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

/**
 * Connexion par Email + Mot de passe.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ data: any, error: any }>}
 */
export async function signInUser(email, password) {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

/**
 * Déconnexion de l'utilisateur courant.
 * @returns {Promise<{ error: any }>}
 */
export async function signOutUser() {
  const supabase = createBrowserSupabaseClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Récupère le profil de l'utilisateur connecté.
 * @returns {Promise<{ profile: any, error: any }>}
 */
export async function getUserProfile() {
  const supabase = createBrowserSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { profile: null, error: 'Non authentifié' };
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  return { profile, user, error };
}

/**
 * Met à jour ou crée le profil de l'utilisateur.
 * @param {Object} params
 * @param {string} params.objectif
 * @param {string} [params.date_debut]
 * @returns {Promise<{ data: any, error: any }>}
 */
export async function updateUserProfile({ objectif, date_debut }) {
  const supabase = createBrowserSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: 'Non authentifié' };
  }

  const payload = {
    user_id: user.id,
    objectif,
    updated_at: new Date().toISOString(),
  };

  if (date_debut) {
    payload.date_debut = date_debut;
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();

  return { data, error };
}
