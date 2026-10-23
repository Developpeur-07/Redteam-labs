# M-001 — Chaine reseau A-Z sur Homelab

**Domaine** : Réseau — **Pilotage** : Linear JES-5 (epic) + JES-6…JES-12 (sous-tickets en chaine de blocage)
**Fiche Notion** : DB Missions — `M-001` — **Archive Drive** : `RedTeam OPS/01_Missions_Labs/M-001-Chaine-Reseau-Homelab/`

## Cibles autorisees (homelab, controle direct uniquement)

| Code | Machine | Rôle | Notes |
|---|---|---|---|
| C1 | Metasploitable2 | Cible vulnérable intentionnelle | ISO officiel, vulns connues (FTP, Telnet, Samba, SNMP, MSSQL, MySQL, HTTP) |
| C2 | Debian | Cible secondaire | Durcissement a la fin de la mission |
| C3 | Windows Server 2019 | Cible AD/Windows | ISO **evaluation officielle Microsoft (180j, renouvelable une fois : `slmgr /rearm` → 360j)** — AUCUNE licence requise : ecran Product Key → `I don't have a product key` → edition `Standard (Desktop Experience) (Evaluation)`. Download officiel : microsoft.com/evalcenter/evaluate-windows-server-2019. AUCUNE cle crackee, AUCUN keygen/KMS. Activation eval : internet requis les 10 premiers jours. |
| A | Kali/Parrot (attaquant) | Poste d'attaque | Meme segment que les cibles |

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
