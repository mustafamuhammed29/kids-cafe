#!/usr/bin/env node

/**
 * Haven Kids Café — Production Preview Runner
 * Runs both Public Website (4173) and Admin Dashboard (4174) in preview mode.
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

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
${BOLD}        HAVEN KIDS CAFÉ — PRODUCTION PREVIEW SERVERS           ${RESET}
${BOLD}${GREEN}================================================================${RESET}

  ${CYAN}🌐 Public Website Preview:${RESET}   ${BOLD}http://localhost:4173${RESET}
  ${MAGENTA}🔐 Admin Dashboard Preview:${RESET}  ${BOLD}http://localhost:4174${RESET}

  ${DIM}Mode: Production Bundle Preview${RESET}
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

const publicProcess = spawn(npmCmd, ['--prefix', 'public-site', 'run', 'preview'], {
  cwd: rootDir,
  env: { ...process.env, FORCE_COLOR: '1' },
});

const adminProcess = spawn(npmCmd, ['--prefix', 'admin-dashboard', 'run', 'preview'], {
  cwd: rootDir,
  env: { ...process.env, FORCE_COLOR: '1' },
});

publicProcess.stdout.on('data', createLogger('PUBLIC-PREVIEW', CYAN));
publicProcess.stderr.on('data', createLogger('PUBLIC:ERR', YELLOW));

adminProcess.stdout.on('data', createLogger('ADMIN-PREVIEW', MAGENTA));
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
  console.log(`\n${YELLOW}Beende Preview-Server... 👋${RESET}\n`);
  killProcess(publicProcess);
  killProcess(adminProcess);
  process.exit(0);
}

process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);
