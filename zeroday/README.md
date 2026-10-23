# ZDAY — Recherche 0-day & divulgation responsable

Ce dossier documente la **methodologie de recherche de vulnerabilites non documentees** (0-day) dans le cadre autorise, et la procedure a suivre quand une vulnérabilité réelle est rencontrée.

## Identifiant

Chaque recherche porte un id `ZDAY-XXX` (ex. ZDAY-001), fichee dans Notion (DB Playbooks, catégorie `0-day`) avec : objet, date, statut.

## Regles

1. **Dans la lab** : une vuln "inattendue" sur nos VMs est un exercice normal — la documenter dans la matrice de la mission, l'exploiter selon les RoE, la remedier.
2. **Sur une plateforme externe** (HTB, THM, PortSwigger, OTW, Root-Me, PentesterLab) : si une vulnérabilité semble **hors du cadre** de la plateforme (cible non visee, service externe, impact réel potentiel) :
   1. **STOP immediat** — ne pas exploiter davantage, ne pas collecter de données.
   2. Documenter : date UTC, URL/service, preuve minimale (sans exploitation), contexte.
   3. Utiliser le canal officiel de la plateforme (bug bounty / support / responsible disclosure).
   4. **Ne jamais** vendre, revendre, publier ou partager un exploit non public.
3. **Hors perimetre autorise** : aucune action. Fermer la session, documenter l'incident dans le journal de la mission.

## Procedure de divulgation responsable (resume)

| Etape | Action | Livrable |
|---|---|---|
| 1 | Stop + freeze de la session | note d'incident (ZDAY-XXX) |
| 2 | Documentation minimale, reproductible, sans exfiltration | fiche ZDAY (Notion + repo) |
| 3 | Contact du proprietaire via canal officiel | email/canal documente (Gmail label `RedTeam/Veille-CVE`) |
| 4 | Délai de coordination (typique 90 jours) puis communication | suivi dans Linear (ticket dédié) |
| 5 | Cloture : CVE attribuée (si applicable) + retour d'experience | write-up public uniquement apres divulgation |

## Veille (lien Gmail label `RedTeam/Veille-CVE`)

- Sources : CVE/NVD, CERT-FR, security advisories des vendors des composants de la lab, Nuclei templates (lab uniquement).
- Revue hebdo : dimanche 14:00-16:00 UTC (Calendrier `RedTeam OPS — Cadence intensive`).
- Chaque CVE concernee par la lab → verification d'impact + remediation si besoin (chaine classique, pas de 0-day).
