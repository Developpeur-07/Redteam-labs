-- ========================================================
-- CyberRoad — Migration Phase 3 : Progression (XP, niveau, streak)
-- À exécuter dans l'éditeur SQL de votre projet Supabase
-- (après 01_profiles.sql et 02_roadmap.sql)
-- ========================================================

-- 1. Table user_progress
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.roadmap_tasks(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  xp_gagne INT NOT NULL DEFAULT 50,
  CONSTRAINT user_progress_user_task_unique UNIQUE (user_id, task_id)
);

-- Index pour accélérer les jointures par utilisateur et par tâche
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_task ON public.user_progress(task_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_completed ON public.user_progress(completed_at);

-- 2. Activation de la Row Level Security (RLS)
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- 3. Politiques RLS (un utilisateur ne peut voir, ajouter ou supprimer que sa propre progression)
CREATE POLICY "Lecture progression pour son propre compte"
  ON public.user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Insertion progression pour son propre compte"
  ON public.user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Suppression progression pour son propre compte"
  ON public.user_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
