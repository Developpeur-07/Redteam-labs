# CyberRoad — CLAUDE.md

Ce fichier contient les règles que tout agent IA (Claude Code, Cursor, Codex, etc.)
doit respecter lorsqu'il travaille sur CyberRoad. À lire avant toute tâche.

## Avant de coder
Aucune fonctionnalité n'est développée tant qu'elle n'a pas été découpée en :
Epic → User Stories → Tâches atomiques → Critères d'acceptation.

Toujours lire `vision.md` et `architecture.md` avant d'entamer une tâche.
Ne jamais anticiper les Phases 5+ (agents IA) dans le code des Phases 0-4.

## UI — À ne jamais faire
- Jamais d'emojis dans l'interface → utiliser des icônes Lucide (`lucide-react`)
- Jamais de card avec `border-left: [couleur]` pour créer un accent visuel
- Jamais de bordure transparente/vide combinée à une marge colorée pour simuler un accent
- Pour faire ressortir un élément (carte, alerte, section active) → utiliser
  `box-shadow`, pas des bordures colorées

## Technique — À ne jamais faire
- Jamais de layout re-exporté dans l'App Router (utiliser les Route Groups
  `(groupName)` pour les layouts partagés)
- Jamais de flag expérimental Next.js activé tant que le projet n'est pas stable
- Jamais de domaine de compétence codé en dur (Linux, Python, etc.) → toujours en
  base de données, table `domains`
- Jamais de données Supabase sans RLS actif, même en usage mono-utilisateur
- Ne jamais downgrader une dépendance en dessous d'une version où un CVE a été
  patché, sans vérification explicite

## Technique — À faire
- JavaScript + JSDoc, pas de TypeScript
- Tailwind CSS pour le style
- Zustand pour l'état client si nécessaire
- Toujours privilégier la solution simple et déployable immédiatement à la
  solution techniquement sophistiquée mais complexe à mettre en œuvre

## Rythme de travail
- Une tâche à la fois, de façon collaborative et interactive
- Pas d'exécution autonome en arrière-plan sur plusieurs étapes sans validation
- Toute fonctionnalité livrée doit être testable/utilisable immédiatement,
  même partiellement

## Sécurité
- Tout CVE détecté doit être corrigé immédiatement et documenté, avec un
  avertissement explicite contre tout retour en arrière
