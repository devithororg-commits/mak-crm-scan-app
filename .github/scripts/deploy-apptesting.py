#!/usr/bin/env python3
"""Wipe apptesting.in webroot and upload Poster Studio Pro dist via FTP."""
from __future__ import annotations

import ftplib
import os
import sys
from pathlib import Path

def env_first(*keys: str, default: str = "") -> str:
    for key in keys:
        value = (os.environ.get(key) or "").strip()
        if value:
            return value
    return default


HOST = env_first("APPTESTING_FTP_HOST", "HOSTINGER_FTP_HOST", default="145.79.213.39")
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
        env_first("APPTESTING_FTP_USER", "HOSTINGER_FTP_USER"),
        "u776633649.apptesting.in",
        "u169457691.apptesting.in",
    ])
    users = [u for u in users if "apptesting.in" in u]
    passwords = unique([
        env_first("APPTESTING_FTP_PASS", "APPTESTING_FTP_PASSWORD", "HOSTINGER_PASS", "HOSTINGER_PASSWORD"),
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


PRESERVE_FILES = {"api/config.local.php"}
PRESERVE_DIR_PREFIXES = ("api/data",)


def remote_rel_path(base: str, name: str) -> str:
    return f"{base}/{name}".strip("/") if base else name


def should_preserve(rel_path: str) -> bool:
    if rel_path in PRESERVE_FILES:
        return True
    return any(rel_path == prefix or rel_path.startswith(prefix + "/") for prefix in PRESERVE_DIR_PREFIXES)


def backup_remote_file(ftp: ftplib.FTP, webroot: str, rel_path: str) -> bytes | None:
    try:
        goto_webroot(ftp, webroot)
        for part in Path(rel_path).parent.parts:
            ftp.cwd(part)
        buffer = bytearray()
        ftp.retrbinary(f"RETR {Path(rel_path).name}", buffer.extend)
        print(f"  backed up {rel_path}")
        return bytes(buffer)
    except Exception:
        return None


def wipe_remote(ftp: ftplib.FTP, rel_path: str = "") -> None:
    def remove_dir() -> None:
        for name in ftp_list(ftp):
            child = remote_rel_path(rel_path, name)
            if should_preserve(child):
                print(f"  kept {child}")
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
    for part in rel_dir.parts:
        try:
            ftp.cwd(part)
        except ftplib.error_perm:
            ftp.mkd(part)
            ftp.cwd(part)


def upload_tree(ftp: ftplib.FTP, webroot: str, local_root: Path, skip_files: set[str] | None = None) -> int:
    skip_files = skip_files or set()
    count = 0
    for path in sorted(local_root.rglob("*")):
        if not path.is_file():
            continue
        rel = path.relative_to(local_root)
        rel_posix = rel.as_posix()
        if rel_posix in skip_files:
            print(f"  ↷ skipped {rel_posix} (kept remote copy)")
            continue
        goto_webroot(ftp, webroot)
        ensure_dirs(ftp, rel.parent)
        with path.open("rb") as handle:
            ftp.storbinary(f"STOR {rel.name}", handle)
        print(f"  ↑ {rel_posix}")
        count += 1
    return count


def upload_bytes(ftp: ftplib.FTP, webroot: str, rel_path: str, payload: bytes) -> None:
    rel = Path(rel_path)
    goto_webroot(ftp, webroot)
    ensure_dirs(ftp, rel.parent)
    from io import BytesIO

    ftp.storbinary(f"STOR {rel.name}", BytesIO(payload))
    print(f"  ↑ restored {rel_path}")


def deploy_with_credentials(user: str, password: str) -> int:
    ftp = connect_ftp(user, password)
    webroot = find_webroot(ftp)
    print(f"Using FTP user {user} → /{webroot}/")
    goto_webroot(ftp, webroot)
    config_backup = backup_remote_file(ftp, webroot, "api/config.local.php")
    wipe_remote(ftp)
    skip = {"api/config.local.php"} if config_backup else set()
    uploaded = upload_tree(ftp, webroot, DIST, skip_files=skip)
    if config_backup:
        upload_bytes(ftp, webroot, "api/config.local.php", config_backup)
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
