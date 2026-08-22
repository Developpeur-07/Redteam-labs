# CyberRoad — Roadmap

Chaque phase doit produire quelque chose d'utilisable avant de passer à la suivante.
Aucune phase ne commence sans que la précédente soit fonctionnelle.
Ne jamais anticiper le contenu d'une phase future dans le code d'une phase en cours.

---

## Phase 0 — Fondations ✅ (Clôturée)
**Objectif** : poser la vision, les règles, la structure technique.

Livrables :
- [x] `vision.md`
- [x] `architecture.md`
- [x] `CLAUDE.md`
- [x] Structure de dossiers du repo
- [x] Configuration Supabase (template .env.local + clients JS browser/server)
- [x] Projet Next.js 15 initialisé, configuré et compilé avec succès

Critères de fin de phase : `npm run dev` / build fonctionnel, page d'accueil avec statut de connexion Supabase et endpoint d'analyse de santé `/api/health`.

---

## Phase 1 — Authentification et profil ✅ (Clôturée)
**Objectif** : je peux créer un compte, me connecter, définir mon objectif.

User Stories :
1. En tant qu'utilisateur, je peux créer un compte (email + mot de passe via Supabase Auth)
2. En tant qu'utilisateur, je peux me connecter / me déconnecter
3. En tant qu'utilisateur, je peux définir mon objectif ("Ingénieur Cybersécurité")
   lors de la première connexion
4. En tant qu'utilisateur, je peux voir/modifier mon profil

Tâches atomiques :
- [x] Table `profiles` (id, user_id, objectif, date_debut, created_at)
- [x] RLS sur `profiles` (un utilisateur ne voit que sa propre ligne)
- [x] Page `/login`
- [x] Page `/register`
- [x] Formulaire de définition d'objectif (première connexion)
- [x] Page profil basique
- [x] Redirection connecté sans objectif → `/onboarding`

Critères d'acceptation :
- Un compte créé apparaît dans Supabase Auth
- Un utilisateur non connecté est redirigé vers `/login`
- Un utilisateur connecté sans objectif défini est redirigé vers le formulaire d'objectif
- Aucune donnée d'un autre utilisateur n'est accessible (vérifié via RLS)

À ne pas faire dans cette phase :
- Pas de gestion de rôles/permissions avancée
- Pas d'auth sociale (Google, GitHub...) — email/mot de passe suffit en V1

---

## Phase 2 — Roadmap (Jour X/365) ✅ (Clôturée)
**Objectif** : afficher les tâches du jour, liées à des domaines.

User Stories :
1. En tant qu'utilisateur, je vois "Jour X/365" basé sur ma date de début
2. En tant qu'utilisateur, je vois les tâches assignées au jour courant
3. En tant qu'utilisateur, je vois à quel(s) domaine(s) chaque tâche est liée
4. En tant qu'utilisateur, je peux naviguer entre les jours (précédent/suivant)

Tâches atomiques :
- [x] Table `domains` (id, nom, description)
- [x] Table `roadmap_days` (id, jour_numero, titre)
- [x] Table `roadmap_tasks` (id, roadmap_day_id, domain_id, titre, description)
- [x] Seed initial de quelques domaines (Linux, Réseaux, Python, Sécurité Web...)
- [x] Page `/roadmap` affichant le jour courant + ses tâches
- [x] Navigation jour précédent / jour suivant

Critères d'acceptation :
- Le numéro de jour est calculé depuis `date_debut` du profil, pas codé en dur
- Les domaines viennent de la table `domains`, jamais du code
- Chaque tâche affiche clairement son/ses domaine(s) associé(s)

À ne pas faire dans cette phase :
- Pas encore de calcul XP/streak (Phase 3)
- Pas de génération automatique de contenu de roadmap par IA

---

## Phase 3 — Progression (XP, niveau, streak) ✅ (Clôturée)
**Objectif** : cocher une tâche fait progresser XP, niveau et streak.

User Stories :
1. En tant qu'utilisateur, je peux cocher une tâche comme accomplie
2. En tant qu'utilisateur, je vois mon XP total et mon niveau
3. En tant qu'utilisateur, je vois mon streak (jours consécutifs avec activité)
4. En tant qu'utilisateur, je vois ma progression par domaine (ex: Python 72%)

Tâches atomiques :
- [x] Table `user_progress` (id, user_id, task_id, completed_at, xp_gagne)
- [x] Fonction de calcul XP → niveau
- [x] Fonction de calcul streak (basée sur `completed_at`)
- [x] Fonction de calcul progression par domaine (% tâches complétées / domaine)
- [x] UI : indicateur XP/niveau/streak sur le dashboard
- [x] UI : mini-graphique ou barres de progression par domaine

Critères d'acceptation :
- Cocher une tâche met à jour XP, niveau et streak immédiatement
- Décocher une tâche retire l'XP correspondant (pas de triche possible)
- Le streak se réinitialise si un jour est manqué, SAUF tolérance d'un jour de
  grâce par semaine (1 jour manqué par période de 7 jours n'interrompt pas le
  streak ; au-delà, il repart à zéro)

À ne pas faire dans cette phase :
- Pas de classement / comparaison avec d'autres utilisateurs
- Pas de badges (hors scope MVP, cf. vision.md)

---

## Phase 4 — Notes et write-ups ✅ (Clôturée)
**Objectif** : je peux documenter ce que j'apprends.

User Stories :
1. En tant qu'utilisateur, je peux créer une note liée à un domaine et/ou une tâche
2. En tant qu'utilisateur, je peux écrire en Markdown (texte, code, liens)
3. En tant qu'utilisateur, je peux retrouver mes notes par domaine

Tâches atomiques :
- [x] Table `notes` (id, user_id, domain_id, task_id nullable, titre, contenu_markdown, created_at)
- [x] Éditeur Markdown simple (pas besoin de WYSIWYG complexe)
- [x] Page `/notes` avec filtre par domaine
- [x] Rendu Markdown à l'affichage

Critères d'acceptation :
- Une note peut exister sans être liée à une tâche précise (note libre)
- Le code (blocs ```) s'affiche correctement formaté

À ne pas faire dans cette phase :
- Pas de génération automatique de portfolio (Phase 8 dans la vision long terme,
  hors MVP)
- Pas de partage public de notes

---

## Phase 5 — Premier Agent IA (Mentor Cybersécurité) ✅ (Clôturée)
**Objectif** : intégrer un Mentor IA pédagogique pour guider l'utilisateur sur sa roadmap et ses notes.

User Stories :
1. En tant qu'utilisateur, je peux échanger avec le Mentor IA depuis n'importe quelle page du dashboard
2. En tant qu'utilisateur, je peux demander l'aide ou un indice au Mentor IA directement sur une tâche spécifique
3. En tant qu'utilisateur, j'obtiens des explications pédagogiques structurées en Markdown (commandes CLI, code)

Tâches atomiques :
- [x] Route API `/api/mentor/chat` avec intégration Gemini AI
- [x] Helper serveur `lib/mentor.js` avec posture d'expert cybersécurité
- [x] Composant Volet de Chat `MentorDrawer.js` avec rendu Markdown
- [x] Bouton d'action rapide "Mentor IA" sur la roadmap et dans la barre de navigation

---

## Phase 6 — Agent IA Planner ✅ (Clôturée)
**Objectif** : Générer et adapter dynamiquement la roadmap et les tâches d'apprentissage (Jour X/365) via l'IA Gemini selon l'objectif professionnel de l'utilisateur.

User Stories :
1. En tant qu'utilisateur, je peux demander à l'IA Planner de générer des tâches sur mesure pour n'importe quelle journée de ma roadmap.
2. En tant qu'utilisateur, je peux cibler un domaine spécifique (ex: Sécurité Web, Active Directory, Cloud, Python) ou saisir un sujet d'accentuation pour ma journée.
3. En tant qu'utilisateur, les nouvelles tâches s'enregistrent en base de données Supabase et mettent à jour ma progression globale/domaine lorsqu'elles sont complétées.

Tâches atomiques :
- [x] Migration SQL `05_planner.sql` pour autoriser l'écriture sur `roadmap_days` et `roadmap_tasks`
- [x] Helper serveur `lib/planner.js` avec l'API Gemini REST
- [x] Route API `/api/planner/generate`
- [x] Composant modal interactif `components/PlannerModal.js`
- [x] Bouton d'action "Générer avec IA" sur la page `/roadmap`

---

## Phase 7 — Gamification & Badges ✅ (Clôturée)
**Objectif** : Valoriser la progression et l'assiduité en attribuant dynamiquement des badges de compétences par domaine, d'assiduité (streak) et d'XP.

User Stories :
1. En tant qu'utilisateur, je débloque des badges lorsque je complète des tâches dans un domaine ou que j'atteins des jalons d'XP/streak.
2. En tant qu'utilisateur, je peux consulter la liste de tous mes badges (débloqués et verrouillés) sur la page `/progression` et sur mon `/profile`.
3. En tant qu'utilisateur, une célébration visuelle s'affiche lorsqu'un nouveau badge est débloqué.

Tâches atomiques :
- [x] Migration SQL `06_badges.sql` (tables `badges`, `user_badges`, RLS et seeds)
- [x] Helper serveur `lib/badges.js` pour le calcul et l'attribution des badges
- [x] Routes API `/api/badges` et `/api/badges/check`
- [x] Composants UI `BadgeCard.js` et `BadgeUnlockModal.js`
- [x] Intégration dans `TaskToggle.js`, `/progression` et `/profile`

---

## Phase 8 — Agent IA Skill Analyzer ✅ (Clôturée)
**Objectif** : Analyser l'ensemble des compétences validées, des notes rédigées et de l'assiduité pour produire un bilan de compétences IA structuré avec identification des lacunes et recommandations ciblées.

User Stories :
1. En tant qu'utilisateur, je peux déclencher un bilan de compétences IA depuis la page `/progression`.
2. En tant qu'utilisateur, j'obtiens une évaluation synthétique de mon niveau de maturité, de mes forces et des lacunes prioritaires à combler.
3. En tant qu'utilisateur, je reçois des conseils et recommandations d'apprentissage personnalisés pour ajuster ma roadmap.

Tâches atomiques :
- [x] Helper serveur `lib/skillAnalyzer.js` avec l'API Gemini REST
- [x] Route API `/api/skill-analyzer`
- [x] Composant UI `components/SkillAnalyzerWidget.js`
- [x] Intégration sur la page `/progression`

---

## Phase 10 — Quiz & Micro-Défis IA Quotidiens ✅ (Clôturée)
**Objectif** : Tester l'assimilation théorique et pratique des tâches via des Quiz QCM générés par l'IA Gemini et récompenser les réussites par des bonus d'XP (+25 à +50 XP).

User Stories :
1. En tant qu'utilisateur, je peux lancer un Quiz QCM IA directement depuis n'importe quelle tâche de ma roadmap.
2. En tant qu'utilisateur, j'obtiens un retour immédiat sur mes choix avec des explications pédagogiques pour chaque question.
3. En tant qu'utilisateur, réussir un quiz crédite automatiquement un bonus d'XP et enregistre mes scores.

Tâches atomiques :
- [x] Migration SQL `07_quiz.sql` (table `quiz_results` et RLS)
- [x] Helper serveur `lib/quiz.js` avec l'API Gemini REST
- [x] Routes API `/api/quiz/generate` et `/api/quiz/submit`
- [x] Composant modal interactif `components/QuizModal.js`
- [x] Intégration sur le composant `TaskToggle.js`

---

## Phase 9 — Export Write-ups & Portfolio Apprenant ⏳ (En cours)
**Objectif** : Valoriser et partager l'ensemble des accomplissements, badges et write-ups d'apprentissage via une page dédiée `/portfolio` et permettre l'exportation des notes au format Markdown (.md) et PDF.

User Stories :
1. En tant qu'utilisateur, je peux consulter une vitrine consolidée de mon profil, de mes badges et de mes write-ups sur la page `/portfolio`.
2. En tant qu'utilisateur, je peux télécharger mes notes/write-ups sous forme de fichiers Markdown (.md) individuels ou en dossier combiné.
3. En tant qu'utilisateur, je peux imprimer ou exporter mon portfolio d'apprentissage en PDF.

Tâches atomiques :
- [x] Module serveur/client `lib/export.js` pour la génération et le téléchargement des fichiers Markdown
- [x] Page `/portfolio` (`app/(dashboard)/portfolio/page.js`)
- [x] Ajout du lien "Portfolio" dans la navigation `layout.js`
- [x] Intégration de l'exportation Markdown directe sur `components/NotesView.js`

---

## Phases Suivantes (Vision Long Terme)
SaaS multi-utilisateurs, rappels d'assiduité.
