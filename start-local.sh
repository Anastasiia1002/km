#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js not found. Install from https://nodejs.org and run again."
  exit 1
fi

echo "Installing dependencies..."
npm install

echo
echo "Starting local server..."
echo "Open in browser: http://localhost:5173/km/"
echo "Press Ctrl+C to stop."
echo
npm run dev
