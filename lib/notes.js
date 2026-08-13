/**
 * Helpers pour la gestion des notes et write-ups (Phase 4).
 */

/**
 * Récupère l'ensemble des notes d'un utilisateur, avec possibilité de filtrer par domaine.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} userId
 * @param {string} [domainId]
 * @returns {Promise<{ notes: Array<any>, error: any }>}
 */
export async function getUserNotes(supabase, userId, domainId = null) {
  try {
    let query = supabase
      .from('notes')
      .select(`
        id,
        user_id,
        domain_id,
        task_id,
        titre,
        contenu_markdown,
        created_at,
        updated_at,
        domain:domains(id, nom),
        task:roadmap_tasks(id, titre)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (domainId && domainId !== 'all') {
      query = query.eq('domain_id', domainId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return { notes: data || [], error: null };
  } catch (error) {
    return { notes: [], error };
  }
}

/**
 * Récupère une note spécifique par son ID pour un utilisateur.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} userId
 * @param {string} noteId
 * @returns {Promise<{ note: any, error: any }>}
 */
export async function getNoteById(supabase, userId, noteId) {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select(`
        id,
        user_id,
        domain_id,
        task_id,
        titre,
        contenu_markdown,
        created_at,
        updated_at,
        domain:domains(id, nom),
        task:roadmap_tasks(id, titre)
      `)
      .eq('user_id', userId)
      .eq('id', noteId)
      .single();

    if (error) throw error;
    return { note: data, error: null };
  } catch (error) {
    return { note: null, error };
  }
}

/**
 * Crée une nouvelle note pour l'utilisateur.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} userId
 * @param {{ titre: string, contenu_markdown: string, domain_id?: string|null, task_id?: string|null }} payload
 * @returns {Promise<{ note: any, error: any }>}
 */
export async function createNote(supabase, userId, payload) {
  try {
    const { titre, contenu_markdown, domain_id, task_id } = payload;

    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: userId,
        titre,
        contenu_markdown,
        domain_id: domain_id || null,
        task_id: task_id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return { note: data, error: null };
  } catch (error) {
    return { note: null, error };
  }
}

/**
 * Met à jour une note existante.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} userId
 * @param {string} noteId
 * @param {{ titre: string, contenu_markdown: string, domain_id?: string|null, task_id?: string|null }} payload
 * @returns {Promise<{ note: any, error: any }>}
 */
export async function updateNote(supabase, userId, noteId, payload) {
  try {
    const { titre, contenu_markdown, domain_id, task_id } = payload;

    const { data, error } = await supabase
      .from('notes')
      .update({
        titre,
        contenu_markdown,
        domain_id: domain_id || null,
        task_id: task_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('id', noteId)
      .select()
      .single();

    if (error) throw error;
    return { note: data, error: null };
  } catch (error) {
    return { note: null, error };
  }
}

/**
 * Supprime une note.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} userId
 * @param {string} noteId
 * @returns {Promise<{ success: boolean, error: any }>}
 */
export async function deleteNote(supabase, userId, noteId) {
  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('user_id', userId)
      .eq('id', noteId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
}
