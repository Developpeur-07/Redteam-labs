# M-001 / 05 — Remediation (correction + re-test negatif)

**Ticket** : Linear JES-11 — **Critere de fin** : 100% des vulns exploitees corrigees + re-tests negatifs documentes + re-scan final montrant la surface reduite.

## Regle d'or

Une vulnérabilité n'est **corrigée** que si **le meme PoC qui a permis l'exploitation échoue** après le correctif (re-test negatif). Sans re-test negatif, le statut reste "non verifie".

## Plan de remediation (a completer par vuln)

| ID | Cause racine | Correctif | Re-test negatif (date UTC) | Verifie ? |
|---|---|---|---|---|
| V-001 | | | | |
| V-002 | | | | |
| V-003 | | | | |
| V-004 | | | | |
| V-005 | | | | |
| V-006 | | | | |
| V-007 | | | | |
| V-008 | | | | |

## Actions typiques (lab)

- **C1 Metasploitable2** : script de durcissement `../../remediation/harden-metasploitable2.sh` (desactivation des services vulnérables, firewall, nettoyage des comptes lab)
- **C2 Debian** : `ufw` strict, desactivation des services inutiles, rotation des comptes, audit de config
- **C3 Win Server 2019** : NLA active, SMB signing force, LLMNR/NBT-NS desactives, comptes durcis, GPO de base, audit des partages

## Journal de remediation (remediation.log)

| Date UTC | Cible | ID | Correctif applique | Re-test negatif | Resultat |
|---|---|---|---|---|---|
| | | | | | |

## Re-scan final

- [ ] Re-scan complet nmap des 3 cibles (meme methode que le recon)
- [ ] Diff avant/apres documente (surface reduite)
- [ ] Meme PoC = echec pour chaque vuln corrigee
- [ ] Snapshots finaux archives Drive `M-001/05-remediation/`
