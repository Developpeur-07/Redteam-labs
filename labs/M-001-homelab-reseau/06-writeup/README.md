# M-001 / 06 — Write-up (rapport professionnel + archives)

**Ticket** : Linear JES-12 — **Critere de fin** : rapport valide + archives completes sur les 4 branches (repo, Drive, Notion, Linear) + re-scan final negatif.

## Procedure

1. **Rédiger** le write-up final selon le template :
   - Google Docs : `Template — Rapport de Pentest (Chaine A-Z)` (source de verite)
   - Markdown : `../../reports/TEMPLATE-rapport-pentest.md`
2. **Sections obligatoires** : executive summary, perimetre/RoE, methode, synthese des constats (CVSS v3.1), details par constut (preuve + impact + remediation verifiee), remediations & durcissement, annexes (journaux, captures, scripts).
3. **Export** :
   - Repo : `../../writeups/M-001/writeup-M-001.md` (rapport) + `../../writeups/M-001/chaine-compromise.md` (resume de la chaine de compromission)
   - Drive : `RedTeam OPS/03_Writeups_Archive/M-001/` (rapport PDF ou Docs)
   - Drive : `RedTeam OPS/02_Rapports_Pentest/M-001/` (rapport de pentest final)
   - Notion : fiche dans DB `Write-ups` (ID M-001, severite max, statut Valide) + lien du write-up dans DB `Missions`
   - Linear : JES-12 → Complete, JES-5 (epic) → Complete
4. **Revolution** : un write-up ne contient **aucune IP externe, aucun secret, aucun identifiant personnel**.

## Check-list de cloture M-001

- [ ] Executive summary redige (apres les constats)
- [ ] 100% des constats ont CVSS v3.1 + preuve + remediation verifiee
- [ ] Chaine de compromission illustree (Recon → … → Post-Exploit)
- [ ] Lecons apprises + references documentees
- [ ] Archives Drive completes (phases 01…06)
- [ ] Fiche Notion Write-ups validee + lien dans DB Missions
- [ ] Linear epic M-001 → Complete
- [ ] Re-scan final negatif archive
