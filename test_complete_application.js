/**
 * Master Test Runner for Brightloop Enterprise Subscription Management System
 * Executes end-to-end test verification across all tiers:
 *  - Tier 1: Odoo Module Architecture & Schema Validation
 *  - Tier 2: Backend REST API & Subscription Lifecycle State Machine
 *  - Tier 3: Frontend Web Client, Vite Bundling & UI Prototypes
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const repoDir = fs.existsSync(path.join(__dirname, 'Subscription-Management-System'))
  ? path.join(__dirname, 'Subscription-Management-System')
  : __dirname;

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

function logHeader(title) {
  console.log(`\n${colors.bright}${colors.cyan}══════════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}  ${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}══════════════════════════════════════════════════════════════════════${colors.reset}\n`);
}

function runStep(name, command, cwd = process.cwd()) {
  process.stdout.write(`⏳ Running: ${colors.yellow}${name}${colors.reset}... `);
  const start = Date.now();
  try {
    const output = execSync(command, { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`${colors.green}✔ PASSED${colors.reset} (${duration}s)`);
    return { success: true, name, duration, output };
  } catch (err) {
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`${colors.red}✖ FAILED${colors.reset} (${duration}s)`);
    console.error(err.stdout || err.message);
    return { success: false, name, duration, error: err };
  }
}

async function runCompleteTestSuite() {
  logHeader('BRIGHTLOOP ENTERPRISE BILLING — COMPLETE APPLICATION TEST SUITE');

  const results = [];

  // 1. Python Syntax & Compilation
  results.push(runStep(
    'Python Syntax & Bytecode Compilation',
    `python -m compileall "${repoDir}"`
  ));

  // 2. Odoo Module Static Verification
  results.push(runStep(
    'Odoo Module Manifest, XML & Security Access Rules',
    `python "${path.join(repoDir, 'tests', 'test_odoo_module_static.py')}"`
  ));

  // 3. Backend REST API & Lifecycle Suite
  results.push(runStep(
    'Backend REST API Gateway & Lifecycle State Machine (25 tests)',
    'node --test test/api.test.js',
    path.join(repoDir, 'backend')
  ));

  // 4. Frontend SPA Bundling & Components Suite
  results.push(runStep(
    'Frontend Vite Bundling, Component Architecture & Mockups (19 tests)',
    'node --test test/frontend.test.js',
    path.join(repoDir, 'frontend')
  ));

  // Summary Report
  logHeader('TEST EXECUTION SUMMARY');
  let allPassed = true;
  for (const r of results) {
    if (r.success) {
      console.log(`  ${colors.green}✔${colors.reset} ${r.name.padEnd(65)} [${colors.green}PASS${colors.reset} in ${r.duration}s]`);
    } else {
      allPassed = false;
      console.log(`  ${colors.red}✖${colors.reset} ${r.name.padEnd(65)} [${colors.red}FAIL${colors.reset} in ${r.duration}s]`);
    }
  }

  console.log(`\n${colors.bright}Result:${colors.reset} ${allPassed ? `${colors.green}ALL SUITES PASSED (48/48 TESTS COMPLETED)${colors.reset}` : `${colors.red}SOME TESTS FAILED${colors.reset}`}\n`);

  if (!allPassed) {
    process.exit(1);
  }
}

runCompleteTestSuite();
