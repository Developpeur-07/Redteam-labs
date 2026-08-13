# CyberRoad — Vision

## Le problème
En tant qu'apprenant en cybersécurité visant le métier d'ingénieur, je perds du temps
et de la clarté sur une question simple mais récurrente :

> "Qu'est-ce que je dois apprendre aujourd'hui, et où en suis-je réellement ?"

Les ressources existent (TryHackMe, HTB, PortSwigger, OverTheWire...) mais rien ne
centralise MA progression, MA roadmap, MES compétences réelles par domaine.

## Pour qui (V1)
Moi. Un seul utilisateur — je suis le client final. CyberRoad doit d'abord me servir
concrètement au quotidien avant d'envisager quiconque d'autre.

## Objectif métier visé
Ingénieur Cybersécurité (généraliste), avec logique de spécialisation progressive
(pentest, SOC/Blue Team, cloud sécurité, etc.) — pas une certification unique.

## Domaines de compétences suivis
Liste ouverte, extensible tant qu'un domaine est lié à la cybersécurité :
- Linux (administration, Bash)
- Réseaux (TCP/IP, DNS, HTTP, VPN, pare-feu)
- Python (automatisation)
- Windows & Active Directory
- Sécurité Web (OWASP Top 10)
- Tests d'intrusion (pentest)
- Cloud (AWS, Azure, GCP)
- Détection et défense (SIEM, EDR, SOC)

→ Ajouter un domaine plus tard ne doit pas nécessiter de refonte : le schéma de
données doit traiter les domaines comme des données, pas comme du code en dur.

## Format de la roadmap
Jour fixe — type "Jour X/365". Chaque jour a des tâches assignées liées à un ou
plusieurs domaines.

## Ce que CyberRoad DOIT faire (MVP)
1. Me permettre de créer un compte / me connecter, et définir mon objectif
2. M'afficher ma roadmap au format Jour X/365 avec les tâches du jour
3. Me laisser cocher les tâches accomplies
4. Calculer automatiquement ma progression (XP, niveau, streak) — globale et par domaine
5. Me laisser prendre des notes / write-ups liés à mes apprentissages

## Ce que CyberRoad NE fait PAS en V1 (hors scope explicite)
- Pas d'agents IA (Mentor, Planner, Skill Analyzer...) — ça viendra en Phase 5+
- Pas d'orchestrateur multi-agents
- Pas de multi-utilisateurs / SaaS
- Pas de gamification poussée (badges, classements) au-delà de XP/niveau/streak simples
- Pas de portfolio automatique
- Pas de paiement / monétisation

## Principe directeur
Simplicité et déployable d'abord. Chaque phase doit produire quelque chose
d'utilisable avant de passer à la suivante. On ajoute de l'intelligence (IA)
seulement une fois que la structure de base me sert vraiment au quotidien.

## Roadmap des phases (rappel — détaillé dans roadmap.md)
- Phase 0 : Fondations (ce document, structure du repo, stack)
- Phase 1 : Authentification et profil
- Phase 2 : Roadmap (Jour X/365, tâches du jour)
- Phase 3 : Progression (XP, niveau, streak — global + par domaine)
- Phase 4 : Notes et write-ups
- Phase 5+ : Premier agent IA (hors scope MVP, à ne pas anticiper dans le code)

## Vision à long terme (hors MVP, ne pas anticiper dans le code actuel)
Si CyberRoad me sert bien au quotidien, il pourrait évoluer vers :
- Un SaaS ouvert à d'autres apprenants
- Un framework d'orientation et de préparation aux certifications,
  adapté au parcours de chacun

Cette vision ne doit influencer AUCUNE décision technique de la V1.
Le MVP reste mono-utilisateur, simple, et centré sur mon usage personnel.
