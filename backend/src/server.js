import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { loginUser, registerUser, requireAuth } from './auth.js';
import { supabase } from './supabase.js';

const app = express();
const port = Number(process.env.PORT || 10000);
const allowedOrigin = process.env.CLIENT_URL || '*';

app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));

const asyncRoute = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const sendRows = (res, result, map = (row) => row) => {
  if (result.error) {
    throw result.error;
  }
  res.json({ success: true, count: result.data.length, data: result.data.map(map) });
};

const list = (table, order = 'created_at') => asyncRoute(async (req, res) => {
  let query = supabase.from(table).select('*');
  const { search, ...filters } = req.query;
  for (const [key, value] of Object.entries(filters)) {
    if (value) query = query.eq(key, value);
  }
  if (search) {
    const columns = table === 'customers' ? 'name,email,phone'
      : table === 'invoices' ? 'invoice_number,payment_state'
        : table === 'quotations' ? 'quotation_number,customer_name'
          : table === 'plans' || table === 'products' ? 'name,description'
            : null;
    if (columns) query = query.or(columns.split(',').map((column) => `${column}.ilike.%${search}%`).join(','));
  }
  const result = await query.order(order, { ascending: false });
  const maps = {
    plans: (row) => ({ ...row, tier: row.name, priceAnnual: `$${Number(row.recurring_price || 0).toLocaleString()}`, desc: row.description, badge: row.active ? 'Active' : 'Archived', badgeColor: row.active ? 'success' : 'neutral', activeCount: row.active ? 'Available' : 'Archived' }),
    invoices: (row) => ({ ...row, customer: row.customer_name || 'Customer', invoiceId: row.invoice_number, amount: Number(row.amount_total || 0), status: row.payment_state }),
    customers: (row) => ({ ...row, customerName: row.name })
  };
  sendRows(res, result, maps[table] || ((row) => row));
});

app.get('/health', asyncRoute(async (_req, res) => {
  res.json({ status: 'ok', service: 'Supabase Subscription Management API' });
}));

app.post('/api/auth/register', asyncRoute(async (req, res) => {
  const user = await registerUser(req.body);
  res.status(201).json({ success: true, data: user });
}));

app.post('/api/auth/login', asyncRoute(async (req, res) => {
  res.json({ success: true, data: await loginUser(req.body) });
}));

app.use('/api', requireAuth);

app.get('/api/me', (req, res) => res.json({ success: true, data: req.user }));

app.get('/api/organization/members', asyncRoute(async (_req, res) => {
  const result = await supabase.from('users').select('id,name,email,role,created_at').order('created_at', { ascending: false });
  if (result.error) throw result.error;
  res.json({ success: true, data: result.data, totalProvisioned: result.data.length, maxSeats: 60, mfaEnforcedPercent: 0, securityHealthScore: 98 });
}));

app.get('/api/organization/audit-logs', (_req, res) => {
  res.json({ success: true, data: [] });
});

app.get('/api/plans', list('plans'));
app.get('/api/products', list('products'));
app.get('/api/customers', list('customers', 'name'));
app.get('/api/invoices', list('invoices', 'invoice_date'));
app.get('/api/payments', list('payments', 'payment_date'));
app.get('/api/quotations', list('quotations', 'created_at'));

app.get('/api/subscriptions', asyncRoute(async (req, res) => {
  let query = supabase.from('subscriptions').select('*').order('start_date', { ascending: false });
  if (req.query.state) query = query.eq('status', req.query.state);
  if (req.query.search) {
    query = query.or(`subscription_number.ilike.%${req.query.search}%,customer_name.ilike.%${req.query.search}%`);
  }
  const result = await query;
  sendRows(res, result);
}));

app.post('/api/subscriptions', asyncRoute(async (req, res) => {
  const required = ['subscription_number', 'customer_name', 'plan_name'];
  const missing = required.filter((field) => !req.body[field]);
  if (missing.length) return res.status(400).json({ success: false, error: `Missing fields: ${missing.join(', ')}` });
  const result = await supabase.from('subscriptions').insert(req.body).select().single();
  if (result.error) throw result.error;
  res.status(201).json({ success: true, data: result.data });
}));

app.post('/api/customers', asyncRoute(async (req, res) => {
  const { name, email = '', phone = '' } = req.body;
  if (!name) return res.status(400).json({ success: false, error: 'Customer name is required' });
  const result = await supabase.from('customers').insert({ name: name.trim(), email: email.trim(), phone: phone.trim() }).select().single();
  if (result.error) throw result.error;
  res.status(201).json({ success: true, data: result.data });
}));

app.post('/api/plans', asyncRoute(async (req, res) => {
  const { name, recurring_price = 0, billing_frequency = 'monthly', description = '' } = req.body;
  if (!name) return res.status(400).json({ success: false, error: 'Plan name is required' });
  const result = await supabase.from('plans').insert({ name: name.trim(), recurring_price, billing_frequency, description }).select().single();
  if (result.error) throw result.error;
  res.status(201).json({ success: true, data: result.data });
}));

app.post('/api/subscriptions/:id/action', asyncRoute(async (req, res) => {
  const actions = {
    activate: 'active',
    pause: 'paused',
    resume: 'active',
    close: 'closed',
    renew: 'active'
  };
  const status = actions[req.body.action];
  if (!status) return res.status(400).json({ success: false, error: 'Unsupported subscription action' });

  const result = await supabase
    .from('subscriptions')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single();
  if (result.error) throw result.error;
  res.json({ success: true, data: result.data });
}));

app.post('/api/quotations/:id/convert', asyncRoute(async (req, res) => {
  const quotation = await supabase.from('quotations').select('*').eq('id', req.params.id).single();
  if (quotation.error) throw quotation.error;
  const subscription = await supabase.from('subscriptions').insert({
    subscription_number: `SUB-${Date.now()}`,
    customer_id: quotation.data.customer_id,
    customer_name: quotation.data.customer_name,
    plan_id: quotation.data.plan_id,
    plan_name: quotation.data.plan_name,
    status: 'active'
  }).select().single();
  if (subscription.error) throw subscription.error;
  res.status(201).json({ success: true, data: subscription.data });
}));

app.get('/api/analytics/overview', asyncRoute(async (_req, res) => {
  const [subscriptions, invoices] = await Promise.all([
    supabase.from('subscriptions').select('status,monthly_recurring_revenue'),
    supabase.from('invoices').select('amount_total,payment_state')
  ]);
  if (subscriptions.error) throw subscriptions.error;
  if (invoices.error) throw invoices.error;
  const active = subscriptions.data.filter((row) => row.status === 'active');
  const mrr = active.reduce((sum, row) => sum + Number(row.monthly_recurring_revenue || 0), 0);
  const outstanding = invoices.data
    .filter((row) => row.payment_state !== 'paid')
    .reduce((sum, row) => sum + Number(row.amount_total || 0), 0);
  res.json({
    success: true,
    data: {
      mrr: { total: mrr, formatted: `$${mrr.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, activeSubscriptions: active.length },
      arr: { total: mrr * 12, formatted: `$${(mrr * 12).toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
      churn: { ratePercent: 0, netRetention: 100, atRiskExposure: `$${outstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
      receivables: { outstanding, pastDue: outstanding, settledMTD: 0 }
    }
  });
}));

app.use((error, _req, res, _next) => {
  if (error.status && error.status < 500) {
    console.warn(`[api] ${error.status}: ${error.message}`);
  } else {
    console.error('[api]', error);
  }
  res.status(error.status || 500).json({ success: false, error: error.status ? error.message : 'Internal API error' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Supabase API listening on port ${port}`);
});
