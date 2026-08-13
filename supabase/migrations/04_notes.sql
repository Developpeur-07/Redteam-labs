-- ========================================================
-- CyberRoad — Migration Phase 4 : Notes et Write-ups
-- À exécuter dans l'éditeur SQL de votre projet Supabase
-- (après 01_profiles.sql, 02_roadmap.sql et 03_progression.sql)
-- ========================================================

-- 1. Création de la table notes
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain_id UUID REFERENCES public.domains(id) ON DELETE SET NULL,
  task_id UUID REFERENCES public.roadmap_tasks(id) ON DELETE SET NULL,
  titre TEXT NOT NULL,
  contenu_markdown TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour accélérer les filtres et requêtes par utilisateur, domaine ou tâche
CREATE INDEX IF NOT EXISTS idx_notes_user ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_domain ON public.notes(domain_id);
CREATE INDEX IF NOT EXISTS idx_notes_task ON public.notes(task_id);
CREATE INDEX IF NOT EXISTS idx_notes_created ON public.notes(created_at DESC);

-- 2. Activation de la Row Level Security (RLS)
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- 3. Politiques RLS (un utilisateur ne voit, crée, modifie et supprime que ses propres notes)
CREATE POLICY "Lecture des notes personnelles"
  ON public.notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Insertion des notes personnelles"
  ON public.notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Modification des notes personnelles"
  ON public.notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Suppression des notes personnelles"
  ON public.notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
