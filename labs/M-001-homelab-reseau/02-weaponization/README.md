# M-001 / 02 — Weaponization (identification vulns + payloads)

**Ticket** : Linear JES-8 — **Critere de fin** : matrice vulns completee (service → vuln → PoC → payload) + payloads generees et testees en lab + note de correlation.

## Principe

Correler **chaque** service/version identifie au recon avec ses vulnérabilités connues (CVE) ou ses configurations vulnérables. Une ligne de la matrice n'est valide que si un PoC a éte vérifié (meme passif : banner, version, comportement).

## Matrice des vulnérabilités (a completer)

| ID | Cible | Service/port | Vuln (CVE ou config) | PoC | Payload associe | Statut |
|---|---|---|---|---|---|---|
| V-001 | C1 | FTP 21 | vsftpd 2.3.4 backdoor (CVE-2011-4140 — lab) | `USER a] :)(` | — | a verifier |
| V-002 | C1 | Telnet 23 | Telnet non chiffre, comptes lab | `telnet <ip>` | — | a verifier |
| V-003 | C1 | SMB 445 | Samba "usermap_script" / trans2open (lab) | `smbclient -L //<ip>` | payload lab | a verifier |
| V-004 | C1 | SNMP 161 | SNMP public v1 (string publique) | `snmpwalk -v1 -c public <ip>` | — | a verifier |
| V-005 | C1 | MS-SQL 1433 | MSSQL 2000 sa/sa (lab) | `mssqlclient.py sa:sa@<ip>` | — | a verifier |
| V-006 | C1 | MySQL 3306 | MySQL root/root (lab) | `mysql -u root -proot -h <ip>` | — | a verifier |
| V-007 | C2 | (a decouvrir) | audit de config | — | — | a decouvrir |
| V-008 | C3 | — | **reportée → M-002** : audit Windows/AD (NLA, SMB signing, LLMNR/NBT-NS) | — | — | reportée |

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
