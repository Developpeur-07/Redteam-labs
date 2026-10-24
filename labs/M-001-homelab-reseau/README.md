# M-001 — Chaine reseau A-Z sur Homelab

**Domaine** : Réseau — **Pilotage** : Linear JES-5 (epic) + JES-6…JES-12 (sous-tickets en chaine de blocage)
**Fiche Notion** : DB Missions — `M-001` — **Archive Drive** : `RedTeam OPS/01_Missions_Labs/M-001-Chaine-Reseau-Homelab/`

## Cibles autorisees (homelab, controle direct uniquement)

| Code | Machine | Rôle | Adresse |
|---|---|---|---|
| A | Kali/Linux (attaquant) | Poste d'attaque | eth0 `192.168.94.135/24` |
| C1 | Metasploitable2 | Cible vulnérable **+ PIVOT** | eth0 `192.168.94.129/24` · eth1 `192.168.20.128/24` |
| C2 | Debian | Cible finale (prise de main totale) | `192.168.20.129/24` — **uniquement via C1** |
| C3 | Windows Server 2019 | Cible AD/Windows | **REPORTÉE → M-002** (disque) |

## Topologie réelle

```
192.168.94.0/24                         192.168.20.0/24
┌──────────────────┐                    ┌──────────────────────┐
│ A  .94.135       │                    │ C2  .20.129 (Debian) │
│ (attaquant)      │                    └─────────────────────┘
────────┬─────────                               │
         └──────────────┬──────────────────────────┘
                   C1 Metasploitable (PIVOT)
              eth0 .94.129 · eth1 .20.128
```

- **C1 est le pivot** : seul chemin A → C2.
- **Objectif mission** : exploiter toutes les vulns des services de C1 (FTP, Telnet, Samba, SNMP, MSSQL, MySQL, HTTP…), puis pivoter vers C2 pour la prise de main totale.
- **OPSEC** : une seule source (A), cadence de scan réelle (-T2), journalisation de chaque commande (RoE). La phase 04 analysera ce que la défense (logs C1/C2) a vu.
- **2026-10-24 — Correction d'isolement (topologie)** : A pouvait router vers /20 via la passerelle .94.2 (l'hôte VMware route entre les segments) → le pivot ne serait pas "nécessaire" sans mesure. **Décision finale : reconfiguration du lab** — C1 et C2 sur un LAN dédié (sans passage par l'hôte), A ne voit que C1. Isolation structurelle L3, C2 sans firewall (propre pour la phase Remediation). Voir 03-exploitation (section Pivot).

> **Périmètre de la session actuelle** : C1 + C2 + A. La chaine A-Z s'exécute intégralement sur C1/C2. C3 est reportée vers la mission **M-002** (chaine Windows/AD), à ouvrir dès que 10 GB de disque sont disponibles sur l'hôte.

## Phases

| # | Phase | Dossier | Ticket Linear | Critere de fin |
|---|---|---|---|---|
| 0 | Setup lab | (ce README) | JES-6 | 3 VMs up + ping attaquant→cibles + inventaire reseau documente |
| 1 | Recon | `01-recon/` | JES-7 | Table de cartographie completee + snapshots nmap archivees |
| 2 | Weaponization | `02-weaponization/` | JES-8 | Matrice vulns completee + payloads generees et testees en lab |
| 3 | Exploitation | `03-exploitation/` | JES-9 | Chaque vuln exploitee (preuve) ou marquee NON-EXPLOITABLE (justification) |
| 4 | Post-Exploit | `04-post-exploit/` | JES-10 | Carte de compromission + analyse logs defense + cleanup verifie |
| 5 | Remediation | `05-remediation/` | JES-11 | 100% des vulns corrigees + re-tests negatifs + re-scan final |
| 6 | Write-up | `06-writeup/` | JES-12 | Rapport valide + archives completes (repo, Drive, Notion, Linear) |

## Regles d'engagement (rappelees)

- Tests uniquement sur C1/C2/C3 (segment de la lab). Aucun test hors perimetre, meme "inoffensif".
- Chaque commande d'exploitation journalisee : `| date UTC | cible | commande | resultat |`.
- Aucun DoS, aucune destruction non documentee, aucune exfiltration hors lab.
- Cleanup systematique apres exploitation (aucune trace persistante non documentee).
- La phase Remediation est **obligatoire** : une faille exploitee sans remediation verifiee = mission non terminee.

## Journaux de mission

- `03-exploitation/exploitation.log` — journal des exploitations
- `04-post-exploit/postexploit.log` — journal post-exploit
- `05-remediation/remediation.log` — journal des corrections + re-tests
