/**
 * Client-Side SPA Hash Router
 * Brightloop Subscription & Billing — Phase 2: Real API connected
 */

import { store } from './store/index.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { CustomersPage } from './pages/CustomersPage.js';
import { InvoicesPage } from './pages/InvoicesPage.js';
import { TaxLedgersPage } from './pages/TaxLedgersPage.js';
import { ChurnRetentionPage } from './pages/ChurnRetentionPage.js';
import { OrganizationSettingsPage } from './pages/OrganizationSettingsPage.js';
import { ProductsPlansPage } from './pages/ProductsPlansPage.js';
import { PaymentsDunningPage } from './pages/PaymentsDunningPage.js';
import { WebhooksApiPage } from './pages/WebhooksApiPage.js';
import { SubscriptionsPage } from './pages/SubscriptionsPage.js';
import { QuotationsPage } from './pages/QuotationsPage.js';
import { RevenuePage } from './pages/RevenuePage.js';

const routes = {
  '':                     DashboardPage,
  'dashboard':            DashboardPage,
  'products-plans':       ProductsPlansPage,
  'addons-coupons':       ProductsPlansPage,
  'customers':            CustomersPage,
  'subscriptions':        SubscriptionsPage,
  'quotations-deals':     QuotationsPage,
  'invoices-receipts':    InvoicesPage,
  'payments-dunning':     PaymentsDunningPage,
  'tax-ledgers':          TaxLedgersPage,
  'revenue-analytics':    RevenuePage,
  'churn-retention':      ChurnRetentionPage,
  'webhooks-api':         WebhooksApiPage,
  'organization-settings': OrganizationSettingsPage
};

const titles = {
  'dashboard':              'Executive Dashboard · Brightloop',
  'products-plans':         'Products & Plans Catalog · Brightloop',
  'addons-coupons':         'Add-ons & Coupons · Brightloop',
  'customers':              'Customer 360 · Brightloop',
  'subscriptions':          'Subscriptions · Brightloop',
  'quotations-deals':       'Quotations & Deals · Brightloop',
  'invoices-receipts':      'Invoices & Receipts · Brightloop',
  'payments-dunning':       'Payments & Dunning · Brightloop',
  'tax-ledgers':            'Tax & General Ledgers · Brightloop',
  'revenue-analytics':      'Revenue Analytics · Brightloop',
  'churn-retention':        'Churn & Retention · Brightloop',
  'webhooks-api':           'Webhooks & API · Brightloop',
  'organization-settings':  'Organization Settings · Brightloop'
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
    return window.location.hash.replace(/^#\/?/, '').split('?')[0];
  }

  async handleRoute() {
    const route = this.getRoutePath();
    const pageHandler = routes[route] || DashboardPage;

    store.setRoute(route || 'dashboard');
    document.title = titles[route] || 'Brightloop Enterprise Billing';

    const container = document.querySelector(this.mountSelector);
    if (!container) return;

    // Show loading state
    container.innerHTML = `
      <div class="flex items-center justify-center py-20 text-secondary">
        <div class="flex flex-col items-center gap-3">
          <span class="material-symbols-outlined text-[40px] animate-spin text-primary">progress_activity</span>
          <span class="text-[13px] text-on-surface-variant">Loading...</span>
        </div>
      </div>
    `;

    try {
      const pageHtml = await pageHandler();
      container.innerHTML = pageHtml;

      // Fire post-render init for pages that need it
      const initEvent = new CustomEvent('page:rendered', { detail: { route } });
      document.dispatchEvent(initEvent);
    } catch (err) {
      console.error('[Router] Page render error:', err);
      container.innerHTML = `
        <div class="m-6 p-6 bg-error-container/20 border border-error/30 rounded-xl">
          <div class="flex items-center gap-3 mb-2">
            <span class="material-symbols-outlined text-error text-[24px]">error</span>
            <h3 class="font-bold text-on-surface">Error loading view</h3>
          </div>
          <p class="text-[13px] text-on-surface-variant">${err.message}</p>
          <button onclick="window.location.reload()" class="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-[13px] font-semibold">
            Reload Application
          </button>
        </div>
      `;
    }
  }
}
