#!/usr/bin/env python3
"""Upload critical hotfix files to apptesting.in without wiping webroot."""
from __future__ import annotations

import ftplib
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DIST = ROOT / "dist"
HOTFIX_FILES = (
    "index.html",
    "builder.html",
    "nova-builder.html",
    "aurora-ppt.html",
    ".htaccess",
)
HOTFIX_DIRS = ("aurora-ppt",)


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


def upload_tree(ftp: ftplib.FTP, local_root: Path, remote_prefix: str) -> int:
    count = 0
    for path in sorted(local_root.rglob("*")):
        if not path.is_file():
            continue
        rel = path.relative_to(local_root)
        goto_webroot(ftp)
        ensure_dirs(ftp, Path(remote_prefix) / rel.parent)
        with path.open("rb") as handle:
            ftp.storbinary(f"STOR {rel.name}", handle)
        print(f"  ↑ {remote_prefix}/{rel.as_posix()}")
        count += 1
    return count


def main() -> int:
    pairs = credential_pairs()
    if not pairs:
        print("Missing FTP credentials", file=sys.stderr)
        return 1
    missing = [f for f in HOTFIX_FILES if not (DIST / f).is_file()]
    if missing:
        print(f"Missing dist files: {', '.join(missing)}", file=sys.stderr)
        return 1
    for dirname in HOTFIX_DIRS:
        if not (DIST / dirname).is_dir():
            print(f"Missing dist dir: {dirname}", file=sys.stderr)
            return 1
    for user, password in pairs:
        try:
            ftp = connect(user, password)
            goto_webroot(ftp)
            for name in HOTFIX_FILES:
                with (DIST / name).open("rb") as handle:
                    ftp.storbinary(f"STOR {name}", handle)
                print(f"  ↑ {name}")
            for dirname in HOTFIX_DIRS:
                upload_tree(ftp, DIST / dirname, dirname)
            ftp.quit()
            print("Hotfix upload done")
            return 0
        except Exception as exc:  # noqa: BLE001
            print(f"  failed {user}: {exc}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
