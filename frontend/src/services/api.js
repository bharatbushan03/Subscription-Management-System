/**
 * Supabase API client.
 *
 * The server remains authoritative for permissions, validation, totals, and
 * lifecycle actions.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const TOKEN_KEY = 'subscription_management_token';

async function fetchJson(endpoint, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    },
    ...options
  });
  const payload = await response.json().catch(() => ({}));
  if (response.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new CustomEvent('auth-expired'));
  }
  if (!response.ok || payload.error) {
    const error = new Error(payload.error || `API request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return payload.data;
}

export const healthService = {
  check() {
    return identityService.current().then(() => ({
      status: 'ok',
      service: 'Supabase'
    }));
  }
};

export const identityService = {
  current() {
    return fetchJson('/me');
  }
};

export const organizationService = {
  listMembers() {
    return fetchJson('/organization/members');
  },
  getAuditLogs() {
    return fetchJson('/organization/audit-logs');
  },
  invite(data) {
    return fetchJson('/organization/invite', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};

export const authService = {
  login(email, password) {
    return fetchJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }).then((payload) => {
      localStorage.setItem(TOKEN_KEY, payload.token);
      return payload.user;
    });
  },
  register(name, email, password) {
    return fetchJson('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
  },
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    window.location.hash = '';
    window.location.reload();
  }
};

export const analyticsService = {
  getOverview() {
    return fetchJson('/analytics/overview');
  }
};

export const subscriptionService = {
  list(params = {}) {
    const query = new URLSearchParams(
      typeof params === 'string' ? { state: params } : params
    ).toString();
    return fetchJson(`/subscriptions${query ? `?${query}` : ''}`);
  },
  action(id, action) {
    return fetchJson(`/subscriptions/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action })
    });
  },
  activate(id) {
    return this.action(id, 'activate');
  },
  pause(id) {
    return this.action(id, 'pause');
  },
  resume(id) {
    return this.action(id, 'resume');
  },
  renew(id) {
    return this.action(id, 'renew');
  },
  cancel(id) {
    return this.action(id, 'close');
  },
  create(data) {
    return fetchJson('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  getById(id) {
    return fetchJson(`/subscriptions?search=${encodeURIComponent(id)}`)
      .then(records => records[0]);
  }
};

export const customerService = {
  list(params = {}) {
    const query = new URLSearchParams(
      typeof params === 'string' ? { search: params } : params
    ).toString();
    return fetchJson(`/customers${query ? `?${query}` : ''}`);
  },
  create(data) {
    return fetchJson('/customers', { method: 'POST', body: JSON.stringify(data) });
  }
};

export const planService = {
  list() {
    return fetchJson('/plans');
  },
  create(data) {
    return fetchJson('/plans', { method: 'POST', body: JSON.stringify(data) });
  }
};

export const productService = {
  list() {
    return fetchJson('/products');
  }
};

export const invoiceService = {
  list(params = {}) {
    const query = new URLSearchParams(
      typeof params === 'string' ? { payment_state: params } : params
    ).toString();
    return fetchJson(`/invoices${query ? `?${query}` : ''}`);
  }
};

export const paymentService = {
  list() {
    return fetchJson('/payments');
  }
};

export const quotationService = {
  list() {
    return fetchJson('/quotations');
  },
  convert(id) {
    return fetchJson(`/quotations/${id}/convert`, {
      method: 'POST',
      body: JSON.stringify({})
    });
  }
};

export const taxService = {
  getNexus() {
    return Promise.reject(new Error('Tax nexus reporting is not configured.'));
  },
  getGLMappings() {
    return Promise.reject(new Error('GL mappings are not configured.'));
  }
};

export const dunningService = {
  getQueue() {
    return invoiceService.list({ payment_state: 'not_paid' });
  }
};
