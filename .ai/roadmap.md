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

## Phases Suivantes (Vision Long Terme)
Orchestrateur multi-agents (Planner, Skill Analyzer), SaaS multi-utilisateurs, badges avancés.
