#!/usr/bin/env bash

# Makes the script fail fast if an error occurs
set -euo pipefail

# Start the dev server in the background
pnpm dev &
DEV_PID=$!

until curl -s -o /dev/null http://localhost:8787/api/v1/health-check; do
  RETRIES=$((RETRIES + 1))
  if [ "$RETRIES" -ge "$MAX_RETRIES" ]; then
    echo "\n[SEED_LOCAL_DB] Dev server did not become ready in time."
    kill $DEV_PID || true
    exit 1
  fi
  echo "\n[SEED_LOCAL_DB] Waiting for dev server to be ready... ($RETRIES/$MAX_RETRIES)"
  sleep 2
done

echo "\n[SEED_LOCAL_DB] Dev server is ready! Sending request to seed the DB"

curl -X GET http://localhost:8787/api/v1/seed
echo "\n[SEED_LOCAL_DB] DB seeded successfully!"

# Kill the dev server
echo "\n[SEED_LOCAL_DB] Stopping dev server..."
kill $DEV_PID
wait $DEV_PID || true

echo "\n[SEED_LOCAL_DB] Done!"
