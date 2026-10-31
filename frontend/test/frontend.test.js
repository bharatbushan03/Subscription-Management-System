const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const frontendDir = path.resolve(__dirname, '..');
const repoRoot = path.resolve(frontendDir, '..');

describe('1. Production Build & Bundling Verification', () => {
  test('Vite production build generates optimized bundle without errors', () => {
    const buildOutput = execSync('npm run build', {
      cwd: frontendDir,
      encoding: 'utf8'
    });
    assert.ok(buildOutput.includes('built in') || buildOutput.includes('dist/index.html'));

    const distHtml = path.join(frontendDir, 'dist', 'index.html');
    assert.ok(fs.existsSync(distHtml), 'dist/index.html must exist');
    const content = fs.readFileSync(distHtml, 'utf8');
    assert.ok(content.length > 500, 'dist/index.html should not be empty');
  });

  test('Vite dist assets directory contains generated CSS and JS chunks', () => {
    const assetsDir = path.join(frontendDir, 'dist', 'assets');
    assert.ok(fs.existsSync(assetsDir), 'dist/assets directory must exist');
    const files = fs.readdirSync(assetsDir);
    assert.ok(files.some(f => f.endsWith('.js')), 'Must contain bundled JS');
    assert.ok(files.some(f => f.endsWith('.css')), 'Must contain bundled CSS');
  });
});

describe('2. Frontend Architecture & Modular Components Integrity', () => {
  const expectedPages = [
    'DashboardPage.js',
    'CustomersPage.js',
    'InvoicesPage.js',
    'TaxLedgersPage.js',
    'ChurnRetentionPage.js',
    'OrganizationSettingsPage.js',
    'PaymentsDunningPage.js',
    'ProductsPlansPage.js',
    'WebhooksApiPage.js'
  ];

  for (const page of expectedPages) {
    test(`Page module ${page} exists and exports component view`, () => {
      const pagePath = path.join(frontendDir, 'src', 'pages', page);
      assert.ok(fs.existsSync(pagePath), `${page} must exist in src/pages`);
      const content = fs.readFileSync(pagePath, 'utf8');
      assert.ok(content.length > 200, `${page} content should be substantial`);
      assert.ok(
        content.includes('export') || content.includes('function') || content.includes('render'),
        `${page} must define a page view component`
      );
    });
  }

  test('Store and API Service are properly configured', () => {
    const apiPath = path.join(frontendDir, 'src', 'services', 'api.js');
    const storePath = path.join(frontendDir, 'src', 'store', 'index.js');
    assert.ok(fs.existsSync(apiPath), 'api.js must exist');
    assert.ok(fs.existsSync(storePath), 'store/index.js must exist');

    const apiContent = fs.readFileSync(apiPath, 'utf8');
    assert.ok(apiContent.includes('analyticsService'), 'api.js includes analyticsService');
    assert.ok(apiContent.includes('subscriptionService'), 'api.js includes subscriptionService');
    assert.ok(apiContent.includes('activate('), 'api.js includes activation');
    assert.ok(apiContent.includes('pause('), 'api.js includes pause');
    assert.ok(apiContent.includes('resume('), 'api.js includes resume');
    assert.ok(apiContent.includes('renew('), 'api.js includes renew');
    assert.ok(apiContent.includes('upgrade('), 'api.js includes upgrade');
    assert.ok(apiContent.includes('cancel('), 'api.js includes cancel');
  });
});

describe('3. Standalone Prototype Views Integrity', () => {
  const standaloneFiles = [
    'code.html',
    'customer-detail.html',
    'invoices-receipts.html',
    'churn-retention.html',
    'organization-settings.html',
    'payments-dunning.html',
    'tax-ledgers.html'
  ];

  for (const htmlFile of standaloneFiles) {
    test(`Root standalone mockup ${htmlFile} exists and is well-formed`, () => {
      const filePath = path.join(repoRoot, htmlFile);
      assert.ok(fs.existsSync(filePath), `${htmlFile} must exist in repo root`);
      const content = fs.readFileSync(filePath, 'utf8');
      assert.ok(
        content.toLowerCase().includes('<!doctype html>'),
        `${htmlFile} must contain <!doctype html>`
      );
      assert.ok(content.includes('<html'), `${htmlFile} must contain <html tag`);
      assert.ok(content.includes('</html>'), `${htmlFile} must contain </html>`);
      assert.ok(content.length > 5000, `${htmlFile} must contain complete UI code`);
    });
  }
});
