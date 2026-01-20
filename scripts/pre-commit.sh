#!/bin/sh
set -e

echo "Running frontend checks..."

cd frontend

bun check
bun run build
bun run test:dry

cd ../backend

go test ./... -v
