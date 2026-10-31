/**
 * Main Application Bootstrap & Lifecycle Manager
 * Brightloop Enterprise Subscription & Billing System
 */

import './styles/main.css';
import { store } from './store/index.js';
import { AppLayout } from './components/layout/AppLayout.js';
import { Router } from './router.js';
import { identityService } from './services/api.js';
import { subscriptionService } from './services/api.js';
import { LoginPage, bindLoginForm } from './pages/LoginPage.js';
import { authService } from './services/api.js';
import { customerService, planService } from './services/api.js';

class Application {
  constructor() {
    this.appMount = document.querySelector('#app');
    this.router = null;
  }

  init() {
    if (!this.appMount) {
      console.error('[App] #app root container not found!');
      return;
    }

    identityService.current().then((user) => {
      store.setState({ user });
      this.renderApplication();
    }).catch((error) => {
      if (error.status === 401) {
        this.showLogin();
      } else {
        this.appMount.innerHTML = `<div class="p-8 text-error">Unable to connect to the API: ${error.message}</div>`;
      }
    });
    window.addEventListener('auth-expired', () => {
      if (localStorage.getItem('subscription_management_token')) window.location.reload();
    });

    console.log('🚀 Brightloop Billing Core SPA Architecture Initialized.');
  }

  showLogin() {
    this.appMount.innerHTML = LoginPage();
    bindLoginForm(() => window.location.reload());
  }

  renderApplication() {
    this.render();
    this.router = new Router('#page-content');
    this.router.handleRoute();
    this.setupEventListeners();
    store.subscribe((state) => this.syncStateToDOM(state));
  }

  render() {
    this.appMount.innerHTML = AppLayout({ contentHtml: '' });
  }

  setupEventListeners() {
    // Global Cmd+K / Ctrl+K keyboard shortcut
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        store.toggleCommandPalette();
      } else if (e.key === 'Escape' && store.getState().isCommandPaletteOpen) {
        store.toggleCommandPalette(false);
      }
    });

    // Delegation on app mount for dynamic elements
    this.appMount.addEventListener('click', (e) => {
      // Search trigger click
      if (e.target.closest('#header-search-trigger')) {
        store.toggleCommandPalette(true);
      }
      if (e.target.closest('#logout-btn')) authService.logout();
      if (e.target.closest('#add-customer-btn')) {
        const name = prompt('Customer name:');
        const email = name && prompt('Customer email:');
        if (name && email) customerService.create({ name, email }).then(() => this.router.handleRoute()).catch((error) => alert(error.message));
      }
      if (e.target.closest('#add-plan-btn')) {
        const name = prompt('Plan name:');
        const price = name && prompt('Monthly price:');
        if (name && price) planService.create({ name, recurring_price: Number(price), billing_frequency: 'monthly' }).then(() => this.router.handleRoute()).catch((error) => alert(error.message));
      }

      // Command palette backdrop click to close
      if (e.target.id === 'command-palette-backdrop') {
        store.toggleCommandPalette(false);
      }

      // Close when clicking an item inside command palette
      if (e.target.closest('#command-palette-backdrop a')) {
        store.toggleCommandPalette(false);
      }

      // Sidebar collapse toggle
      if (e.target.closest('#sidebar-toggle-btn') || e.target.closest('#mobile-menu-btn')) {
        store.toggleSidebar();
      }

      // Subscription Lifecycle Actions
      if (e.target.closest('#btn-sub-renew')) {
        const btn = e.target.closest('#btn-sub-renew');
        btn.disabled = true;
        btn.innerHTML = `<span class="material-symbols-outlined text-[16px] animate-spin">refresh</span> Renewing...`;
        subscriptionService.renew('sub_4481_ent', 'Elena Vance').then(res => {
          alert(res && res.message ? res.message : 'Subscription successfully renewed for 1 additional year!');
          btn.innerHTML = `<span class="material-symbols-outlined text-[16px]">check</span> Renewed!`;
        }).catch(err => {
          alert('Renewal triggered: ' + err.message);
        });
      }

      if (e.target.closest('#btn-sub-pause')) {
        const btn = e.target.closest('#btn-sub-pause');
        const reason = prompt('Enter reason for pausing recurring billing:', 'Customer system maintenance');
        if (reason) {
          subscriptionService.pause('sub_4481_ent', reason).then(res => {
            alert(res && res.message ? res.message : 'Subscription paused successfully.');
            btn.innerHTML = `<span class="material-symbols-outlined text-[16px]">play_circle</span> Resume Billing`;
          });
        }
      }

      if (e.target.closest('#btn-sub-upgrade')) {
        alert('Plan Upgrade: Selected Tier 3 Enterprise Infinite. Prorated delta charge calculated: $0.00.');
      }

      if (e.target.closest('#btn-sub-cancel')) {
        if (confirm('Are you sure you want to cancel subscription sub_4481_ent? This will initiate churn protocol.')) {
          subscriptionService.cancel('sub_4481_ent', { reason: 'CSM Escalation' }).then(res => {
            alert(res && res.message ? res.message : 'Subscription cancellation processed.');
          });
        }
      }
    });
  }

  syncStateToDOM(state) {
    // Sync Command Palette DOM visibility
    const paletteBackdrop = document.querySelector('#command-palette-backdrop');
    if (state.isCommandPaletteOpen && !paletteBackdrop) {
      // Re-render layout or append palette
      this.render();
      this.router.handleRoute();
    } else if (!state.isCommandPaletteOpen && paletteBackdrop) {
      paletteBackdrop.remove();
    }

    // Sync active nav item in sidebar
    document.querySelectorAll('[data-nav-path]').forEach(el => {
      const path = el.getAttribute('data-nav-path');
      const isActive = path === state.currentRoute || (path === 'dashboard' && state.currentRoute === '');
      if (isActive) {
        el.className = 'flex items-center justify-between px-2.5 py-1.5 rounded-lg text-body-sm transition-all group bg-primary-container text-on-primary font-semibold shadow-sm';
      } else {
        el.className = 'flex items-center justify-between px-2.5 py-1.5 rounded-lg text-body-sm transition-all group text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface';
      }
    });
  }
}

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new Application();
  app.init();
});
