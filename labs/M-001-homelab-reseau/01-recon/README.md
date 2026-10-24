# M-001 / 01 — Recon (cartographie reseau)

**Ticket** : Linear JES-7 — **Critere de fin** : table de cartographie completee + 100% des services ouverts identifies + snapshots nmap archivees (Drive `M-001/01-recon/`).

## Procedure

1. **Decouverte de hosts** (segment lab uniquement)
   ```bash
   arp-scan --interface=eth0 --localnet        # si couche 2 accessible
   nmap -sn 192.168.94.0/24                     # ping sweep
   netdiscover -i eth0                          # alternative
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
3. **Runner lab** (recommande : prerequis, journal horodate, diagnostic routage C2) :
   ```bash
   bash ../../scripts/recon/m-001-recon.sh
   ```
4. **Script generique** (autre mission/segment, garde d'autorisation) :
   ```bash
   python3 ../../scripts/recon/scan-lab.py --authorized-targets 192.168.94.0/24 --mission M-001 --outdir ../../archives
   ```
   (Le segment 192.168.20.0/24 n'est **pas** scannable depuis A — uniquement via pivot apres foothold C1, ticket JES-14.)
5. **Documenter** la table ci-dessous (a completer pendant la session).
6. **Archiver** les snapshots nmap dans Drive `M-001/01-recon/` (et `archives/M-001/01-recon/` dans le repo si volumetrie raisonnable).

## Table de cartographie (a completer)

| Cible | IP | MAC | OS | Services ouverts (port/proto/version) | Comptes exposes | Partages | Notes |
|---|---|---|---|---|---|---|---|
| C1 Metasploitable2 | 192.168.94.129 (gw .2) | _(à compléter : `arp -an`)_ | Unix/Linux, Ubuntu 8.04 (Metasploitable2) | **30 ports TCP** : 21 vsftpd 2.3.4 (anon), 22 OpenSSH 4.7p1, 23 telnetd, 25 Postfix (SSLv2!), 53 BIND 9.4.2, 80 Apache 2.2.8 DAV, 111 rpcbind, 139/445 Samba 3.0.20 (signing OFF), 512-514 rsh/rlogin, 1099 java-rmi, **1524 bindshell ROOT**, 2049 NFS, 2121 ProFTPD 1.3.1, 3306 MySQL 5.0.51a, 3632 distccd 4.2.4, 5432 PostgreSQL 8.3, 5900 VNC 3.3, 6000 X11, 6667/6697 UnrealIRCd 3.2.8, 8009 Jserv AJP, 8180 Tomcat 5.5, 8787 Ruby DRb, + 4 ports dynamiques RPC (mountd/nlockmgr/java-rmi/status) · **UDP** : 53, 111, 137, 2049 ouverts ; 161 (SNMP) `open|filtered` → confirmer par snmpwalk | à compléter (smbclient, ftp) | à compléter | pivot vers /20 ; A n'a AUCUNE route directe vers /20 (ping → Host Unreachable via gw) ; scans : recon/c1_tcp_open.txt + c1_tcp_detail.nmap + c1_udp.nmap |
| C2 Debian | 192.168.20.129 (via C1) | | | | | | recon via tunnel apres foothold C1 |
| C3 Win Server 2019 | — | — | — | — | — | — | Reportée → M-002 (disque) |

## Points a verifier specialement (lab)

- **C1** : tous les services historiques de Metasploitable (vsftpd, telnetd, Samba, SNMP, MS-SQL, MySQL, Apache, Samba)
- **C2** : services exposes, `ufw` status, comptes locaux, partages NFS/SMB
- **C3** : 3389 (RDP), 445 (SMB), 53/88 (si DC), NLA active, LLMNR/NBT-NS enables, comptes par defaut
