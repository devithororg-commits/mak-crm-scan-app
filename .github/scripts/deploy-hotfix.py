#!/usr/bin/env python3
"""Upload critical hotfix files to apptesting.in without wiping webroot."""
from __future__ import annotations

import ftplib
import os
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DIST = ROOT / "dist"
HOTFIX_FILES = ("index.html", "builder.html", "nova-builder.html", ".htaccess")


def unique(items: list[str | None]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for item in items:
        if not item or item in seen:
            continue
        seen.add(item)
        out.append(item)
    return out


def env_first(*keys: str, default: str = "") -> str:
    for key in keys:
        value = (os.environ.get(key) or "").strip()
        if value:
            return value
    return default


def credential_pairs() -> list[tuple[str, str]]:
    users = [
        env_first("APPTESTING_FTP_USER", "HOSTINGER_FTP_USER"),
        "u776633649.apptesting.in",
        "u169457691.apptesting.in",
    ]
    passwords = [env_first("APPTESTING_FTP_PASS", "HOSTINGER_PASS")]
    pairs = []
    for user in users:
        if user and "apptesting.in" in user and passwords[0]:
            pairs.append((user, passwords[0]))
    return pairs


def connect(user: str, password: str) -> ftplib.FTP:
    hosts = unique([
        env_first("APPTESTING_FTP_HOST", "HOSTINGER_FTP_HOST"),
        "ftp.apptesting.in",
        "145.79.213.39",
        "147.79.69.217",
    ])
    for host in hosts:
        for attempt in range(3):
            try:
                ftp = ftplib.FTP(timeout=300)
                ftp.connect(host, 21, timeout=120)
                ftp.login(user, password)
                ftp.set_pasv(True)
                return ftp
            except Exception:
                time.sleep(3 * (attempt + 1))
    raise RuntimeError("hotfix FTP connect failed")


def main() -> int:
    pairs = credential_pairs()
    if not pairs:
        print("Missing FTP credentials", file=sys.stderr)
        return 1
    missing = [f for f in HOTFIX_FILES if not (DIST / f).is_file()]
    if missing:
        print(f"Missing dist files: {', '.join(missing)}", file=sys.stderr)
        return 1
    for user, password in pairs:
        try:
            ftp = connect(user, password)
            ftp.cwd("/")
            for base in ("public_html", "domains/apptesting.in/public_html", "."):
                try:
                    ftp.cwd("/")
                    if base != ".":
                        ftp.cwd(base)
                    break
                except ftplib.error_perm:
                    continue
            for name in HOTFIX_FILES:
                with (DIST / name).open("rb") as handle:
                    ftp.storbinary(f"STOR {name}", handle)
                print(f"  ↑ {name}")
            ftp.quit()
            print("Hotfix upload done")
            return 0
        except Exception as exc:  # noqa: BLE001
            print(f"  failed {user}: {exc}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
