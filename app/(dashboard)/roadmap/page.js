import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Compass,
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import {
  ROADMAP_TOTAL_DAYS,
  calculateDayNumber,
  parseDayParam,
  getProfileForRoadmap,
  getRoadmapDayWithTasks,
  clampDayNumber,
} from '@/lib/roadmap';
import { getUserProgress } from '@/lib/progression';
import TaskToggle from '@/components/TaskToggle';
import PlannerTrigger from '@/components/PlannerTrigger';

/**
 * Page Roadmap — affiche les tâches d'un jour (Jour X/365).
 * @param {{ searchParams: Promise<{ jour?: string }> }} props
 */
export default async function RoadmapPage({ searchParams }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { profile, user, error: profileError } = await getProfileForRoadmap(supabase);

  if (profileError || !profile?.date_debut) {
    redirect('/onboarding');
  }

  const currentDay = calculateDayNumber(profile.date_debut);
  const selectedDay = parseDayParam(params.jour) ?? currentDay;
  const { day, tasks, error: roadmapError } = await getRoadmapDayWithTasks(supabase, selectedDay);
  const { completedTaskIds } = await getUserProgress(supabase, user?.id || profile?.user_id);
  const { data: domains } = await supabase.from('domains').select('id, nom').order('nom');

  const prevDay = clampDayNumber(selectedDay - 1);
  const nextDay = clampDayNumber(selectedDay + 1);
  const isToday = selectedDay === currentDay;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="bg-cyber-card rounded-2xl p-6 sm:p-8 shadow-cyber-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-cyber-surface rounded-2xl text-cyber-accent shadow-cyber-sm">
              <Compass className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Feuille de route
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Objectif : {profile.objectif}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <PlannerTrigger jourNumero={selectedDay} domains={domains || []} />
            <div className="flex items-center gap-2 px-4 py-2 bg-cyber-surface rounded-xl text-xs font-semibold shadow-cyber-sm">
              <Calendar className="w-4 h-4 text-cyber-accent" />
              <span className={isToday ? 'text-cyber-accent' : 'text-gray-300'}>
                Jour {selectedDay} / {ROADMAP_TOTAL_DAYS}
                {isToday && ' — aujourd\'hui'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation jour */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/roadmap?jour=${prevDay}`}
          aria-disabled={selectedDay <= 1}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-cyber-sm transition-all ${
            selectedDay <= 1
              ? 'pointer-events-none opacity-40 bg-cyber-surface text-gray-500'
              : 'bg-cyber-surface text-gray-300 hover:text-white hover:shadow-cyber-active'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Jour {prevDay}</span>
        </Link>

        {!isToday && (
          <Link
            href="/roadmap"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-cyber-accent/10 text-cyber-accent shadow-cyber-sm hover:bg-cyber-accent/20 transition-all"
          >
            Revenir au jour {currentDay}
          </Link>
        )}

        <Link
          href={`/roadmap?jour=${nextDay}`}
          aria-disabled={selectedDay >= ROADMAP_TOTAL_DAYS}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-cyber-sm transition-all ${
            selectedDay >= ROADMAP_TOTAL_DAYS
              ? 'pointer-events-none opacity-40 bg-cyber-surface text-gray-500'
              : 'bg-cyber-surface text-gray-300 hover:text-white hover:shadow-cyber-active'
          }`}
        >
          <span>Jour {nextDay}</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Erreur Supabase */}
      {roadmapError && (
        <div className="p-4 bg-amber-500/10 rounded-xl text-amber-400 text-xs flex items-start gap-2.5 shadow-cyber-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Impossible de charger la roadmap</span>
            <span className="text-amber-300/80">
              {roadmapError.message || 'Vérifiez que la migration 02_roadmap.sql a été exécutée dans Supabase.'}
            </span>
          </div>
        </div>
      )}

      {/* Contenu du jour */}
      <div className="bg-cyber-surface rounded-2xl p-6 sm:p-8 shadow-cyber-card">
        {day ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-cyber-card">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyber-accent" />
                <span>{day.titre}</span>
              </h2>
            </div>

            {tasks.length > 0 ? (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <TaskToggle
                    key={task.id}
                    task={task}
                    initialCompleted={completedTaskIds.has(task.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <p className="text-xs text-gray-400">
                  Aucune tâche n&apos;est définie pour ce jour pour le moment.
                </p>
                <div className="flex justify-center">
                  <PlannerTrigger jourNumero={selectedDay} domains={domains || []} />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 space-y-4">
            <div>
              <p className="text-sm font-semibold text-white mb-1">Jour {selectedDay}</p>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Ce jour n&apos;est pas encore créé dans la base de données. Utilisez l&apos;Agent IA Planner pour générer automatiquement le programme de ce jour.
              </p>
            </div>
            <div className="flex justify-center">
              <PlannerTrigger jourNumero={selectedDay} domains={domains || []} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

