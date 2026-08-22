import { redirect } from 'next/navigation';
import {
  Trophy,
  Flame,
  Zap,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getProfileForRoadmap } from '@/lib/roadmap';
import { getProgressionOverview } from '@/lib/progression';
import { getAllBadgesWithUserStatus } from '@/lib/badges';
import BadgeCard from '@/components/BadgeCard';

/**
 * Page Progression — Affiche l'XP, le niveau, le streak, l'avancement par domaine et les badges débloqués.
 */
export default async function ProgressionPage() {
  const supabase = await createClient();
  const { profile, user, error: profileError } = await getProfileForRoadmap(supabase);

  if (profileError || !profile?.date_debut) {
    redirect('/onboarding');
  }

  const userId = user?.id || profile?.user_id;

  const [{
    totalXp,
    levelInfo,
    streakInfo,
    domainProgress,
    completedTaskIds,
    error: progError,
  }, {
    badges,
    unlockedCount,
    totalCount,
    error: badgesError,
  }] = await Promise.all([
    getProgressionOverview(supabase, userId),
    getAllBadgesWithUserStatus(supabase, userId),
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* En-tête de la page */}
      <div className="bg-cyber-card rounded-2xl p-6 sm:p-8 shadow-cyber-card">
        <div className="flex items-start gap-4">
          <div className="p-3.5 bg-cyber-surface rounded-2xl text-cyber-accent shadow-cyber-sm">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Progression & Niveau
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Suivi en temps réel de votre XP, niveau, streak, badges et maîtrise par domaine.
            </p>
          </div>
        </div>
      </div>

      {/* Erreur Supabase éventuelle */}
      {(progError || badgesError) && (
        <div className="p-4 bg-amber-500/10 rounded-xl text-amber-400 text-xs flex items-start gap-2.5 shadow-cyber-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Erreur de chargement de la progression</span>
            <span className="text-amber-300/80">
              {(progError || badgesError)?.message || 'Assurez-vous que les migrations SQL 03_progression.sql et 06_badges.sql sont appliquées.'}
            </span>
          </div>
        </div>
      )}

      {/* Grille de cartes principales (XP / Streak / Tâches) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Carte Niveau & XP */}
        <div className="bg-cyber-card rounded-2xl p-6 shadow-cyber-card flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-cyber-accent" />
              Niveau & XP
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-cyber-accent/10 text-cyber-accent text-xs font-bold shadow-cyber-sm">
              Niveau {levelInfo.level}
            </span>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-2xl font-black text-white">{totalXp} <span className="text-xs font-normal text-gray-400">XP</span></span>
              <span className="text-xs font-medium text-gray-400">
                {levelInfo.xpInCurrentLevel} / 100 XP
              </span>
            </div>

            {/* Barre de progression vers le niveau suivant */}
            <div className="w-full h-3 bg-cyber-surface rounded-full overflow-hidden shadow-inner p-0.5">
              <div
                className="h-full bg-cyber-accent rounded-full transition-all duration-500 shadow-cyber-sm"
                style={{ width: `${levelInfo.progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-500 mt-2 text-right">
              {100 - levelInfo.xpInCurrentLevel} XP restants pour le niveau {levelInfo.level + 1}
            </p>
          </div>
        </div>

        {/* Carte Streak */}
        <div className="bg-cyber-card rounded-2xl p-6 shadow-cyber-card flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-400" />
              Série en cours
            </span>
            {streakInfo.hasGraceDayUsed ? (
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-[11px] font-semibold shadow-cyber-sm">
                Grâce utilisée
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold shadow-cyber-sm">
                Grâce disponible
              </span>
            )}
          </div>

          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-black text-white">{streakInfo.streak}</span>
              <span className="text-xs font-semibold text-gray-300">
                {streakInfo.streak > 1 ? 'jours consécutifs' : 'jour d\'activité'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              1 jour manqué par tranche de 7 jours est toléré sans interrompre votre série.
            </p>
          </div>
        </div>

        {/* Carte Tâches Complétées */}
        <div className="bg-cyber-card rounded-2xl p-6 shadow-cyber-card flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyber-accent" />
              Tâches validées
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-cyber-surface text-gray-300 text-xs font-bold shadow-cyber-sm">
              +50 XP / tâche
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-black text-white">{completedTaskIds.size}</span>
              <span className="text-xs font-semibold text-gray-300">
                {completedTaskIds.size > 1 ? 'tâches accomplies' : 'tâche accomplie'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Continuez à cocher vos tâches quotidiennes pour monter en niveau.
            </p>
          </div>
        </div>
      </div>

      {/* Section Trophées & Badges */}
      <div className="bg-cyber-surface rounded-2xl p-6 sm:p-8 shadow-cyber-card space-y-6">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-cyber-accent" />
            <span>Badges & Trophées d'Honneur</span>
          </h2>
          <span className="text-xs text-cyber-accent font-semibold px-2.5 py-1 bg-cyber-accent/10 rounded-lg">
            {unlockedCount} / {totalCount} débloqués
          </span>
        </div>

        {badges.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 text-center py-6">
            Aucun badge n&apos;a été configuré dans la base de données.
          </p>
        )}
      </div>

      {/* Section Progression par Domaine */}
      <div className="bg-cyber-surface rounded-2xl p-6 sm:p-8 shadow-cyber-card space-y-6">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyber-accent" />
            <span>Progression par Domaine de Compétence</span>
          </h2>
          <span className="text-xs text-gray-400">
            {domainProgress.length} domaines suivis
          </span>
        </div>

        {domainProgress.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {domainProgress.map((domain) => (
              <div
                key={domain.id}
                className="bg-cyber-card rounded-xl p-5 shadow-cyber-sm space-y-3 transition-all hover:shadow-cyber-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-cyber-accent flex-shrink-0" />
                      <span>{domain.nom}</span>
                    </h3>
                    {domain.description && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                        {domain.description}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-black text-cyber-accent bg-cyber-accent/10 px-2.5 py-1 rounded-lg shadow-cyber-sm">
                    {domain.percent}%
                  </span>
                </div>

                {/* Barre de progression du domaine */}
                <div className="space-y-1.5">
                  <div className="w-full h-2.5 bg-cyber-surface rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-cyber-accent rounded-full transition-all duration-500 shadow-cyber-sm"
                      style={{ width: `${domain.percent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span>{domain.completedTasks} / {domain.totalTasks} tâches complétées</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 text-center py-6">
            Aucun domaine de compétence n&apos;est disponible pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}
