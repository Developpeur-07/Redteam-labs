-- ========================================================
-- CyberRoad — Migration Phase 10 : Quiz & Micro-Défis IA Quotidiens
-- À exécuter dans l'éditeur SQL de votre projet Supabase
-- (après 06_badges.sql)
-- ========================================================

-- 1. Table quiz_results (historique des résultats de quiz et bonus d'XP)
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.roadmap_tasks(id) ON DELETE SET NULL,
  score INT NOT NULL DEFAULT 0,
  max_score INT NOT NULL DEFAULT 3,
  xp_bonus INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_results_user ON public.quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_task ON public.quiz_results(task_id);

-- 2. RLS
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture quiz_results pour son propre compte"
  ON public.quiz_results FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Insertion quiz_results pour son propre compte"
  ON public.quiz_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
