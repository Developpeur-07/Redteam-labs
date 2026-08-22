-- ========================================================
-- CyberRoad — Migration Phase 6 : Agent IA Planner
-- À exécuter dans l'éditeur SQL de votre projet Supabase
-- (après 04_notes.sql)
-- ========================================================

-- 1. Politiques d'écriture RLS pour roadmap_days
-- Permet aux utilisateurs authentifiés d'insérer ou mettre à jour des journées de la roadmap
CREATE POLICY "Insertion roadmap_days pour utilisateurs authentifiés"
  ON public.roadmap_days FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Modification roadmap_days pour utilisateurs authentifiés"
  ON public.roadmap_days FOR UPDATE TO authenticated USING (true);

-- 2. Politiques d'écriture RLS pour roadmap_tasks
-- Permet aux utilisateurs authentifiés d'insérer, modifier ou supprimer des tâches de la roadmap
CREATE POLICY "Insertion roadmap_tasks pour utilisateurs authentifiés"
  ON public.roadmap_tasks FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Modification roadmap_tasks pour utilisateurs authentifiés"
  ON public.roadmap_tasks FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Suppression roadmap_tasks pour utilisateurs authentifiés"
  ON public.roadmap_tasks FOR DELETE TO authenticated USING (true);
