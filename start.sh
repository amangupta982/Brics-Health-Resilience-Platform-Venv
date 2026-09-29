#!/usr/bin/env bash
# ==============================================================================
# BRICS Health Resilience Platform - Fullstack Dev Server Runner
# Runs both FastAPI backend (port 8000) and Vite React frontend (port 5173)
# ==============================================================================

set -e

# Resolve project root
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# Color formatting
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BOLD}${CYAN}====================================================${NC}"
echo -e "${BOLD}${CYAN}   BRICS Health Resilience Platform - Dev Launcher  ${NC}"
echo -e "${BOLD}${CYAN}====================================================${NC}"

# 1. Detect Python virtual environment
PYTHON_BIN=""
if [ -f "$ROOT_DIR/venv/bin/python" ]; then
    PYTHON_BIN="$ROOT_DIR/venv/bin/python"
elif [ -f "$ROOT_DIR/backend/venv/bin/python" ]; then
    PYTHON_BIN="$ROOT_DIR/backend/venv/bin/python"
elif [ -f "$ROOT_DIR/backend/venv/Scripts/python.exe" ]; then
    PYTHON_BIN="$ROOT_DIR/backend/venv/Scripts/python.exe"
elif command -v python3 &>/dev/null; then
    PYTHON_BIN="$(command -v python3)"
else
    PYTHON_BIN="python"
fi

echo -e "${YELLOW}● Python Environment:${NC} $PYTHON_BIN"

# 2. Trap SIGINT (Ctrl+C) and exit signals to terminate both servers
cleanup() {
    echo -e "\n${YELLOW}Shutting down both servers...${NC}"
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    wait 2>/dev/null || true
    echo -e "${GREEN}✓ All services stopped cleanly.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# 3. Check / Ensure PostgreSQL 'brics_health' Database exists
if command -v psql &>/dev/null; then
    if ! psql -U postgres -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw brics_health; then
        echo -e "${YELLOW}● Database 'brics_health' not found. Creating and populating...${NC}"
        createdb -U postgres brics_health 2>/dev/null || createdb brics_health 2>/dev/null || true
        if [ -f "$ROOT_DIR/backend/app/database/brics_health_dump.sql" ]; then
            echo -e "${CYAN}● Restoring database schema and data from brics_health_dump.sql...${NC}"
            psql -U postgres -d brics_health -f "$ROOT_DIR/backend/app/database/brics_health_dump.sql" &>/dev/null || true
        fi
        echo -e "${GREEN}✓ Database 'brics_health' ready.${NC}"
    fi
fi

# 4. Ensure Frontend bundle is built for Single-URL serving
if [ ! -d "$ROOT_DIR/frontend/dist" ]; then
    echo -e "${CYAN}● Building frontend for single-URL serving...${NC}"
    (cd "$ROOT_DIR/frontend" && npm run build &>/dev/null)
fi

# 5. Start FastAPI Backend (Port 8000 - serves both Frontend UI & Backend APIs)
echo -e "${CYAN}● Starting FastAPI Backend (http://localhost:8000)...${NC}"
(
    export PYTHONPATH="$ROOT_DIR/backend"
    cd "$ROOT_DIR/backend"
    "$PYTHON_BIN" -m uvicorn app.main:app --reload --port 8000 2>&1 | sed -e "s/^/[BACKEND]  /"
) &
BACKEND_PID=$!

# Wait briefly for backend to initialize
sleep 1.5

# 6. Start Vite React Frontend (Port 5173 - dev hot-reload)
echo -e "${GREEN}● Starting Vite React Frontend (http://localhost:5173)...${NC}"
(
    cd "$ROOT_DIR/frontend"
    npm run dev 2>&1 | sed -e "s/^/[FRONTEND] /"
) &
FRONTEND_PID=$!

echo -e "\n${BOLD}${GREEN}====================================================${NC}"
echo -e "${BOLD}${GREEN}✓ Everything is running together on ONE single link!${NC}"
echo -e "${BOLD}${GREEN}====================================================${NC}"
echo -e "  👉 🌐 ${BOLD}${CYAN}http://localhost:8000${NC} (Frontend + Backend APIs combined)"
echo -e "  ➜ 📚 API Docs:  ${BOLD}http://localhost:8000/docs${NC}"
echo -e "  ➜ ⚡ Vite Dev:  ${BOLD}http://localhost:5173${NC} (HMR hot-reload)"
echo -e "${YELLOW}Press [Ctrl+C] at any time to stop servers.${NC}\n"

# Wait for background processes
wait "$BACKEND_PID" "$FRONTEND_PID"
