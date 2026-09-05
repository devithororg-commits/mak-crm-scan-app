#!/usr/bin/env python3
"""Upload critical hotfix files to apptesting.in without wiping webroot."""
from __future__ import annotations

import ftplib
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DIST = ROOT / "dist"

# Flat files only — fast FTP upload (no recursive directory walk)
HOTFIX_FILES = (
    "index.html",
    "start.html",
    "hub.html",
    "sw.js",
    "builder.html",
    "nova-builder.html",
    "aurora-ppt.html",
    ".htaccess",
    "aurora-ppt/index.html",
    "assets/aurora-home.css",
    "assets/aurora-home.js",
    "assets/aurora-toolhub.css",
    "assets/aurora-toolhub.js",
    "assets/aurora-ppt-spa.js",
    "assets/aurora-ppt-spa.css",
    "assets/editorial-botanical-Bu_MnSHi.jpg",
)


def env_first(*keys: str, default: str = "") -> str:
    import os

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
    hosts = [
        env_first("APPTESTING_FTP_HOST", "HOSTINGER_FTP_HOST"),
        "ftp.apptesting.in",
        "145.79.213.39",
        "147.79.69.217",
    ]
    seen: set[str] = set()
    for host in hosts:
        if not host or host in seen:
            continue
        seen.add(host)
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


def goto_webroot(ftp: ftplib.FTP) -> None:
    ftp.cwd("/")
    for base in ("public_html", "domains/apptesting.in/public_html", "."):
        try:
            ftp.cwd("/")
            if base != ".":
                ftp.cwd(base)
            return
        except ftplib.error_perm:
            continue
    raise RuntimeError("webroot not found")


def ensure_dirs(ftp: ftplib.FTP, rel_dir: Path) -> None:
    for part in rel_dir.parts:
        try:
            ftp.cwd(part)
        except ftplib.error_perm:
            ftp.mkd(part)
            ftp.cwd(part)


def upload_file(ftp: ftplib.FTP, rel_path: str, local_path: Path) -> None:
    rel = Path(rel_path)
    goto_webroot(ftp)
    if rel.parent.parts:
        ensure_dirs(ftp, rel.parent)
    with local_path.open("rb") as handle:
        ftp.storbinary(f"STOR {rel.name}", handle)
    print(f"  ↑ {rel_path}")


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
            for name in HOTFIX_FILES:
                upload_file(ftp, name, DIST / name)
            ftp.quit()
            print("Hotfix upload done")
            return 0
        except Exception as exc:  # noqa: BLE001
            print(f"  failed {user}: {exc}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
