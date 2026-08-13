-- ========================================================
-- CyberRoad — Migration Phase 1 : Table profiles & Policies RLS
-- À exécuter dans l'éditeur SQL de votre projet Supabase
-- ========================================================

-- 1. Création de la table profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  objectif TEXT DEFAULT 'Ingénieur Cybersécurité',
  date_debut TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index sur user_id pour accélérer les recherches par utilisateur
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- 2. Activation de la Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Politiques RLS (Chaque utilisateur n'accède QU'À sa propre ligne)

-- Politique SELECT
CREATE POLICY "Les utilisateurs peuvent lire leur propre profil"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique INSERT
CREATE POLICY "Les utilisateurs peuvent créer leur propre profil"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique UPDATE
CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Trigger automatique pour créer un profil vide lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, objectif, date_debut)
  VALUES (NEW.id, NULL, NOW())
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Activation du trigger sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
