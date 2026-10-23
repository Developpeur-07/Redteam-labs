# Payloads — laboratoire uniquement

Ce dossier ne contient que des **generateurs** de payloads pour la lab (homelab sous controle direct). Le depot ne contient aucun payload binaire, aucun dropper, aucun code de bypass, aucun exfiltrator.

## Regles

1. Generation seulement pour des cibles de la lab (IPs RFC1918 du segment).
2. Chaque payload genere est documente dans la matrice de la phase `02-weaponization` (usage, cible, resultat).
3. AUCUN payload n'est deploye sur une plateforme externe (HTB/THM/PortSwigger…) : les plateformes ont leurs propres cadres et outils.
4. Les dossiers `generated/` sont gitignore (artefacts locaux de session).

## Generateur

```bash
python3 generate-payloads.py --lab-ip 192.168.56.10 --lab-port 4444 --out generated/M-001/
```

Le script refuse de s'executer si `--lab-ip` n'est pas une adresse privee (RFC1918). Il genere :

- `shell_bash_nc.sh` — reverse shell bash/netcat (lab)
- `shell_bash_nc_listen.sh` — commandes de cote attaquant (listener)
- `README-session.md` — contexte de la session de generation
