#!/usr/bin/env bash

# Makes the script fail fast if an error occurs
set -euo pipefail

echo "\n[CREATE_LOCAL_DB] Creating local DB D1 (SQLite) Database..."

# Start the dev server in the background
pnpm dev &
DEV_PID=$!

# echo "Dev server started with PID $DEV_PID"
echo "\n[CREATE_LOCAL_DB] Starting dev server in the background (with PID $DEV_PID) to create the \`.wrangler\` folder..."

# Give it some time to boot up (you can increase the sleep if needed)
# Or better: loop until it's responsive
MAX_RETRIES=10
RETRIES=0

until curl -s -o /dev/null http://localhost:8787/api/v1/health-check; do
  RETRIES=$((RETRIES + 1))
  if [ "$RETRIES" -ge "$MAX_RETRIES" ]; then
    echo "\n[CREATE_LOCAL_DB] Dev server did not become ready in time."
    kill $DEV_PID || true
    exit 1
  fi
  echo "\n[CREATE_LOCAL_DB] Waiting for dev server to be ready... ($RETRIES/$MAX_RETRIES)"
  sleep 2
done

echo "\n[CREATE_LOCAL_DB] Dev server is ready! Sending request to create the D1 (SQLite) Database. (Note: Getting a 500 error here is expected)"
curl -X GET http://localhost:8787/api/v1/shipments

# Kill the dev server
echo "\n[CREATE_LOCAL_DB] Stopping dev server..."
kill $DEV_PID
wait $DEV_PID || true

# Run migrations
echo "\n[CREATE_LOCAL_DB] Running migrations to load the DB schema... Make sure to accept running the migrations (Hit 'Y' on the prompt)"
pnpm db:migrate:dev

echo "\n[CREATE_LOCAL_DB] Done!"