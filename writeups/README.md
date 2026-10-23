# Write-ups

Un dossier par mission : `M-XXX/`.

## Contenu minimal d'un write-up de mission

- `writeup-M-XXX.md` — rapport complet (suivre `../reports/TEMPLATE-rapport-pentest.md`)
- `chaine-compromise.md` — resume de la chaine de compromission (Recon → Post-Exploit, en quelques screens/commandes)

## Conventions

1. **Confidentialite** : aucune IP externe, aucun secret, aucun identifiant personnel. Les IPs de lab (192.168.x.x) sont autorisees.
2. **Reproductibilite** : chaque commande doit etre reproductible depuis le write-up (outil, version, args, contexte).
3. **CVSS v3.1** obligatoire par constut, avec vecteur complet.
4. **Remediation verifiee** : chaque constut reference son re-test negatif (date UTC).
5. **Miroirs** : le write-up final est aussi archive dans Drive `RedTeam OPS/03_Writeups_Archive/M-XXX/` et fiche dans Notion DB `Write-ups`.
