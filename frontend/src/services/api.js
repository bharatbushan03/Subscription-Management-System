/**
 * Odoo JSON API client.
 *
 * Authentication is provided by the Odoo session cookie. The server remains
 * authoritative for permissions, validation, totals, and lifecycle actions.
 */

const API_BASE = '/api';

async function fetchJson(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.error) {
    throw new Error(payload.error || `Odoo request failed (${response.status})`);
  }
  return payload.data;
}

export const healthService = {
  check() {
    return identityService.current().then(() => ({
      status: 'ok',
      service: 'Odoo'
    }));
  }
};

export const identityService = {
  current() {
    return fetchJson('/me');
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
  }
};

export const planService = {
  list() {
    return fetchJson('/plans');
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
    return Promise.reject(new Error('Tax nexus reporting is not exposed by Odoo.'));
  },
  getGLMappings() {
    return Promise.reject(new Error('GL mappings are not exposed by Odoo.'));
  }
};

export const dunningService = {
  getQueue() {
    return invoiceService.list({ payment_state: 'not_paid' });
  }
};
