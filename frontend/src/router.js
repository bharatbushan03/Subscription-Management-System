/**
 * Client-Side SPA Hash Router
 * Brightloop Subscription & Billing Architecture
 */

import { store } from './store/index.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { CustomersPage } from './pages/CustomersPage.js';
import { InvoicesPage } from './pages/InvoicesPage.js';
import { TaxLedgersPage } from './pages/TaxLedgersPage.js';
import { ChurnRetentionPage } from './pages/ChurnRetentionPage.js';
import { OrganizationSettingsPage } from './pages/OrganizationSettingsPage.js';

const routes = {
  '': DashboardPage,
  'dashboard': DashboardPage,
  'customers': CustomersPage,
  'invoices-receipts': InvoicesPage,
  'tax-ledgers': TaxLedgersPage,
  'payments-dunning': TaxLedgersPage, // Unified accounting & dunning view
  'revenue-analytics': ChurnRetentionPage,
  'churn-retention': ChurnRetentionPage,
  'organization-settings': OrganizationSettingsPage
};

export class Router {
  constructor(mountSelector = '#page-content') {
    this.mountSelector = mountSelector;
    this.init();
  }

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
  }

  getRoutePath() {
    const hash = window.location.hash.replace(/^#\/?/, '').split('?')[0];
    return hash;
  }

  async handleRoute() {
    const route = this.getRoutePath();
    const pageHandler = routes[route] || DashboardPage;

    // Update store state
    store.setRoute(route || 'dashboard');

    // Update document title
    const titles = {
      dashboard: 'Executive Dashboard · Brightloop Billing Core',
      customers: 'Customer 360 & Lifecycle · Brightloop',
      'invoices-receipts': 'Invoices & Receipts Ledger · Brightloop',
      'tax-ledgers': 'Tax & General Ledgers · Brightloop',
      'churn-retention': 'Churn & Retention Telemetry · Brightloop',
      'organization-settings': 'Organization Settings & Governance · Brightloop'
    };
    document.title = titles[route] || 'Brightloop Enterprise Billing System';

    // Render page into mount target
    const container = document.querySelector(this.mountSelector);
    if (container) {
      container.innerHTML = `
        <div class="flex items-center justify-center py-20 text-secondary">
          <span class="material-symbols-outlined text-[32px] animate-spin text-primary">progress_activity</span>
        </div>
      `;

      try {
        const pageHtml = await pageHandler();
        container.innerHTML = pageHtml;
      } catch (err) {
        console.error('[Router] Page render error:', err);
        container.innerHTML = `
          <div class="p-6 bg-error-container/20 border border-error-container rounded-xl text-error">
            <h3 class="font-bold">Error loading view</h3>
            <p class="text-sm mt-1">${err.message}</p>
          </div>
        `;
      }
    }
  }
}

