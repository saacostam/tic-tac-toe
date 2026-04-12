#!/bin/sh
set -e

echo "Running app checks..."

cd app

bun check
bun run build
bun run test:dry
