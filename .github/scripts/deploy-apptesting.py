#!/usr/bin/env python3
"""Wipe apptesting.in webroot and upload Creative Studio dist via FTP."""
from __future__ import annotations

import ftplib
import os
import sys
from pathlib import Path

HOST = os.environ.get("APPTESTING_FTP_HOST", os.environ.get("HOSTINGER_FTP_HOST", "145.79.213.39"))
ROOT = Path(__file__).resolve().parents[2]
DIST = ROOT / "dist"

WEBROOT_CANDIDATES = (
    "domains/apptesting.in/public_html",
    "apptesting.in/public_html",
    "home/u169457691/domains/apptesting.in/public_html",
    "public_html",
    ".",
)


def debug_dirs(ftp: ftplib.FTP, user: str) -> None:
    probes = (".", "domains", "domains/apptesting.in", "public_html")
    for probe in probes:
        try:
            ftp.cwd("/")
            if probe != ".":
                ftp.cwd(probe)
            names = ftp.nlst()[:15]
            print(f"  listing /{probe}: {names}")
        except Exception as exc:  # noqa: BLE001
            print(f"  listing /{probe} failed: {exc}")


def unique(items: list[str | None]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for item in items:
        if not item or item in seen:
            continue
        seen.add(item)
        out.append(item)
    return out


def credential_pairs() -> list[tuple[str, str]]:
    users = unique([
        os.environ.get("APPTESTING_FTP_USER"),
        os.environ.get("HOSTINGER_FTP_USER"),
        "u169457691.apptesting.in",
        "u169457691.devithor.org",
    ])
    passwords = unique([
        os.environ.get("APPTESTING_FTP_PASS"),
        os.environ.get("APPTESTING_FTP_PASSWORD"),
        os.environ.get("HOSTINGER_PASS"),
        os.environ.get("HOSTINGER_PASSWORD"),
    ])
    if not passwords:
        return []
    pairs: list[tuple[str, str]] = []
    for user in users:
        for password in passwords:
            pairs.append((user, password))
    return pairs


def connect_ftp(user: str, password: str) -> ftplib.FTP:
    ftp = ftplib.FTP(timeout=180)
    ftp.connect(HOST, 21)
    ftp.login(user, password)
    ftp.set_pasv(True)
    return ftp


def find_webroot(ftp: ftplib.FTP) -> str | None:
    try:
        pwd = ftp.pwd()
        print(f"  FTP pwd after login: {pwd}")
        ftp.nlst()
        if pwd:
            return pwd.lstrip("/") or "."
    except Exception as exc:  # noqa: BLE001
        print(f"  current pwd unusable: {exc}")

    for base in WEBROOT_CANDIDATES:
        try:
            ftp.cwd("/")
            ftp.cwd(base)
            return base
        except ftplib.error_perm:
            continue
    return None


def ftp_list(ftp: ftplib.FTP) -> list[str]:
    try:
        return ftp.nlst()
    except ftplib.error_perm as exc:
        if "550" in str(exc):
            return []
        raise


def wipe_remote(ftp: ftplib.FTP) -> None:
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

    print("Clearing remote webroot...")
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


def upload_tree(ftp: ftplib.FTP, local_root: Path) -> int:
    count = 0
    for path in sorted(local_root.rglob("*")):
        if not path.is_file():
            continue
        rel = path.relative_to(local_root)
        ensure_dirs(ftp, rel.parent)
        with path.open("rb") as handle:
            ftp.storbinary(f"STOR {rel.as_posix()}", handle)
        print(f"  ↑ {rel.as_posix()}")
        count += 1
    return count


def deploy_with_credentials(user: str, password: str) -> int:
    ftp = connect_ftp(user, password)
    webroot = find_webroot(ftp)
    if not webroot:
        print(f"Could not find webroot for {user}. Directory probe:")
        debug_dirs(ftp, user)
        ftp.quit()
        raise RuntimeError(f"Connected as {user} but could not find apptesting.in webroot")

    print(f"Using FTP user {user} → /{webroot}/")
    ftp.cwd("/")
    ftp.cwd(webroot)
    wipe_remote(ftp)
    ftp.cwd("/")
    ftp.cwd(webroot)
    uploaded = upload_tree(ftp, DIST)
    ftp.quit()
    return uploaded


def main() -> None:
    pairs = credential_pairs()
    if not pairs:
        print("Missing FTP credentials.", file=sys.stderr)
        print("Add GitHub secrets: APPTESTING_FTP_PASS or HOSTINGER_PASS", file=sys.stderr)
        print("Optional: APPTESTING_FTP_USER or HOSTINGER_FTP_USER", file=sys.stderr)
        sys.exit(1)
    if not DIST.joinpath("index.html").is_file():
        print(f"Missing {DIST / 'index.html'} — run npm run build first", file=sys.stderr)
        sys.exit(1)

    errors: list[str] = []
    for user, password in pairs:
        try:
            print(f"Trying FTP login as {user} on {HOST}...")
            uploaded = deploy_with_credentials(user, password)
            print(f"Done — {uploaded} files uploaded to https://apptesting.in/")
            return
        except Exception as exc:  # noqa: BLE001 - collect all credential attempts
            errors.append(f"{user}: {exc}")
            print(f"  failed: {exc}")

    print("All FTP attempts failed:", file=sys.stderr)
    for err in errors:
        print(f"  - {err}", file=sys.stderr)
    sys.exit(1)


if __name__ == "__main__":
    main()
