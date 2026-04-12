#!/bin/sh

# Always run from project root
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "Starting frontend..."
cd "$ROOT_DIR/frontend" && bun run dev &
FRONTEND_PID=$!

trap "kill $FRONTEND_PID" INT TERM

wait
