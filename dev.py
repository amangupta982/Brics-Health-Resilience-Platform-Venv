#!/usr/bin/env python3
"""
BRICS Health Resilience Platform - Fullstack Dev Server Runner
Runs both FastAPI backend (port 8000) and Vite React frontend (port 5173) simultaneously.
Usage: python3 dev.py
"""

import sys
import os
import subprocess
import signal
import time

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

# 1. Detect Python virtual environment
def get_python_bin():
    candidates = [
        os.path.join(ROOT_DIR, "venv", "bin", "python"),
        os.path.join(ROOT_DIR, "venv", "Scripts", "python.exe"),
        os.path.join(ROOT_DIR, "backend", "venv", "bin", "python"),
        os.path.join(ROOT_DIR, "backend", "venv", "Scripts", "python.exe"),
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return sys.executable

python_bin = get_python_bin()

print("\033[1;36m====================================================\033[0m")
print("\033[1;36m   BRICS Health Resilience Platform - Dev Launcher  \033[0m")
print("\033[1;36m====================================================\033[0m")
print(f"\033[33m● Python Environment:\033[0m {python_bin}")

processes = []

def cleanup(*args):
    print("\n\033[33mShutting down all services...\033[0m")
    for p in processes:
        try:
            if sys.platform == "win32":
                p.terminate()
            else:
                os.killpg(os.getpgid(p.pid), signal.SIGTERM)
        except Exception:
            pass
    print("\033[32m✓ All services stopped cleanly.\033[0m")
    sys.exit(0)

signal.signal(signal.SIGINT, cleanup)
signal.signal(signal.SIGTERM, cleanup)

# 2. Check / Ensure PostgreSQL 'brics_health' Database exists
try:
    check_db = subprocess.run(
        ["psql", "-U", "postgres", "-lqt"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        timeout=3
    )
    if check_db.returncode == 0 and "brics_health" not in check_db.stdout:
        print("\033[33m● Database 'brics_health' not found. Creating and populating...\033[0m")
        subprocess.run(["createdb", "-U", "postgres", "brics_health"], capture_output=True)
        dump_path = os.path.join(ROOT_DIR, "backend", "app", "database", "brics_health_dump.sql")
        if os.path.exists(dump_path):
            print("\033[36m● Restoring database schema and data from brics_health_dump.sql...\033[0m")
            subprocess.run(["psql", "-U", "postgres", "-d", "brics_health", "-f", dump_path], capture_output=True)
        print("\033[32m✓ Database 'brics_health' ready.\033[0m")
except Exception:
    pass

# 3. Start FastAPI Backend (Port 8000)
print("\033[36m● Starting FastAPI Backend (http://localhost:8000)...\033[0m")
backend_env = os.environ.copy()
backend_env["PYTHONPATH"] = os.path.join(ROOT_DIR, "backend")

kwargs = {}
if sys.platform != "win32":
    kwargs["preexec_fn"] = os.setsid

backend_cmd = [python_bin, "-m", "uvicorn", "app.main:app", "--reload", "--port", "8000"]
backend_proc = subprocess.Popen(
    backend_cmd,
    cwd=os.path.join(ROOT_DIR, "backend"),
    env=backend_env,
    **kwargs
)
processes.append(backend_proc)

time.sleep(1)

# 3. Start Vite React Frontend (Port 5173)
print("\033[32m● Starting Vite React Frontend (http://localhost:5173)...\033[0m")
npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
frontend_proc = subprocess.Popen(
    [npm_cmd, "run", "dev"],
    cwd=os.path.join(ROOT_DIR, "frontend"),
    **kwargs
)
processes.append(frontend_proc)

print("\n\033[1;32m====================================================\033[0m")
print("\033[1;32m✓ Everything is running together on ONE single link!\033[0m")
print("\033[1;32m====================================================\033[0m")
print("  👉 🌐 \033[1;36mhttp://localhost:8000\033[0m (Frontend + Backend APIs combined)")
print("  ➜ 📚 API Docs:  \033[1mhttp://localhost:8000/docs\033[0m")
print("  ➜ ⚡ Vite Dev:  \033[1mhttp://localhost:5173\033[0m (HMR hot-reload)")
print("\033[33mPress [Ctrl+C] at any time to stop servers.\033[0m\n")

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    cleanup()
