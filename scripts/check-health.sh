#!/usr/bin/env bash
set -euo pipefail

DEV_PORT="3000"
HOST="${HOST:-127.0.0.1}"

echo "=========================================="
echo "RepoPilot AI — Health Check Diagnostic"
echo "=========================================="

echo -n "Checking Express API (http://${HOST}:${DEV_PORT}/api/health)... "
if curl -s -f -m 5 "http://${HOST}:${DEV_PORT}/api/health" > /tmp/repopilot-api-health.json; then
  echo "OK"
  cat /tmp/repopilot-api-health.json | python3 -m json.tool || cat /tmp/repopilot-api-health.json
else
  echo "FAILED"
  echo "Could not reach Express API on http://${HOST}:${DEV_PORT}/api/health"
fi

echo ""
echo -n "Checking Code Intelligence FastAPI (http://127.0.0.1:8000/health)... "
if curl -s -f -m 3 "http://127.0.0.1:8000/health" > /tmp/repopilot-ci-health.json; then
  echo "OK"
  cat /tmp/repopilot-ci-health.json | python3 -m json.tool || cat /tmp/repopilot-ci-health.json
else
  echo "OFFLINE (FastAPI service not currently running in standalone background mode)"
fi

echo "=========================================="
