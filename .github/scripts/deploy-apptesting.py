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
    "public_html",
    "domains/apptesting.in/public_html",
    "apptesting.in/public_html",
    ".",
)


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
        "u776633649.apptesting.in",
        "u169457691.apptesting.in",
    ])
    users = [u for u in users if "apptesting.in" in u]
    passwords = unique([
        os.environ.get("APPTESTING_FTP_PASS"),
        os.environ.get("APPTESTING_FTP_PASSWORD"),
        os.environ.get("HOSTINGER_PASS"),
        os.environ.get("HOSTINGER_PASSWORD"),
    ])
    if not users or not passwords:
        return []
    return [(user, password) for user in users for password in passwords]


def connect_ftp(user: str, password: str) -> ftplib.FTP:
    if "apptesting.in" not in user:
        raise RuntimeError(f"Refusing non-apptesting FTP user: {user}")
    ftp = ftplib.FTP(timeout=180)
    ftp.connect(HOST, 21)
    ftp.login(user, password)
    ftp.set_pasv(True)
    return ftp


def goto_webroot(ftp: ftplib.FTP, webroot: str) -> None:
    ftp.cwd("/")
    if webroot not in (".", ""):
        ftp.cwd(webroot)


def find_webroot(ftp: ftplib.FTP) -> str:
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
            goto_webroot(ftp, base)
            return base
        except ftplib.error_perm:
            continue
    raise RuntimeError("Could not find apptesting.in webroot")


def ftp_list(ftp: ftplib.FTP) -> list[str]:
    try:
        return [name for name in ftp.nlst() if name not in (".", "..")]
    except ftplib.error_perm as exc:
        if "550" in str(exc):
            return []
        raise


def wipe_remote(ftp: ftplib.FTP) -> None:
    def remove_dir() -> None:
        for name in ftp_list(ftp):
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
        goto_webroot(ftp, webroot)
        ensure_dirs(ftp, rel.parent)
        with path.open("rb") as handle:
            ftp.storbinary(f"STOR {rel.name}", handle)
        print(f"  ↑ {rel.as_posix()}")
        count += 1
    return count


def deploy_with_credentials(user: str, password: str) -> int:
    ftp = connect_ftp(user, password)
    webroot = find_webroot(ftp)
    print(f"Using FTP user {user} → /{webroot}/")
    goto_webroot(ftp, webroot)
    wipe_remote(ftp)
    uploaded = upload_tree(ftp, webroot, DIST)
    ftp.quit()
    return uploaded


def main() -> None:
    pairs = credential_pairs()
    if not pairs:
        print("Missing FTP credentials.", file=sys.stderr)
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
        except Exception as exc:  # noqa: BLE001
            errors.append(f"{user}: {exc}")
            print(f"  failed: {exc}")

    print("All FTP attempts failed:", file=sys.stderr)
    for err in errors:
        print(f"  - {err}", file=sys.stderr)
    sys.exit(1)


if __name__ == "__main__":
    main()
