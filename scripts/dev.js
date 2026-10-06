#!/usr/bin/env node

/**
 * Haven Kids Café — Local Development Server Runner
 * Runs both Public Website (5173) and Admin Dashboard (5174) concurrently
 * with colorized logs and graceful shutdown.
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

// ANSI color codes
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const CYAN = '\x1b[36m';
const MAGENTA = '\x1b[35m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';

console.clear();
console.log(`
${BOLD}${GREEN}================================================================${RESET}
${BOLD}        HAVEN KIDS CAFÉ — LOCAL DEVELOPMENT SERVERS            ${RESET}
${BOLD}${GREEN}================================================================${RESET}

  ${CYAN}🌐 Public Website:${RESET}    ${BOLD}http://localhost:5173${RESET}
  ${MAGENTA}🔐 Admin Dashboard:${RESET}   ${BOLD}http://localhost:5174${RESET}

  ${DIM}Mode: Local Development (Vite HMR)${RESET}
  ${DIM}Press ${BOLD}Ctrl + C${RESET}${DIM} to stop all services.${RESET}
${BOLD}${GREEN}================================================================${RESET}
`);

function createLogger(prefix, color) {
  return (data) => {
    const lines = data.toString().split('\n');
    for (const line of lines) {
      if (line.trim().length > 0) {
        process.stdout.write(`${color}[${prefix}]${RESET} ${line}\n`);
      }
    }
  };
}

const publicProcess = spawn(npmCmd, ['--prefix', 'public-site', 'run', 'dev'], {
  cwd: rootDir,
  env: { ...process.env, FORCE_COLOR: '1' },
});

const adminProcess = spawn(npmCmd, ['--prefix', 'admin-dashboard', 'run', 'dev'], {
  cwd: rootDir,
  env: { ...process.env, FORCE_COLOR: '1' },
});

publicProcess.stdout.on('data', createLogger('PUBLIC', CYAN));
publicProcess.stderr.on('data', createLogger('PUBLIC:ERR', YELLOW));

adminProcess.stdout.on('data', createLogger('ADMIN', MAGENTA));
adminProcess.stderr.on('data', createLogger('ADMIN:ERR', YELLOW));

function killProcess(proc) {
  if (!proc || proc.killed) return;
  if (isWindows && proc.pid) {
    try {
      spawn('taskkill', ['/pid', proc.pid.toString(), '/T', '/F']);
    } catch {
      proc.kill('SIGTERM');
    }
  } else {
    proc.kill('SIGTERM');
  }
}

function handleShutdown() {
  console.log(`\n${YELLOW}Beende Server... Bis zum nächsten Mal! 👋${RESET}\n`);
  killProcess(publicProcess);
  killProcess(adminProcess);
  process.exit(0);
}

process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);

publicProcess.on('exit', (code) => {
  if (code !== null && code !== 0) {
    console.log(`${YELLOW}[PUBLIC] Prozess beendet mit Code ${code}${RESET}`);
  }
});

adminProcess.on('exit', (code) => {
  if (code !== null && code !== 0) {
    console.log(`${YELLOW}[ADMIN] Prozess beendet mit Code ${code}${RESET}`);
  }
});
