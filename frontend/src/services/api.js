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
    const query = new URLSearchParams(params).toString();
    return fetchJson(`/subscriptions${query ? `?${query}` : ''}`);
  },
  action(id, action) {
    return fetchJson(`/subscriptions/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action })
    });
  }
};

export const customerService = {
  list(params = {}) {
    const query = new URLSearchParams(params).toString();
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
    const query = new URLSearchParams(params).toString();
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
