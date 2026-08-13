# CyberRoad — Architecture

## Stack
- **Frontend/Backend** : Next.js 15 (App Router), JavaScript + JSDoc (pas de TypeScript)
- **Base de données** : Supabase (Postgres + client JS + RLS)
- **Auth** : Supabase Auth
- **Styling** : Tailwind CSS
- **Icônes** : lucide-react (jamais d'emojis)
- **État client** : Zustand si besoin (progression, session locale)
- **Déploiement** : Vercel (région à définir, cdg1 par défaut comme RTE)

## Style visuel
Sombre / futuriste, cohérent avec CYBER ARENA.
- Fond sombre, accents nets
- Mise en avant via `box-shadow`, jamais via bordures colorées ou liserés
- Typographie à définir (à aligner avec CYBER ARENA si déjà choisie)

## Structure de dossiers (V1)

```
cyberroad/
├── .ai/
│   ├── vision.md
│   ├── architecture.md
│   ├── roadmap.md
│   ├── CLAUDE.md
│   └── prompts/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── roadmap/
│   │   ├── progression/
│   │   └── notes/
│   ├── api/
│   └── layout.js
├── components/
├── lib/
│   └── supabase/
├── public/
└── package.json
```

## Modèle de données (V1 — squelette, à affiner en Phase 1/2)
- `profiles` — utilisateur, objectif (Ingénieur Cybersécurité), date de début
- `domains` — domaines de compétences (données, pas codées en dur — cf. vision.md)
- `roadmap_days` — Jour X/365, tâches liées à un ou plusieurs domaines
- `user_progress` — tâches cochées, XP, streak, par domaine et global
- `notes` — write-ups liés à un domaine ou une tâche

## Contraintes techniques
- Jamais de layout re-exporté (Route Groups uniquement si layouts partagés)
- Pas de flags expérimentaux Next.js tant que le projet n'est pas stable
- RLS Supabase activé dès la Phase 1 (pas de données ouvertes, même en solo)
- Domaines de compétences en base de données, jamais en dur dans le code
