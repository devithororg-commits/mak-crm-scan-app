#!/usr/bin/env python3
"""Wipe apptesting.in webroot and upload Creative Studio dist via FTP."""
from __future__ import annotations

import ftplib
import os
import sys
from pathlib import Path

HOST = os.environ.get("APPTESTING_FTP_HOST", os.environ.get("HOSTINGER_FTP_HOST", "145.79.213.39"))
USER = os.environ.get("APPTESTING_FTP_USER", os.environ.get("HOSTINGER_FTP_USER", "u169457691.apptesting.in"))
PASS = os.environ.get("APPTESTING_FTP_PASS", os.environ.get("HOSTINGER_PASS", ""))
ROOT = Path(__file__).resolve().parents[2]
DIST = ROOT / "dist"


def find_webroot(ftp: ftplib.FTP) -> str:
    for base in (
        "domains/apptesting.in/public_html",
        "public_html",
        ".",
    ):
        try:
            ftp.cwd("/")
            ftp.cwd(base)
            return base
        except ftplib.error_perm:
            continue
    raise RuntimeError("Could not find public_html on FTP server")


def ftp_list(ftp: ftplib.FTP) -> list[str]:
    try:
        return ftp.nlst()
    except ftplib.error_perm as exc:
        if "550" in str(exc):
            return []
        raise


def wipe_remote(ftp: ftplib.FTP, webroot: str) -> None:
    ftp.cwd("/")
    ftp.cwd(webroot)

    def remove_dir() -> None:
        for name in ftp_list(ftp):
            if name in (".", ".."):
                continue
            try:
                ftp.delete(name)
                print(f"  deleted file {name}")
            except ftplib.error_perm:
                ftp.cwd(name)
                remove_dir()
                ftp.cwd("..")
                ftp.rmd(name)
                print(f"  removed dir {name}")

    print(f"Clearing remote webroot: /{webroot}/")
    remove_dir()


def ensure_dirs(ftp: ftplib.FTP, rel_dir: Path) -> None:
    if not rel_dir.parts:
        return
    for part in rel_dir.parts:
        try:
            ftp.cwd(part)
        except ftplib.error_perm:
            ftp.mkd(part)
            ftp.cwd(part)


def upload_tree(ftp: ftplib.FTP, webroot: str, local_root: Path) -> int:
    count = 0
    for path in sorted(local_root.rglob("*")):
        if not path.is_file():
            continue
        rel = path.relative_to(local_root)
        ftp.cwd("/")
        ftp.cwd(webroot)
        ensure_dirs(ftp, rel.parent)
        with path.open("rb") as handle:
            ftp.storbinary(f"STOR {rel.as_posix()}", handle)
        print(f"  ↑ {rel.as_posix()}")
        count += 1
    return count


def main() -> None:
    if not PASS:
        print("APPTESTING_FTP_PASS or HOSTINGER_PASS is required", file=sys.stderr)
        sys.exit(1)
    if not DIST.joinpath("index.html").is_file():
        print(f"Missing {DIST / 'index.html'} — run npm run build first", file=sys.stderr)
        sys.exit(1)

    print(f"Connecting to {HOST} as {USER}...")
    ftp = ftplib.FTP(timeout=180)
    ftp.connect(HOST, 21)
    ftp.login(USER, PASS)
    ftp.set_pasv(True)

    webroot = find_webroot(ftp)
    wipe_remote(ftp, webroot)

    print(f"Uploading {DIST} → /{webroot}/")
    uploaded = upload_tree(ftp, webroot, DIST)

    ftp.quit()
    print(f"Done — {uploaded} files uploaded to https://apptesting.in/")


if __name__ == "__main__":
    main()
