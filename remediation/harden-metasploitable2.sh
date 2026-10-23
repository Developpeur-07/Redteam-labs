#!/usr/bin/env bash
# harden-metasploitable2.sh — Durcissement de base de Metasploitable2 (lab, M-001 phase 05)
#
# Usage :
#   1. Copier ce script sur la VM C1 (Metasploitable2) de votre lab.
#   2. Executer : sudo bash harden-metasploitable2.sh
#   3. Re-scan (nmap) + re-test negatif des PoC de la matrice.
#
# Idempotent. Uniquement sur la VM lab autorisee.

set -euo pipefail

echo "[i] Durcissement Metasploitable2 (lab) — $(date -u +%Y-%m-%dT%H:%M:%SZ)"

# 1. Desactivation des services vulnérables historiques de Metasploitable
for svc in vsftpd telnetd smbd nmbd snmpd mssql-server apache2 mysql; do
  if service "$svc" status >/dev/null 2>&1; then
    echo "[i] Arret du service : $svc"
    service "$svc" stop >/dev/null 2>&1 || true
  fi
  # Empêche le redémarrage automatique
  update-rc.d "$svc" disable >/dev/null 2>&1 || systemctl disable "$svc" >/dev/null 2>&1 || true
done

# 2. Firewall : SSH uniquement (remplace le state par defaut de Metasploitable)
if command -v ufw >/dev/null 2>&1; then
  ufw --force reset >/dev/null 2>&1 || true
  ufw default deny incoming
  ufw default allow outgoing
  ufw allow 22/tcp
  ufw --force enable
  echo "[i] ufw : inbound limite au SSH (22/tcp)"
else
  echo "[!] ufw introuvable — verifier le firewall manuellement"
fi

# 3. Nettoyage des comptes lab (verifie, ne supprime que des comptes connus de Metasploitable)
for user in msfadmin ftpuser; do
  if id "$user" >/dev/null 2>&1; then
    echo "[i] Verrouillage du compte lab : $user"
    usermod -L "$user"
  fi
done

# 4. Suppression des mots de passe par defaut connus (samba, mssql si fichiers presents)
for f in /etc/samba/smbpasswd /etc/mssql.conf /etc/mysql/debian.cnf; do
  if [ -f "$f" ]; then
    echo "[i] Archiver le fichier de mots de passe par defaut : $f"
    mv "$f" "$f.disabled-$(date -u +%Y%m%d)" || true
  fi
fi

echo "[OK] Durcissement de base termine."
echo "[RAPPEL] Re-test negatif obligatoire : re-executez chaque PoC de la matrice 02-weaponization."
echo "[RAPPEL] Journalisez cette execution dans labs/M-001-homelab-reseau/05-remediation/remediation.log"
