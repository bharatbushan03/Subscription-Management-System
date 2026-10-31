/**
 * Brightloop API Client — Fully Connected Service Layer
 * Handles JWT auth, all REST endpoints, and error normalization.
 */

const API_BASE = '/api';

// ─── JWT Token Management ─────────────────────────────────────────────────────

export const tokenStorage = {
  get() { return localStorage.getItem('bl_token'); },
  set(token) { localStorage.setItem('bl_token', token); },
  remove() { localStorage.removeItem('bl_token'); },
  getUser() {
    const raw = localStorage.getItem('bl_user');
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  },
  setUser(user) { localStorage.setItem('bl_user', JSON.stringify(user)); },
  removeUser() { localStorage.removeItem('bl_user'); }
};

// ─── Core Fetch Wrapper ───────────────────────────────────────────────────────

async function fetchJson(endpoint, options = {}) {
  const token = tokenStorage.get();
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  // Handle 401 — redirect to login
  if (response.status === 401) {
    tokenStorage.remove();
    tokenStorage.removeUser();
    if (!window.location.hash.includes('login')) {
      window.location.hash = '#login';
    }
    throw new Error('Session expired. Please log in again.');
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || `Request failed (${response.status})`);
  }

  return payload;
}

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const authService = {
  async login(email, password) {
    const result = await fetchJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    tokenStorage.set(result.data.token);
    tokenStorage.setUser(result.data.user);
    return result.data;
  },

  async logout() {
    try {
      await fetchJson('/auth/logout', { method: 'POST' });
    } finally {
      tokenStorage.remove();
      tokenStorage.removeUser();
    }
  },

  isLoggedIn() {
    return !!tokenStorage.get();
  },

  currentUser() {
    return tokenStorage.getUser();
  }
};

// Legacy compatibility
export const identityService = {
  current() {
    return fetchJson('/me').then(r => r.data);
  }
};

export const healthService = {
  check() {
    return fetch(`${API_BASE.replace('/api', '')}/health`).then(r => r.json());
  }
};

// ─── Analytics Service ────────────────────────────────────────────────────────

export const analyticsService = {
  getOverview() {
    return fetchJson('/analytics/overview').then(r => r.data);
  },
  getRevenue(months = 12) {
    return fetchJson(`/analytics/revenue?months=${months}`).then(r => r.data);
  }
};

// ─── Subscription Service ─────────────────────────────────────────────────────

export const subscriptionService = {
  list(params = {}) {
    const query = new URLSearchParams(typeof params === 'string' ? { status: params } : params).toString();
    return fetchJson(`/subscriptions${query ? `?${query}` : ''}`).then(r => r);
  },
  getById(id) {
    return fetchJson(`/subscriptions/${id}`).then(r => r.data);
  },
  create(data) {
    return fetchJson('/subscriptions', { method: 'POST', body: JSON.stringify(data) }).then(r => r.data);
  },
  update(id, data) {
    return fetchJson(`/subscriptions/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(r => r.data);
  },
  delete(id) {
    return fetchJson(`/subscriptions/${id}`, { method: 'DELETE' });
  },
  activate(id, actor) {
    return fetchJson(`/subscriptions/${id}/activate`, { method: 'POST', body: JSON.stringify({ actor }) });
  },
  pause(id, reason, actor) {
    return fetchJson(`/subscriptions/${id}/pause`, { method: 'POST', body: JSON.stringify({ reason, actor }) });
  },
  resume(id, actor) {
    return fetchJson(`/subscriptions/${id}/resume`, { method: 'POST', body: JSON.stringify({ actor }) });
  },
  renew(id, actor) {
    return fetchJson(`/subscriptions/${id}/renew`, { method: 'POST', body: JSON.stringify({ actor }) });
  },
  upgrade(id, data) {
    return fetchJson(`/subscriptions/${id}/upgrade`, { method: 'POST', body: JSON.stringify(data) });
  },
  cancel(id, data) {
    return fetchJson(`/subscriptions/${id}/cancel`, { method: 'POST', body: JSON.stringify(data) });
  },
  getLifecycle(id) {
    return fetchJson(`/subscriptions/${id}/lifecycle`).then(r => r);
  }
};

// ─── Customer Service ─────────────────────────────────────────────────────────

export const customerService = {
  list(params = {}) {
    const query = new URLSearchParams(typeof params === 'string' ? { search: params } : params).toString();
    return fetchJson(`/customers${query ? `?${query}` : ''}`).then(r => r);
  },
  getById(id) {
    return fetchJson(`/customers/${id}`).then(r => r.data);
  },
  create(data) {
    return fetchJson('/customers', { method: 'POST', body: JSON.stringify(data) }).then(r => r.data);
  },
  update(id, data) {
    return fetchJson(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(r => r.data);
  },
  delete(id) {
    return fetchJson(`/customers/${id}`, { method: 'DELETE' });
  }
};

// ─── Plan Service ─────────────────────────────────────────────────────────────

export const planService = {
  list(params = {}) {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`/plans${query ? `?${query}` : ''}`).then(r => r);
  },
  getById(id) {
    return fetchJson(`/plans/${id}`).then(r => r.data);
  },
  create(data) {
    return fetchJson('/plans', { method: 'POST', body: JSON.stringify(data) }).then(r => r.data);
  },
  update(id, data) {
    return fetchJson(`/plans/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(r => r.data);
  },
  delete(id) {
    return fetchJson(`/plans/${id}`, { method: 'DELETE' });
  }
};

// ─── Invoice Service ──────────────────────────────────────────────────────────

export const invoiceService = {
  list(params = {}) {
    const query = new URLSearchParams(typeof params === 'string' ? { status: params } : params).toString();
    return fetchJson(`/invoices${query ? `?${query}` : ''}`).then(r => r);
  },
  getById(id) {
    return fetchJson(`/invoices/${id}`).then(r => r.data);
  },
  create(data) {
    return fetchJson('/invoices', { method: 'POST', body: JSON.stringify(data) }).then(r => r.data);
  },
  update(id, data) {
    return fetchJson(`/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(r => r.data);
  },
  delete(id) {
    return fetchJson(`/invoices/${id}`, { method: 'DELETE' });
  }
};

// ─── Payment Service ──────────────────────────────────────────────────────────

export const paymentService = {
  list(params = {}) {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`/payments${query ? `?${query}` : ''}`).then(r => r);
  },
  record(data) {
    return fetchJson('/payments', { method: 'POST', body: JSON.stringify(data) });
  },
  refund(id, reason) {
    return fetchJson(`/payments/${id}/refund`, { method: 'POST', body: JSON.stringify({ reason }) });
  }
};

// ─── Quotation Service ────────────────────────────────────────────────────────

export const quotationService = {
  list(params = {}) {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`/quotations${query ? `?${query}` : ''}`).then(r => r);
  },
  getById(id) {
    return fetchJson(`/quotations/${id}`).then(r => r.data);
  },
  create(data) {
    return fetchJson('/quotations', { method: 'POST', body: JSON.stringify(data) }).then(r => r.data);
  },
  update(id, data) {
    return fetchJson(`/quotations/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(r => r.data);
  },
  convert(id) {
    return fetchJson(`/quotations/${id}/convert`, { method: 'POST', body: '{}' });
  },
  delete(id) {
    return fetchJson(`/quotations/${id}`, { method: 'DELETE' });
  }
};

// ─── Tax Service ──────────────────────────────────────────────────────────────

export const taxService = {
  getNexus() {
    return fetchJson('/tax/nexus').then(r => r);
  },
  getGLMappings() {
    return fetchJson('/tax/gl-mappings').then(r => r);
  },
  testPostGL(ruleId) {
    return fetchJson('/tax/test-post', { method: 'POST', body: JSON.stringify({ ruleId }) });
  }
};

// ─── Dunning Service ──────────────────────────────────────────────────────────

export const dunningService = {
  getQueue() {
    return fetchJson('/dunning/queue').then(r => r);
  },
  retry(invoiceId) {
    return fetchJson(`/dunning/retry/${invoiceId}`, { method: 'POST', body: '{}' });
  }
};

// ─── Organization Service ─────────────────────────────────────────────────────

export const organizationService = {
  listMembers() {
    return fetchJson('/organization/members').then(r => r);
  },
  invite(data) {
    return fetchJson('/organization/invite', { method: 'POST', body: JSON.stringify(data) });
  },
  getAuditLogs() {
    return fetchJson('/organization/audit-logs').then(r => r);
  }
};

// ─── Activity Logs ────────────────────────────────────────────────────────────

export const activityService = {
  list(params = {}) {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`/activity-logs${query ? `?${query}` : ''}`).then(r => r);
  }
};

// Legacy product service (maps to plans for backward compat)
export const productService = {
  list() { return planService.list(); }
};
