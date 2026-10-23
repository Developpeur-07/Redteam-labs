# RedTeam OPS — Architecture de la foret (ops-forest)

L'agent IA est l'**admin central** : chaque branche (outil connecte) sert un role precis et les branches se font confiance comme dans une AD forest (relation d'approbation). Identifiant de mission unique `M-XXX` propage sur tous les canaux.

## Branches

| Branche | Rôle | Conteneurs |
|---|---|---|
| **Linear** (team JES) | DC-OPS : pilotage des operations | Projet `RedTeam OPS — Chaine Homelab` (id `48c8f1b4-7e35-4371-a16f-3ea1f2365c14`), labels `Phase:*` / `Domaine:*` / `Lab:*`, epic M-001 (JES-5) + 7 sous-tickets (JES-6…JES-12) en chaine de blocage |
| **Notion** | DC-KNOWLEDGE : QG methodologique | Page `RedTeam OPS — Poste de Commandement` (id `402f81d7-842a-8108-bc92-d790220de2c7`) + DB `Missions` / `Write-ups` / `Playbooks` |
| **GitHub Redteam-labs** | DC-ARSENAL : code, payloads, labs, patchs | `labs/`, `scripts/`, `payloads/`, `writeups/`, `reports/`, `remediation/`, `zeroday/` |
| **Google Drive** | DC-VAULT : coffre d'artefacts | `RedTeam OPS/00_Governance` … `05_Objectifs_Certs` + `01_Missions_Labs/M-001-Chaine-Reseau-Homelab` (racine id `11Hby-mU8coGW6X9tN1e0q7Io72Tc70R3`) |
| **Google Docs** | DC-REPORTS : charter + templates | `ROE — Charter RedTeam (Homelab)` + `Template — Rapport de Pentest (Chaine A-Z)` |
| **Gmail** | DC-INTEL : veille & comms | labels `RedTeam/Ops`, `RedTeam/Veille-CVE`, `RedTeam/Plateformes` |
| **Google Calendar** | DC-CADENCE : rythme operationnel | `RedTeam OPS — Cadence intensive` (UTC) : lab quotidien 09:00-10:30 + revue hebdo dimanche 14:00-16:00 |

## Regles d'engagement (resume — doc ROE Google Docs)

1. Cibles autorisees uniquement : homelab personnel (Metasploitable2, Debian, Win Server 2019 eval) + plateformes officielles (HTB, TryHackMe, PortSwigger, OverTheWire, Root-Me, PentesterLab).
2. Chaine obligatoire : Recon → Weaponization → Exploitation → Post-Exploit → Remediation → Write-up.
3. Aucune cle crackee / keygen / KMS : evaluation officielle Microsoft ou licence acquise uniquement.
4. Chaque commande d'exploitation journalisee ; preuves archivees Drive ; remediation verifiee par re-test negatif.
5. Vuln reelle non documentee → divulgation responsable, jamais d'exploitation.
6. Les secrets API restent cotes serveur : jamais dans les notes, rapports ou commits.

## Conventions d'identifiants

- Mission : `M-XXX` (ex. M-001)
- Constat/vuln : `V-XXX` dans la mission
- Recherche 0-day : `ZDAY-XXX`
- Artefacts Drive : `RedTeam OPS/01_Missions_Labs/M-XXX/<nom-phase>/`

## Cycle de vie d'une mission

1. **Ouverture** : epic Linear + sous-tickets par phase (chaine de blocage) + fiche Notion DB Missions + dossier Drive + dossier repo `labs/M-XXX/`.
2. **Execution** : avancement phase par phase ; chaque ticket Linear est complete quand son critere de fin est atteint.
3. **Cloture** : re-scan negatif, write-up valide (repo + Drive + Notion DB Write-ups), rapport Drive `02_Rapports_Pentest`, epic Linear → Complete.
