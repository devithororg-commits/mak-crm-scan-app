#!/usr/bin/env python3
"""Sync server/.env into dist/api/config.local.php for Hostinger deploy."""
from __future__ import annotations

import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ENV_FILE = ROOT / "server" / ".env"
OUT_FILE = ROOT / "dist" / "api" / "config.local.php"

MAP = {
    "OPENAI_API_KEY": "openai_api_key",
    "TAVILY_API_KEY": "tavily_api_key",
    "UNSPLASH_ACCESS_KEY": "unsplash_access_key",
    "ALLOWED_DOMAIN": "allowed_domain",
    "ALLOWED_EMAILS": "allowed_emails",
    "SESSION_SECRET": "session_secret",
    "OTP_TTL_MINUTES": "otp_ttl_minutes",
    "OTP_RESEND_COOLDOWN": "otp_resend_cooldown",
    "MOCK_OTP": "mock_otp",
    "SMTP_HOST": "smtp_host",
    "SMTP_PORT": "smtp_port",
    "SMTP_USER": "smtp_user",
    "SMTP_PASS": "smtp_pass",
    "SMTP_FROM": "smtp_from",
    "SMTP_ENCRYPTION": "smtp_encryption",
}


def parse_env(path: Path) -> dict[str, str]:
    if not path.is_file():
        return {}
    out: dict[str, str] = {}
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, val = line.split("=", 1)
        out[key.strip()] = val.strip().strip('"').strip("'")
    return out


def php_value(key: str, value: str) -> str:
    if key == "allowed_emails":
        emails = [e.strip() for e in value.split(",") if e.strip()]
        items = ", ".join(repr(e) for e in emails)
        return f"[{items}]"
    if key in ("otp_ttl_minutes", "otp_resend_cooldown", "smtp_port"):
        return str(int(value or "0"))
    if key == "mock_otp":
        return "true" if value.lower() in ("1", "true", "yes") else "false"
    return repr(value)


def main() -> None:
    env = parse_env(ENV_FILE)
    if not OUT_FILE.parent.is_dir():
        print("dist/api missing — run npm run build first")
        return

    defaults = {
        "allowed_domain": "devithor.in",
        "mock_otp": "true",
        "session_secret": "studio-apptesting-change-me",
        "otp_ttl_minutes": "10",
        "otp_resend_cooldown": "60",
        "smtp_host": "smtp.hostinger.com",
        "smtp_port": "465",
        "smtp_encryption": "ssl",
        "smtp_encryption": "ssl",
        "smtp_from": "Creative Studio <info@apptesting.in>",
    }

    config: dict[str, str] = {**defaults}
    for env_key, cfg_key in MAP.items():
        if env_key in env and env[env_key]:
            config[cfg_key] = env[env_key]

    lines = ["<?php", "/** Auto-synced from server/.env — do not commit */", "return ["]
    for key, value in config.items():
        if key == 'smtp_encryption':
            lines.append(f"    '{key}' => {repr(str(value))},")
        else:
            lines.append(f"    '{key}' => {php_value(key, value)},")
    lines.append("];")
    lines.append("")

    OUT_FILE.write_text("\n".join(lines))
    print(f"Wrote {OUT_FILE}")


if __name__ == "__main__":
    main()
