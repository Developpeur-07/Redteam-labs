# Redteam-labs

Repo de **Jesusnet Ngoni** : apprentissage offensif/defensif en environnement autorise, orchestre via la **foret RedTeam OPS** (Linear, Notion, GitHub, Drive, Docs, Gmail, Calendar — l'agent IA est l'admin central).

> ⚖️ **Cadre legal** : tous les tests sont limites aux cibles explicitement autorisees — homelab personnel (VMs sous controle direct) et plateformes officielles d'apprentissage (HackTheBox, TryHackMe, PortSwigger, OverTheWire, Root-Me, PentesterLab). Toute autre cible est interdite sans autorisation ecrite. Voir le charter ROE (Google Docs) et `.ai/ops-forest.md`.

## Missions

Chaque mission porte un identifiant unique `M-XXX`, identique sur toutes les branches, et suit la **chaine obligatoire** :

`Recon → Weaponization → Exploitation → Post-Exploit → Remédiation → Write-up`

| Mission | Domaine | Statut |
|---|---|---|
| M-001 — Chaine reseau A-Z sur Homelab (Metasploitable2 + Debian) | Réseau | En cours (Linear JES-5) |
| M-002 — Chaine Windows/AD A-Z (Win Server 2019) | Windows/AD | Planifiée — reportée depuis M-001 (disque), Linear backlog |

## Structure du depot

| Dossier | Rôle |
|---|---|
| `labs/` | Dossiers de mission par phase (`M-XXX/01-recon` … `06-writeup`) : procedures, tables, logs |
| `scripts/` | Scripts d'operations (recon, scan) — **garde d'autorisation obligatoire** |
| `payloads/` | Generateur de payloads **lab uniquement** (garde d'autorisation) |
| `remediation/` | Scripts et notes de correction/durcissement (chaine defensive) |
| `reports/` | Templates de rapports professionnels (pentest, write-up) |
| `zeroday/` | Methodologie de recherche 0-day + procedure de divulgation responsable |
| `writeups/` | Write-ups finaux par mission (`M-XXX/`) |
| `.ai/` | Regles agent + architecture de la foret (`ops-forest.md`) |

## Regles rapides

1. **Aucune cible hors autorisation** (homelab + plateformes officielles uniquement).
2. **Aucune cle de licence crackee / keygen / KMS** : evaluation officielle ou licence acquise (Win Server 2019 = ISO evaluation Microsoft 120j).
3. Chaque commande d'exploitation est **journalisee** (commande, date UTC, cible, resultat).
4. Chaque faille exploitee a une **remediation verifiee par re-test negatif**.
5. Vuln reelle non documentee → **divulgation responsable** (`zeroday/README.md`), jamais d'exploitation.
6. Les scripts offensifs du depot refusent de s'executer sans la garde d'autorisation explicite.

## App

Ce depot contient aussi l'app d'apprentissage **CyberRoad** (Next.js 15 + Supabase) : roadmap de progression 365 jours, notes, quiz, badges, export de portfolio. Regles agent : voir `.ai/CLAUDE.md`.
