#!/usr/bin/env node

import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('\x1b[1m\x1b[36m====================================================\x1b[0m')
console.log('\x1b[1m\x1b[36m   BRICS Health Resilience Platform - Dev Launcher  \x1b[0m')
console.log('\x1b[1m\x1b[36m====================================================\x1b[0m')

// 1. Detect Python virtual environment
function getPythonBin() {
  const candidates = [
    path.join(__dirname, 'venv', 'bin', 'python'),
    path.join(__dirname, 'venv', 'Scripts', 'python.exe'),
    path.join(__dirname, 'backend', 'venv', 'bin', 'python'),
    path.join(__dirname, 'backend', 'venv', 'Scripts', 'python.exe'),
  ]
  for (const c of candidates) {
    if (fs.existsSync(c)) return c
  }
  return process.platform === 'win32' ? 'python' : 'python3'
}

const pythonBin = getPythonBin()
console.log(`\x1b[33m● Python Environment:\x1b[0m ${pythonBin}`)

const processes = []

function prefixLog(prefix, colorCode, data) {
  const lines = data.toString().split('\n')
  for (const line of lines) {
    if (line.trim().length > 0) {
      console.log(`${colorCode}${prefix}\x1b[0m ${line}`)
    }
  }
}

// 2. Start FastAPI Backend (Port 8000)
console.log('\x1b[36m● Starting FastAPI Backend (http://localhost:8000)...\x1b[0m')
const backend = spawn(
  pythonBin,
  ['-m', 'uvicorn', 'app.main:app', '--reload', '--port', '8000'],
  {
    cwd: path.join(__dirname, 'backend'),
    env: { ...process.env, PYTHONPATH: path.join(__dirname, 'backend') },
    shell: true,
  }
)
processes.push(backend)

backend.stdout.on('data', (d) => prefixLog('[BACKEND] ', '\x1b[36m', d))
backend.stderr.on('data', (d) => prefixLog('[BACKEND] ', '\x1b[36m', d))

// 3. Start Vite React Frontend (Port 5173)
console.log('\x1b[32m● Starting Vite React Frontend (http://localhost:5173)...\x1b[0m')
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  shell: true,
})
processes.push(frontend)

frontend.stdout.on('data', (d) => prefixLog('[FRONTEND]', '\x1b[32m', d))
frontend.stderr.on('data', (d) => prefixLog('[FRONTEND]', '\x1b[32m', d))

console.log('\n\x1b[1m\x1b[32m✓ Both services are launching!\x1b[0m')
console.log('  ➜ Frontend: \x1b[1mhttp://localhost:5173\x1b[0m')
console.log('  ➜ Backend:  \x1b[1mhttp://localhost:8000\x1b[0m')
console.log('  ➜ API Docs: \x1b[1mhttp://localhost:8000/docs\x1b[0m')
console.log('\x1b[33mPress [Ctrl+C] at any time to stop both servers.\x1b[0m\n')

// Clean shutdown on Ctrl+C / SIGINT
function cleanup() {
  console.log('\n\x1b[33mShutting down all services...\x1b[0m')
  for (const p of processes) {
    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', p.pid, '/f', '/t'])
      } else {
        p.kill('SIGINT')
      }
    } catch {}
  }
  setTimeout(() => process.exit(0), 500)
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
process.on('exit', cleanup)
