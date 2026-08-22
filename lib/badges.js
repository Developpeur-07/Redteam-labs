import { getProgressionOverview } from '@/lib/progression';

/**
 * Récupère tous les badges définis en BDD et leur statut (débloqué/verrouillé) pour l'utilisateur.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} userId
 * @returns {Promise<{ badges: Array<any>, unlockedCount: number, totalCount: number, error: any }>}
 */
export async function getAllBadgesWithUserStatus(supabase, userId) {
  try {
    if (!userId || userId === 'undefined') {
      return { badges: [], unlockedCount: 0, totalCount: 0, error: null };
    }

    const [{ data: badges, error: badgesErr }, { data: userBadges, error: userBadgesErr }] =
      await Promise.all([
        supabase.from('badges').select('*, domain:domains(id, nom)').order('category'),
        supabase.from('user_badges').select('badge_id, unlocked_at').eq('user_id', userId),
      ]);

    if (badgesErr) throw badgesErr;
    if (userBadgesErr) throw userBadgesErr;

    const unlockedMap = new Map();
    (userBadges || []).forEach((ub) => {
      unlockedMap.set(ub.badge_id, ub.unlocked_at);
    });

    const enrichedBadges = (badges || []).map((badge) => {
      const unlockedAt = unlockedMap.get(badge.id);
      return {
        ...badge,
        unlocked: Boolean(unlockedAt),
        unlocked_at: unlockedAt || null,
      };
    });

    const unlockedCount = enrichedBadges.filter((b) => b.unlocked).length;

    return {
      badges: enrichedBadges,
      unlockedCount,
      totalCount: enrichedBadges.length,
      error: null,
    };
  } catch (error) {
    return {
      badges: [],
      unlockedCount: 0,
      totalCount: 0,
      error,
    };
  }
}

/**
 * Évalue et débloque automatiquement les badges auxquels l'utilisateur a droit.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} userId
 * @returns {Promise<{ newlyUnlockedBadges: Array<any>, error: any }>}
 */
export async function checkAndUnlockBadges(supabase, userId) {
  try {
    if (!userId || userId === 'undefined') {
      return { newlyUnlockedBadges: [], error: null };
    }

    // 1. Vue d'ensemble de la progression de l'utilisateur
    const overview = await getProgressionOverview(supabase, userId);
    if (overview.error) throw overview.error;

    // 2. Badges existants et badges déjà débloqués
    const { badges, error: badgesErr } = await getAllBadgesWithUserStatus(supabase, userId);
    if (badgesErr) throw badgesErr;

    const completedTasksCount = overview.completedTaskIds.size;
    const totalXp = overview.totalXp;
    const streakCount = overview.streakInfo.streak;

    // Map de progression par domaine : domain_id -> completedTasks
    const domainProgressMap = new Map();
    (overview.domainProgress || []).forEach((dp) => {
      domainProgressMap.set(dp.id, dp.completedTasks);
    });

    // 3. Identifier les badges à débloquer
    const newlyUnlockedBadges = [];
    const insertsToMake = [];

    for (const badge of badges) {
      if (badge.unlocked) continue; // Déjà débloqué

      let isEligible = false;

      if (badge.category === 'general') {
        if (completedTasksCount >= badge.threshold) isEligible = true;
      } else if (badge.category === 'streak') {
        if (streakCount >= badge.threshold) isEligible = true;
      } else if (badge.category === 'xp') {
        if (totalXp >= badge.threshold) isEligible = true;
      } else if (badge.category === 'domain' && badge.domain_id) {
        const domainTasksCompleted = domainProgressMap.get(badge.domain_id) || 0;
        if (domainTasksCompleted >= badge.threshold) isEligible = true;
      }

      if (isEligible) {
        newlyUnlockedBadges.push(badge);
        insertsToMake.push({
          user_id: userId,
          badge_id: badge.id,
          unlocked_at: new Date().toISOString(),
        });
      }
    }

    // 4. Insertion en BDD
    if (insertsToMake.length > 0) {
      const { error: insertErr } = await supabase
        .from('user_badges')
        .insert(insertsToMake);

      if (insertErr && insertErr.code !== '23505') {
        throw insertErr;
      }
    }

    return {
      newlyUnlockedBadges,
      error: null,
    };
  } catch (error) {
    return {
      newlyUnlockedBadges: [],
      error,
    };
  }
}
