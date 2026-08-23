#!/usr/bin/env bash
# Deploy Creative Studio Pro to apptesting.in (Hostinger FTP).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

if [ ! -f dist/index.html ]; then
  echo "dist/index.html missing — run npm run build first"
  exit 1
fi

python3 .github/scripts/deploy-apptesting.py
