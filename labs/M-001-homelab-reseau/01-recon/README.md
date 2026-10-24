# M-001 / 01 — Recon (cartographie reseau)

**Ticket** : Linear JES-7 — **Critere de fin** : table de cartographie completee + 100% des services ouverts identifies + snapshots nmap archivees (Drive `M-001/01-recon/`).

## Procedure

1. **Decouverte de hosts** (segment lab uniquement)
   ```bash
   arp-scan --interface=eth1 --localnet        # si couche 2 accessible
   nmap -sn 192.168.56.0/24                     # ping sweep
   netdiscover -i eth1                          # alternative
   ```
2. **Scan ports/services/versions** par host — méthode 2 temps (triage → détail) :
   ```bash
   # Étape 1 — triage rapide : TOUS les ports ouverts, sans versions (1-3 min)
   nmap -sS -p- -T4 --open -oN c1_tcp_open.txt <ip>
   # Étape 2 — détail : versions + NSE sur les ports ouverts seulement (2-5 min)
   nmap -sV -sC -p <PORTS-OUVERTS> -T3 -oA c1_tcp_detail <ip>
   # UDP top-50 (3-10 min)
   nmap -sU --top-ports 50 -T4 -oA c1_udp <ip>
   # OS fingerprinting
   nmap -O --osscan-guess -p <PORTS-OUVERTS> -T3 -oN c1_os <ip>
   ```
   > Note : en lab, cadence `-T4` (réaliste et rapide). Le `-T2` (polite) sur `-p-` prend +7h — réservé aux cibles réelles sous monitoring qu'on doit ne pas alerter.
3. **Script maison** (garde d'autorisation, refuse toute plage non-RFC1918 ou trop large) :
   ```bash
   python3 ../../scripts/recon/scan-lab.py --authorized-targets 192.168.56.0/24 --mission M-001 --outdir ../../archives
   ```
4. **Documenter** la table ci-dessous (a completer pendant la session).
5. **Archiver** les snapshots nmap dans Drive `M-001/01-recon/` (et `archives/M-001/01-recon/` dans le repo si volumetrie raisonnable).

## Table de cartographie (a completer)

| Cible | IP | MAC | OS | Services ouverts (port/proto/version) | Comptes exposes | Partages | Notes |
|---|---|---|---|---|---|---|---|
| C1 Metasploitable2 | 192.168.94.129 | | | | | | pivot vers /20 |
| C2 Debian | 192.168.20.129 (via C1) | | | | | | recon via tunnel apres foothold C1 |
| C3 Win Server 2019 | — | — | — | — | — | — | Reportée → M-002 (disque) |

## Points a verifier specialement (lab)

- **C1** : tous les services historiques de Metasploitable (vsftpd, telnetd, Samba, SNMP, MS-SQL, MySQL, Apache, Samba)
- **C2** : services exposes, `ufw` status, comptes locaux, partages NFS/SMB
- **C3** : 3389 (RDP), 445 (SMB), 53/88 (si DC), NLA active, LLMNR/NBT-NS enables, comptes par defaut
