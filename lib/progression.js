/**
 * Helpers pour la gestion de la progression (XP, niveaux, streak, domaines) dans CyberRoad.
 */

export const XP_PER_TASK = 50;
export const XP_PER_LEVEL = 100;

/**
 * Calcule le niveau et la progression relative d'un utilisateur selon son XP.
 * @param {number} xp
 * @returns {{ level: number, currentLevelXp: number, nextLevelXp: number, xpInCurrentLevel: number, progressPercent: number }}
 */
export function calculateLevel(xp = 0) {
  const totalXp = Math.max(0, xp);
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const currentLevelXp = (level - 1) * XP_PER_LEVEL;
  const nextLevelXp = level * XP_PER_LEVEL;
  const xpInCurrentLevel = totalXp - currentLevelXp;
  const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / XP_PER_LEVEL) * 100));

  return {
    level,
    currentLevelXp,
    nextLevelXp,
    xpInCurrentLevel,
    progressPercent,
  };
}

/**
 * Formatage d'une date JS en string YYYY-MM-DD (locale).
 * @param {Date} date
 * @returns {string}
 */
export function formatDateKey(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Calcule le streak (jours d'activité consécutifs) avec tolérance de 1 jour de grâce par tranche de 7 jours.
 * @param {string[]} completedDates - Liste des dates sous forme YYYY-MM-DD
 * @param {Date} [refDate] - Date de référence (par défaut aujourd'hui)
 * @returns {{ streak: number, hasGraceDayUsed: boolean }}
 */
export function calculateStreak(completedDates, refDate = new Date()) {
  if (!completedDates || completedDates.length === 0) {
    return { streak: 0, hasGraceDayUsed: false };
  }

  const activeSet = new Set(completedDates);
  let current = new Date(refDate);
  let todayStr = formatDateKey(current);

  // Si aujourd'hui n'a pas encore d'activité, on vérifie si la série était active hier
  if (!activeSet.has(todayStr)) {
    const yesterday = new Date(current);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDateKey(yesterday);

    if (!activeSet.has(yesterdayStr)) {
      return { streak: 0, hasGraceDayUsed: false };
    }
    current = yesterday;
  }

  let streak = 0;
  let graceDaysUsed = 0;
  let daysInWindow = 0;

  // Remonter dans le temps jour par jour
  while (true) {
    const dateStr = formatDateKey(current);
    if (activeSet.has(dateStr)) {
      streak += 1;
    } else {
      if (graceDaysUsed < 1 && daysInWindow < 7) {
        graceDaysUsed += 1;
      } else {
        break;
      }
    }

    daysInWindow += 1;
    if (daysInWindow % 7 === 0) {
      graceDaysUsed = 0;
    }

    current.setDate(current.getDate() - 1);
  }

  return { streak, hasGraceDayUsed: graceDaysUsed > 0 };
}

/**
 * Calcule le pourcentage de progression par domaine de compétence.
 * @param {Array<{ id: string, nom: string, description?: string }>} domains
 * @param {Array<{ id: string, domain_id: string }>} tasks
 * @param {Set<string>|Array<string>} completedTaskIds
 * @returns {Array<{ id: string, nom: string, description?: string, totalTasks: number, completedTasks: number, percent: number }>}
 */
export function calculateDomainProgress(domains = [], tasks = [], completedTaskIds = new Set()) {
  const completedSet = completedTaskIds instanceof Set ? completedTaskIds : new Set(completedTaskIds);

  return domains.map((domain) => {
    const domainTasks = tasks.filter((t) => t.domain_id === domain.id);
    const totalTasks = domainTasks.length;
    const completedTasks = domainTasks.filter((t) => completedSet.has(t.id)).length;
    const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      id: domain.id,
      nom: domain.nom,
      description: domain.description,
      totalTasks,
      completedTasks,
      percent,
    };
  });
}

/**
 * Récupère l'ensemble des id de tâches complétées par un utilisateur.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} userId
 * @returns {Promise<{ completedTaskIds: Set<string>, userProgress: Array<any>, error: any }>}
 */
export async function getUserProgress(supabase, userId) {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('task_id, completed_at, xp_gagne')
      .eq('user_id', userId);

    if (error) throw error;

    const completedTaskIds = new Set((data || []).map((row) => row.task_id));
    return { completedTaskIds, userProgress: data || [], error: null };
  } catch (error) {
    return { completedTaskIds: new Set(), userProgress: [], error };
  }
}

/**
 * Bascule l'état d'accomplissement d'une tâche pour un utilisateur.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} userId
 * @param {string} taskId
 * @param {boolean} completed
 * @returns {Promise<{ success: boolean, error: any }>}
 */
export async function toggleTaskProgress(supabase, userId, taskId, completed) {
  try {
    if (completed) {
      const { error } = await supabase.from('user_progress').insert({
        user_id: userId,
        task_id: taskId,
        completed_at: new Date().toISOString(),
        xp_gagne: XP_PER_TASK,
      });
      if (error && error.code !== '23505') {
        // 23505 = duplicate key (déjà complétée)
        throw error;
      }
    } else {
      const { error } = await supabase
        .from('user_progress')
        .delete()
        .eq('user_id', userId)
        .eq('task_id', taskId);
      if (error) throw error;
    }
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Récupère l'ensemble de la vue d'ensemble de la progression d'un utilisateur.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} userId
 * @returns {Promise<{
 *   totalXp: number,
 *   levelInfo: ReturnType<typeof calculateLevel>,
 *   streakInfo: ReturnType<typeof calculateStreak>,
 *   domainProgress: ReturnType<typeof calculateDomainProgress>,
 *   completedTaskIds: Set<string>,
 *   error: any
 * }>}
 */
export async function getProgressionOverview(supabase, userId) {
  try {
    // 1. Récupération des données utilisateur dans user_progress
    const { data: progressRows, error: progressErr } = await supabase
      .from('user_progress')
      .select('task_id, completed_at, xp_gagne')
      .eq('user_id', userId);

    if (progressErr) throw progressErr;

    const userProgress = progressRows || [];
    const completedTaskIds = new Set(userProgress.map((row) => row.task_id));

    // Calculate total XP
    const totalXp = userProgress.reduce((sum, row) => sum + (row.xp_gagne || XP_PER_TASK), 0);
    const levelInfo = calculateLevel(totalXp);

    // Calculate streak
    const completedDates = userProgress.map((row) => formatDateKey(row.completed_at));
    const streakInfo = calculateStreak(completedDates);

    // 2. Récupération des domaines et tâches pour le calcul par domaine
    const [{ data: domains, error: domErr }, { data: tasks, error: taskErr }] = await Promise.all([
      supabase.from('domains').select('id, nom, description').order('nom'),
      supabase.from('roadmap_tasks').select('id, domain_id'),
    ]);

    if (domErr) throw domErr;
    if (taskErr) throw taskErr;

    const domainProgress = calculateDomainProgress(domains || [], tasks || [], completedTaskIds);

    return {
      totalXp,
      levelInfo,
      streakInfo,
      domainProgress,
      completedTaskIds,
      error: null,
    };
  } catch (error) {
    return {
      totalXp: 0,
      levelInfo: calculateLevel(0),
      streakInfo: { streak: 0, hasGraceDayUsed: false },
      domainProgress: [],
      completedTaskIds: new Set(),
      error,
    };
  }
}
