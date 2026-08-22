-- ========================================================
-- CyberRoad — Migration Phase 7 : Gamification & Badges
-- À exécuter dans l'éditeur SQL de votre projet Supabase
-- (après 05_planner.sql)
-- ========================================================

-- 1. Table badges (catalogue des trophées et badges)
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  titre TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL DEFAULT 'Award',
  category TEXT NOT NULL CHECK (category IN ('domain', 'streak', 'xp', 'general')),
  threshold INT NOT NULL DEFAULT 1,
  domain_id UUID REFERENCES public.domains(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_badges_category ON public.badges(category);
CREATE INDEX IF NOT EXISTS idx_badges_domain ON public.badges(domain_id);

-- 2. Table user_badges (badges attribués aux utilisateurs)
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT user_badges_user_badge_unique UNIQUE (user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON public.user_badges(badge_id);

-- 3. RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture badges pour utilisateurs authentifiés"
  ON public.badges FOR SELECT TO authenticated USING (true);

CREATE POLICY "Lecture user_badges pour son propre compte"
  ON public.user_badges FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Insertion user_badges pour son propre compte"
  ON public.user_badges FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 4. Seeds — Badges généraux, XP et Streak
INSERT INTO public.badges (code, titre, description, icon_name, category, threshold) VALUES
  ('first_step', 'Premier Pas', 'Valider la toute première tâche de votre roadmap', 'Zap', 'general', 1),
  ('streak_3', 'Triplé', 'Maintenir une assiduité de 3 jours consécutifs', 'Flame', 'streak', 3),
  ('streak_7', 'Guerrier de la Semaine', 'Maintenir un streak actif pendant 7 jours', 'Flame', 'streak', 7),
  ('streak_30', 'Insubmersible', 'Atteindre un streak impressionnant de 30 jours', 'Shield', 'streak', 30),
  ('xp_250', 'Apprenant Assidu', 'Cumuler 250 XP au total', 'Award', 'xp', 250),
  ('xp_1000', 'Centurion Cybersécurité', 'Franchir le cap des 1000 XP', 'Award', 'xp', 1000)
ON CONFLICT (code) DO NOTHING;

-- Seeds — Badges par Domaine (liaison automatique via le nom du domaine)
INSERT INTO public.badges (code, titre, description, icon_name, category, threshold, domain_id)
SELECT 
  'domain_' || LOWER(REPLACE(REPLACE(d.nom, ' ', '_'), 'é', 'e')),
  'Initié ' || d.nom,
  'Valider au moins 3 tâches dans le domaine ' || d.nom,
  CASE 
    WHEN d.nom = 'Linux' THEN 'Terminal'
    WHEN d.nom = 'Réseaux' THEN 'Globe'
    WHEN d.nom = 'Python' THEN 'Code'
    WHEN d.nom = 'Sécurité Web' THEN 'Lock'
    WHEN d.nom = 'Cryptographie' THEN 'Key'
    WHEN d.nom = 'Forensics' THEN 'Search'
    WHEN d.nom = 'Cloud' THEN 'Cloud'
    ELSE 'Cpu'
  END,
  'domain',
  3,
  d.id
FROM public.domains d
ON CONFLICT (code) DO NOTHING;
