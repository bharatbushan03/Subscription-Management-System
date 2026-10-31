const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/server');

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

describe('1. Gateway Health & System Telemetry', () => {
  test('GET /health returns 200 and operational status', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'ok');
    assert.equal(data.service, 'Brightloop Subscription & Billing API Gateway');
    assert.ok(data.timestamp);
  });

  test('GET /api/analytics/overview returns SaaS telemetry KPIs', async () => {
    const res = await fetch(`${baseUrl}/api/analytics/overview`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data);
    assert.ok(body.data.mrr.total > 0);
    assert.ok(body.data.kpis.newMrr.amount > 0);
    assert.ok(Array.isArray(body.data.mrr.history));
  });
});

describe('2. Customer 360 Registry & Accounts', () => {
  test('GET /api/customers lists registered customer accounts', async () => {
    const res = await fetch(`${baseUrl}/api/customers`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length > 0);
  });

  test('GET /api/customers/:id returns single customer details', async () => {
    const res = await fetch(`${baseUrl}/api/customers/CUST-4481`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.id, 'CUST-4481');
    assert.equal(body.data.name, 'OmniFlow Logistics');
  });

  test('GET /api/customers?search=HyperScale filters customer list', async () => {
    const res = await fetch(`${baseUrl}/api/customers?search=HyperScale`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.length >= 1);
    assert.equal(body.data[0].id, 'CUST-1049');
  });
});

describe('3. Subscription Lifecycle State Machine', () => {
  let createdSubId;

  test('GET /api/subscriptions returns collection of active/staged subscriptions', async () => {
    const res = await fetch(`${baseUrl}/api/subscriptions`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 3);
  });

  test('POST /api/subscriptions creates a new draft subscription', async () => {
    const newSubPayload = {
      customerId: 'CUST-TEST-001',
      customerName: 'Test Enterprise Corp',
      planId: 'plan_growth_pro',
      planName: 'Growth Pro Shard',
      mrrAmount: 1500,
      status: 'draft',
      billingCycle: 'annually',
      seatsProvisioned: 15,
      seatsTotal: 25,
      apiQuotaRequests: 2000000
    };

    const res = await fetch(`${baseUrl}/api/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSubPayload)
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.id);
    createdSubId = body.data.id;
    assert.equal(body.data.customerName, 'Test Enterprise Corp');
    assert.equal(body.data.status, 'draft');
  });

  test('POST /api/subscriptions/:id/activate transitions DRAFT to ACTIVE', async () => {
    const res = await fetch(`${baseUrl}/api/subscriptions/${createdSubId}/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actor: 'Admin Test Runner' })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.status, 'active');
  });

  test('POST /api/subscriptions/:id/pause transitions ACTIVE to PAUSED', async () => {
    const res = await fetch(`${baseUrl}/api/subscriptions/${createdSubId}/pause`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Scheduled seasonal maintenance pause' })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.status, 'paused');
  });

  test('POST /api/subscriptions/:id/resume transitions PAUSED to ACTIVE', async () => {
    const res = await fetch(`${baseUrl}/api/subscriptions/${createdSubId}/resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actor: 'Operations Lead' })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.status, 'active');
  });

  test('POST /api/subscriptions/:id/upgrade modifies plan and computes proration', async () => {
    const res = await fetch(`${baseUrl}/api/subscriptions/${createdSubId}/upgrade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        newPlanId: 'plan_ent_scale',
        newPlanName: 'Enterprise Scale Plus',
        newMrrAmount: 3500,
        newSeats: 50,
        newApiQuota: 10000000,
        actor: 'CSM Tier 3'
      })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.subscription.planName, 'Enterprise Scale Plus');
    assert.equal(body.data.subscription.mrrAmount, 3500);
    assert.equal(body.data.proration.deltaMrr, 2000);
    assert.equal(body.data.proration.isUpgrade, true);
  });

  test('POST /api/subscriptions/:id/renew generates renewed term period', async () => {
    const res = await fetch(`${baseUrl}/api/subscriptions/${createdSubId}/renew`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actor: 'Automated Renewal Cron' })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.renewedSubscription);
    assert.equal(body.data.renewedSubscription.previousSubscriptionId, createdSubId);
    assert.equal(body.data.renewedSubscription.status, 'active');
  });

  test('GET /api/subscriptions/:id/lifecycle retrieves complete audit event timeline', async () => {
    const res = await fetch(`${baseUrl}/api/subscriptions/${createdSubId}/lifecycle`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.subscriptionId, createdSubId);
    assert.ok(Array.isArray(body.timeline));
    assert.ok(body.timeline.length >= 4); // Created, Activated, Paused, Resumed, Upgraded...
  });

  test('POST /api/subscriptions/:id/cancel terminates subscription', async () => {
    const res = await fetch(`${baseUrl}/api/subscriptions/${createdSubId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reason: 'Customer completed migration',
        cancelAtPeriodEnd: false
      })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.status, 'canceled');
  });
});

describe('4. Invoices, Receipts & Dunning Engine', () => {
  let createdInvoiceId;

  test('GET /api/invoices retrieves ledger of customer invoices', async () => {
    const res = await fetch(`${baseUrl}/api/invoices`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length > 0);
  });

  test('POST /api/invoices generates a new billing invoice', async () => {
    const res = await fetch(`${baseUrl}/api/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: 'CUST-4481',
        customerName: 'OmniFlow Logistics',
        subscriptionId: 'sub_4481_ent',
        amount: 2450.00,
        taxAmount: 202.13,
        status: 'open'
      })
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.id);
    createdInvoiceId = body.data.id;
  });

  test('GET /api/invoices/:id returns newly created invoice details', async () => {
    const res = await fetch(`${baseUrl}/api/invoices/${createdInvoiceId}`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.id, createdInvoiceId);
    assert.equal(body.data.amount, 2450.00);
  });

  test('GET /api/dunning/queue returns past due recovery invoices', async () => {
    const res = await fetch(`${baseUrl}/api/dunning/queue`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length > 0);
  });

  test('POST /api/dunning/retry/:invoiceId simulates smart dunning retry', async () => {
    const res = await fetch(`${baseUrl}/api/dunning/retry/INV-2024-8841`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.attemptNumber > 0);
    assert.ok(body.message.includes('INV-2024-8841'));
  });
});

describe('5. Multi-Jurisdiction Tax & General Ledger Mappings', () => {
  test('GET /api/tax/nexus returns active tax jurisdiction thresholds', async () => {
    const res = await fetch(`${baseUrl}/api/tax/nexus`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.some(j => j.jurisdiction.includes('California')));
  });

  test('GET /api/tax/gl-mappings returns chart of accounts mapping', async () => {
    const res = await fetch(`${baseUrl}/api/tax/gl-mappings`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.some(m => m.netsuiteId === 'MAP-NS-1048'));
  });

  test('POST /api/tax/test-post simulates journal entry sync to Odoo GL', async () => {
    const res = await fetch(`${baseUrl}/api/tax/test-post`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoiceId: 'INV-2024-9921',
        amount: 1800.00,
        jurisdiction: 'US-CA'
      })
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.journalEntryId.startsWith('JE-'));
  });
});

describe('6. Organization Governance & Audit Trail', () => {
  test('GET /api/organization/members lists RBAC enterprise users', async () => {
    const res = await fetch(`${baseUrl}/api/organization/members`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.some(u => u.email === 'elena@brightloop.io'));
  });

  test('POST /api/organization/invite sends team member invitation', async () => {
    const res = await fetch(`${baseUrl}/api/organization/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'qa.engineer@brightloop.io',
        name: 'Jordan Lee',
        role: 'Billing Specialist'
      })
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.email, 'qa.engineer@brightloop.io');
  });

  test('GET /api/organization/audit-logs retrieves compliance audit stream', async () => {
    const res = await fetch(`${baseUrl}/api/organization/audit-logs`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length > 0);
  });
});
