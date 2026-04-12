#!/bin/sh

# Always run from project root
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "Starting app..."
cd "$ROOT_DIR/app" && bun run dev &
APP_PID=$!

trap "kill $APP_PID" INT TERM

wait
