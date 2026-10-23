# Remediation — chaines de correction et durcissement

La remediation est une **phase obligatoire** de chaque mission : une faille exploitée sans remediation verifiée = mission non terminée.

## Regle d'or

**Re-test negatif** : le meme PoC qui a permis l'exploitation doit échouer après le correctif. Sans re-test negatif, le statut est "non verifie", jamais "corrigée".

## Scripts

| Script | Cible | Rôle |
|---|---|---|
| `harden-metasploitable2.sh` | C1 Metasploitable2 | Durcissement de base de la VM lab (services vulnérables, firewall, comptes) |

## Convention

- Chaque script est **idempotent** (re-executable sans effet de bord).
- Chaque execution est journalisee dans `labs/M-XXX/05-remediation/remediation.log`.
- Un script de remediation ne doit jamais contenir de secret ni d'IP hors lab.
