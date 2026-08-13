-- ========================================================
-- CyberRoad — Migration Phase 2 : Roadmap (Jour X/365)
-- À exécuter dans l'éditeur SQL de votre projet Supabase
-- (après 01_profiles.sql)
-- ========================================================

-- 1. Table domains (contenu partagé, jamais codé en dur dans l'app)
CREATE TABLE IF NOT EXISTS public.domains (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table roadmap_days
CREATE TABLE IF NOT EXISTS public.roadmap_days (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  jour_numero INT NOT NULL UNIQUE CHECK (jour_numero >= 1 AND jour_numero <= 365),
  titre TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roadmap_days_jour ON public.roadmap_days(jour_numero);

-- 3. Table roadmap_tasks
CREATE TABLE IF NOT EXISTS public.roadmap_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  roadmap_day_id UUID NOT NULL REFERENCES public.roadmap_days(id) ON DELETE CASCADE,
  domain_id UUID NOT NULL REFERENCES public.domains(id) ON DELETE RESTRICT,
  titre TEXT NOT NULL,
  description TEXT,
  ordre INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roadmap_tasks_day ON public.roadmap_tasks(roadmap_day_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_tasks_domain ON public.roadmap_tasks(domain_id);

-- 4. RLS — lecture seule pour les utilisateurs authentifiés
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture domains pour utilisateurs authentifiés"
  ON public.domains FOR SELECT TO authenticated USING (true);

CREATE POLICY "Lecture roadmap_days pour utilisateurs authentifiés"
  ON public.roadmap_days FOR SELECT TO authenticated USING (true);

CREATE POLICY "Lecture roadmap_tasks pour utilisateurs authentifiés"
  ON public.roadmap_tasks FOR SELECT TO authenticated USING (true);

-- 5. Seed — domaines
INSERT INTO public.domains (nom, description) VALUES
  ('Linux', 'Administration système, shell, permissions et outils CLI'),
  ('Réseaux', 'Modèle OSI/TCP-IP, protocoles, diagnostic réseau'),
  ('Python', 'Scripting, automatisation et outils offensifs/défensifs'),
  ('Sécurité Web', 'OWASP, vulnérabilités web, tests d''intrusion applicatifs'),
  ('Cryptographie', 'Chiffrement, hachage, PKI et bonnes pratiques'),
  ('Forensics', 'Analyse post-incident, collecte et préservation de preuves'),
  ('Cloud', 'Sécurité cloud, IAM et bonnes pratiques multi-fournisseurs'),
  ('OSINT', 'Veille, collecte d''informations publiques et investigation')
ON CONFLICT (nom) DO NOTHING;

-- 6. Seed — 7 premiers jours (démonstration Phase 2)
INSERT INTO public.roadmap_days (jour_numero, titre) VALUES
  (1, 'Fondations : environnement et posture'),
  (2, 'Linux : navigation et permissions'),
  (3, 'Réseaux : adressage et diagnostic'),
  (4, 'Python : bases pour la cybersécurité'),
  (5, 'Sécurité Web : surface d''attaque'),
  (6, 'Cryptographie : concepts essentiels'),
  (7, 'Synthèse : première revue hebdomadaire')
ON CONFLICT (jour_numero) DO NOTHING;

-- Jour 1
INSERT INTO public.roadmap_tasks (roadmap_day_id, domain_id, titre, description, ordre)
SELECT rd.id, d.id, t.titre, t.description, t.ordre
FROM public.roadmap_days rd
CROSS JOIN (VALUES
  ('Linux', 'Configurer son environnement de travail (VM ou WSL)', 'Installer une distro Linux, mettre à jour le système et créer un utilisateur dédié à la pratique.', 1),
  ('Réseaux', 'Cartographier son réseau local', 'Identifier IP, passerelle, DNS et tester la connectivité avec ping et traceroute.', 2)
) AS t(domain_nom, titre, description, ordre)
JOIN public.domains d ON d.nom = t.domain_nom
WHERE rd.jour_numero = 1;

-- Jour 2
INSERT INTO public.roadmap_tasks (roadmap_day_id, domain_id, titre, description, ordre)
SELECT rd.id, d.id, t.titre, t.description, t.ordre
FROM public.roadmap_days rd
CROSS JOIN (VALUES
  ('Linux', 'Maîtriser ls, cd, pwd et l''arborescence', 'Explorer /etc, /var/log et comprendre la hiérarchie FHS.', 1),
  ('Linux', 'Permissions rwx et chmod/chown', 'Modifier les droits sur fichiers et dossiers, comprendre umask.', 2)
) AS t(domain_nom, titre, description, ordre)
JOIN public.domains d ON d.nom = t.domain_nom
WHERE rd.jour_numero = 2;

-- Jour 3
INSERT INTO public.roadmap_tasks (roadmap_day_id, domain_id, titre, description, ordre)
SELECT rd.id, d.id, t.titre, t.description, t.ordre
FROM public.roadmap_days rd
CROSS JOIN (VALUES
  ('Réseaux', 'Modèle TCP/IP et ports courants', 'Relier protocoles (HTTP, HTTPS, SSH, DNS) à leurs ports.', 1),
  ('Réseaux', 'Utiliser ipconfig/ifconfig, netstat et ss', 'Lister interfaces, connexions actives et services en écoute.', 2)
) AS t(domain_nom, titre, description, ordre)
JOIN public.domains d ON d.nom = t.domain_nom
WHERE rd.jour_numero = 3;

-- Jour 4
INSERT INTO public.roadmap_tasks (roadmap_day_id, domain_id, titre, description, ordre)
SELECT rd.id, d.id, t.titre, t.description, t.ordre
FROM public.roadmap_days rd
CROSS JOIN (VALUES
  ('Python', 'Variables, conditions et boucles', 'Écrire un script qui parse un fichier log simple.', 1),
  ('Python', 'Manipuler fichiers et chaînes', 'Lire un fichier, extraire des IPs ou des codes HTTP.', 2)
) AS t(domain_nom, titre, description, ordre)
JOIN public.domains d ON d.nom = t.domain_nom
WHERE rd.jour_numero = 4;

-- Jour 5
INSERT INTO public.roadmap_tasks (roadmap_day_id, domain_id, titre, description, ordre)
SELECT rd.id, d.id, t.titre, t.description, t.ordre
FROM public.roadmap_days rd
CROSS JOIN (VALUES
  ('Sécurité Web', 'Découvrir OWASP Top 10', 'Lire la liste et noter 3 risques applicatifs prioritaires.', 1),
  ('Sécurité Web', 'Inspecter une requête HTTP dans le navigateur', 'Analyser headers, cookies et méthode dans les DevTools.', 2)
) AS t(domain_nom, titre, description, ordre)
JOIN public.domains d ON d.nom = t.domain_nom
WHERE rd.jour_numero = 5;

-- Jour 6
INSERT INTO public.roadmap_tasks (roadmap_day_id, domain_id, titre, description, ordre)
SELECT rd.id, d.id, t.titre, t.description, t.ordre
FROM public.roadmap_days rd
CROSS JOIN (VALUES
  ('Cryptographie', 'Hachage vs chiffrement', 'Comparer SHA-256 et AES avec un exemple concret.', 1),
  ('Cryptographie', 'Certificats TLS en pratique', 'Examiner un certificat HTTPS (émetteur, validité, SAN).', 2)
) AS t(domain_nom, titre, description, ordre)
JOIN public.domains d ON d.nom = t.domain_nom
WHERE rd.jour_numero = 6;

-- Jour 7
INSERT INTO public.roadmap_tasks (roadmap_day_id, domain_id, titre, description, ordre)
SELECT rd.id, d.id, t.titre, t.description, t.ordre
FROM public.roadmap_days rd
CROSS JOIN (VALUES
  ('Forensics', 'Journaliser ses exercices', 'Créer un write-up court sur une manip de la semaine.', 1),
  ('OSINT', 'Première recherche structurée', 'Collecter des infos publiques sur une cible fictive (domaine test).', 2),
  ('Cloud', 'Lire les fondamentaux du modèle de responsabilité partagée', 'Comparer ce qui relève du client vs du fournisseur cloud.', 3)
) AS t(domain_nom, titre, description, ordre)
JOIN public.domains d ON d.nom = t.domain_nom
WHERE rd.jour_numero = 7;
