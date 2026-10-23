#!/usr/bin/env python3
"""scan-lab.py — Cartographie reseau de la lab (M-001, phase 01-recon).

Usage (exemple) :
    python3 scan-lab.py --authorized-targets 192.168.56.0/24 --mission M-001 --outdir ./archives

GARDE D'AUTORISATION
    Ce script REFUSE de s'executer sans --authorized-targets.
    La plage fournie doit etre une plage PRIVEE (RFC1918) de votre homelab.
    Ce script ne doit jamais etre pointe sur un reseau que vous ne controlez pas.
"""
import argparse
import datetime
import ipaddress
import pathlib
import re
import shutil
import subprocess
import sys


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Cartographie reseau de la lab (homelab uniquement).",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "--authorized-targets",
        required=True,
        help="Plage CIDR autorisee (votre lab), ex. 192.168.56.0/24",
    )
    parser.add_argument("--mission", required=True, help="Identifiant de mission, ex. M-001")
    parser.add_argument("--outdir", default="archives", help="Dossier de sortie des snapshots")
    args = parser.parse_args()

    # --- Garde d'autorisation ---------------------------------------------
    try:
        net = ipaddress.ip_network(args.authorized_targets, strict=False)
    except ValueError as exc:
        sys.exit(f"[GARDE] CIDR invalide : {exc}")

    private_nets = (
        ipaddress.ip_network("10.0.0.0/8"),
        ipaddress.ip_network("172.16.0.0/12"),
        ipaddress.ip_network("192.168.0.0/16"),
    )
    if not any(net.overlaps(private) for private in private_nets):
        sys.exit("[GARDE] Refus : la plage n'est pas une plage privee (RFC1918). Ce script ne scanne que la lab.")
    if net.prefixlen < 24:
        sys.exit("[GARDE] Refus : plage trop large (minimum /24). Limitez au segment de la lab.")

    if shutil.which("nmap") is None:
        sys.exit("[ERREUR] nmap introuvable dans le PATH (installez nmap).")

    # --- Execution ----------------------------------------------------------
    outdir = pathlib.Path(args.outdir) / args.mission / "01-recon"
    outdir.mkdir(parents=True, exist_ok=True)
    ts = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%dT%H%M%SZ")

    print(f"[i] Mission {args.mission} — plage autorisee : {net} — sortie : {outdir}")

    # 1. Decouverte de hosts
    hosts_file = outdir / f"hosts_{ts}.txt"
    subprocess.run(["nmap", "-sn", str(net), "-oN", str(hosts_file)], check=False)

    # 2. Scan complet par host decouvert
    hosts = re.findall(r"([0-9]{1,3}(?:\.[0-9]{1,3}){3})", hosts_file.read_text(errors="ignore"))
    scanned = 0
    for ip in sorted(set(hosts)):
        if ipaddress.ip_address(ip) not in net:
            continue
        xml = outdir / f"fullscan_{ip}_{ts}.xml"
        txt = outdir / f"fullscan_{ip}_{ts}.txt"
        print(f"[i] Scan complet de {ip}")
        subprocess.run(
            ["nmap", "-sV", "-sC", "-p-", "-oX", str(xml), "-oN", str(txt), ip],
            check=False,
        )
        scanned += 1

    print(f"[OK] Recon {args.mission} : {scanned} host(s) scanne(s). Snapshots dans {outdir}")
    print("[RAPPEL] Documenter la table de cartographie dans labs/M-001-homelab-reseau/01-recon/README.md")
    print("[RAPPEL] Archiver les snapshots dans Drive : RedTeam OPS/01_Missions_Labs/M-001/01-recon/")


if __name__ == "__main__":
    main()
