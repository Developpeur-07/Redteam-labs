#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

# ═══════════════════════════════════════════════════════════════════
# M-001 | Reconnaissance réseau & diagnostic (LAB AUTORISÉE)
# Usage : ./m-001-recon.sh
# Cibles : homelab uniquement — C1 192.168.94.129, C2 192.168.20.129
# Périmètre : RECON SEULEMENT — aucune exploitation, aucun pivot.
# Cadence : -T4 (lab). Pour cible réelle sous monitoring : -T2.
# ═══════════════════════════════════════════════════════════════════

BASE="$HOME/m-001"
RECON="$BASE/recon"
LOG="$RECON/run_$(date +%Y%m%d_%H%M%S).log"

C1="192.168.94.129"
NET_A="192.168.94.0/24"
C2="192.168.20.129"

mkdir -p "$RECON" "$BASE/remediation"
exec > >(tee -a "$LOG") 2>&1

echo "[*] M-001 Recon — $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "[*] Journal : $LOG"

# ── 1. Prérequis ──────────────────────────────────────────────────
for tool in ip nmap ping; do
    command -v "$tool" >/dev/null 2>&1 || { echo "[!] Outil manquant : $tool"; exit 1; }
done

# ── 2. Environnement local (interfaces, routes, voisins) ─────────
echo; echo "=== INTERFACES ==="; ip -br addr
echo; echo "=== ROUTES ==="; ip route
echo; echo "=== VOISINS CONNUS ==="; ip neigh || true

# ── 3. Découverte d'hôtes (segment direct uniquement) ────────────
echo; echo "=== DÉCOUVERTE : $NET_A ==="
nmap -sn "$NET_A" -oA "$RECON/hosts_A"

# ── 4. Scan TCP C1 ────────────────────────────────────────────────
# 4a. Triage top-1000 : versions + NSE.
#     -sT (connect) : handshake complet → la défense LOGUE la connexion
#     (utile pour la phase 04, analyse des logs) ; tourne sans root.
echo; echo "=== TCP top-1000 : $C1 ==="
nmap -sT -sV --top-ports 1000 --reason -T4 -oA "$RECON/c1_tcp_top" "$C1"

# 4b. Triage full-port (ports 1001-65535) : capture services cachés.
#     Rapide (1-3 min), sans versions, uniquement ports ouverts.
echo; echo "=== TCP full-port (triage hors top-1000) : $C1 ==="
nmap -sT -p- --exclude-ports 1-1000 -T4 --open \
    -oN "$RECON/c1_tcp_full_extra.txt" "$C1" || true

# 4c. UDP top-50 : SNMP (161), DNS (53), NetBIOS (137/138), CHARGEN (19)…
#     SNMP = surface d'énumération majeure de C1.
echo; echo "=== UDP top-50 : $C1 ==="
nmap -sU --top-ports 50 --reason -T4 -oA "$RECON/c1_udp" "$C1"

# 4d. Fingerprint OS (sur un échantillon de ports ouverts)
echo; echo "=== OS : $C1 ==="
nmap -O --osscan-guess -p 21,22,80,139,445 -T4 \
    -oN "$RECON/c1_os.txt" "$C1" || true

# 4e. Enum SMB passive (shares + utilisateurs, sans auth)
if command -v smbclient >/dev/null 2>&1; then
    echo; echo "=== SMB shares : $C1 ==="
    smbclient -L "//$C1" -N || true
else
    echo "[!] smbclient absent (apt install smbclient) — enum SMB différée"
fi

# ── 5. Diagnostic connectivité / routage vers C2 ──────────────────
# (Le routage inter-interfaces se VÉRIFIE sur C1 — ticket JES-14.)
echo; echo "=== ROUTE VERS C2 : $C2 ==="
ip route get "$C2" || true
echo; echo "=== TEST ICMP VERS C2 ==="
ping -c 3 -W 2 "$C2" || true
echo "[*] 'unreachable' / 100% loss = attendu : C2 joignable uniquement via le pivot C1."

echo; echo "[+] Recon terminée — résultats dans : $RECON"
