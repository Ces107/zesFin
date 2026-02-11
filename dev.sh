#!/usr/bin/env bash
# Start zesFin backend (port 48080) + frontend (port 5173) in one command.
# Usage: ./dev.sh          - start both
#        ./dev.sh backend  - backend only
#        ./dev.sh frontend - frontend only

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
export JAVA_HOME="C:\\Users\\cpereiro\\scoop\\apps\\temurin21-jdk\\current"

start_backend() {
  echo ">> Starting backend on :48080 ..."
  cd "$ROOT"
  ./mvnw spring-boot:run -q &
  BACKEND_PID=$!
  echo "   Backend PID: $BACKEND_PID"
}

start_frontend() {
  echo ">> Starting frontend on :5173 ..."
  cd "$ROOT/frontend"
  npm run dev &
  FRONTEND_PID=$!
  echo "   Frontend PID: $FRONTEND_PID"
}

cleanup() {
  echo ""
  echo ">> Shutting down..."
  [ -n "$BACKEND_PID" ]  && kill "$BACKEND_PID"  2>/dev/null
  [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null
  wait 2>/dev/null
  echo ">> Done."
}

trap cleanup EXIT INT TERM

case "${1:-all}" in
  backend)  start_backend  ;;
  frontend) start_frontend ;;
  all)
    start_backend
    start_frontend
    ;;
  *)
    echo "Usage: $0 [backend|frontend|all]"
    exit 1
    ;;
esac

echo ""
echo ">> zesFin running — press Ctrl+C to stop"
wait
