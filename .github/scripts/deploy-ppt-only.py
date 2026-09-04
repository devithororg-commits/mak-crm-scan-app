#!/usr/bin/env python3
"""Upload only Aurora Studio PPT entry files — completes in under 60 seconds."""
from __future__ import annotations

import ftplib
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DIST = ROOT / "dist"
PPT_FILES = (
    "aurora-ppt.html",
    "aurora-ppt/index.html",
    "assets/aurora-ppt-spa.js",
    "assets/aurora-ppt-spa.css",
    "assets/editorial-botanical-Bu_MnSHi.jpg",
    "sw.js",
)

# Marker string that must exist in the deployed JS bundle (templates feature).
JS_MARKER = "Editorial Pitch"
MIN_JS_BYTES = 780_000


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
    return [(u, passwords[0]) for u in users if u and "apptesting.in" in u and passwords[0]]


def connect(user: str, password: str) -> ftplib.FTP:
    for host in [env_first("APPTESTING_FTP_HOST", "HOSTINGER_FTP_HOST"), "ftp.apptesting.in", "145.79.213.39"]:
        if not host:
            continue
        for attempt in range(3):
            try:
                ftp = ftplib.FTP(timeout=120)
                ftp.connect(host, 21, timeout=60)
                ftp.login(user, password)
                ftp.set_pasv(True)
                return ftp
            except Exception:
                time.sleep(2 * (attempt + 1))
    raise RuntimeError("FTP connect failed")


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


def upload(ftp: ftplib.FTP, rel_path: str, local: Path) -> None:
    rel = Path(rel_path)
    goto_webroot(ftp)
    if rel.parent.parts:
        ensure_dirs(ftp, rel.parent)
    size = local.stat().st_size
    with local.open("rb") as f:
        ftp.storbinary(f"STOR {rel.name}", f)
    print(f"  ↑ {rel_path} ({size:,} bytes)")


def verify_live() -> None:
    time.sleep(4)
    url = f"https://apptesting.in/assets/aurora-ppt-spa.js?v={int(time.time())}"
    req = urllib.request.Request(url, headers={"User-Agent": "aurora-deploy-verify"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        body = resp.read()
    if len(body) < MIN_JS_BYTES:
        raise RuntimeError(f"Live JS too small: {len(body):,} bytes (expected ≥ {MIN_JS_BYTES:,})")
    if JS_MARKER.encode() not in body:
        raise RuntimeError(f"Live JS missing marker: {JS_MARKER}")
    print(f"✅ Live JS verified ({len(body):,} bytes, contains templates)")


def main() -> int:
    pairs = credential_pairs()
    if not pairs:
        print("Missing FTP credentials", file=sys.stderr)
        return 1
    missing = [f for f in PPT_FILES if not (DIST / f).is_file()]
    if missing:
        print(f"Missing: {', '.join(missing)}", file=sys.stderr)
        return 1

    local_js = DIST / "assets/aurora-ppt-spa.js"
    print(f"Local JS: {local_js.stat().st_size:,} bytes")

    for user, password in pairs:
        try:
            ftp = connect(user, password)
            for name in PPT_FILES:
                upload(ftp, name, DIST / name)
            ftp.quit()
            print("PPT FTP upload done")
            verify_live()
            return 0
        except Exception as exc:  # noqa: BLE001
            print(f"failed {user}: {exc}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
