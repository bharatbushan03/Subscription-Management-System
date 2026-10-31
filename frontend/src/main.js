/**
 * Main Application Bootstrap & Lifecycle Manager
 * Brightloop Enterprise Subscription & Billing System
 * Phase 2: Fully connected with JWT auth and real API
 */

import './styles/main.css';
import { store } from './store/index.js';
import { AppLayout } from './components/layout/AppLayout.js';
import { Router } from './router.js';
import { authService, subscriptionService, tokenStorage } from './services/api.js';
import { LoginPage, initLoginPage } from './pages/LoginPage.js';
import { toast, confirmDialog, promptDialog } from './components/common/Toast.js';

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

    // Check auth state first
    if (!authService.isLoggedIn()) {
      this.renderLogin();
      return;
    }

    // Load stored user into store
    const storedUser = tokenStorage.getUser();
    if (storedUser) {
      store.setState({ user: storedUser });
    }

    // 1. Render master layout
    this.render();

    // 2. Initialize router
    this.router = new Router('#page-content');
    this.router.handleRoute();

    // 3. Register global interactions
    this.setupEventListeners();

    // 4. Subscribe to state changes
    store.subscribe((state) => this.syncStateToDOM(state));

    // 5. Update user display in header
    this.updateUserDisplay();

    console.log('✅ Brightloop Billing Core SPA initialized.');
  }

  renderLogin() {
    this.appMount.innerHTML = LoginPage();
    initLoginPage();
  }

  render() {
    this.appMount.innerHTML = AppLayout({ contentHtml: '' });
  }

  updateUserDisplay() {
    const user = store.getState().user;
    const nameEl = document.querySelector('#header-user-name');
    const roleEl = document.querySelector('#header-user-role');
    if (nameEl) nameEl.textContent = user?.name || 'User';
    if (roleEl) roleEl.textContent = user?.role || '';
  }

  setupEventListeners() {
    // Global Cmd+K shortcut
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        store.toggleCommandPalette();
      } else if (e.key === 'Escape' && store.getState().isCommandPaletteOpen) {
        store.toggleCommandPalette(false);
      }
    });

    // Delegated click handler on app mount
    this.appMount.addEventListener('click', async (e) => {

      // Command palette open
      if (e.target.closest('#header-search-trigger')) {
        store.toggleCommandPalette(true);
      }

      // Command palette close on backdrop
      if (e.target.id === 'command-palette-backdrop') {
        store.toggleCommandPalette(false);
      }
      if (e.target.closest('#command-palette-backdrop a')) {
        store.toggleCommandPalette(false);
      }

      // Sidebar toggle
      if (e.target.closest('#sidebar-toggle-btn') || e.target.closest('#mobile-menu-btn')) {
        store.toggleSidebar();
      }

      // ─── Logout ───────────────────────────────────────────────────────────
      if (e.target.closest('[data-action="logout"]')) {
        const confirmed = await confirmDialog({
          title: 'Sign Out',
          message: 'Are you sure you want to sign out of Brightloop?',
          confirmText: 'Sign Out',
          cancelText: 'Stay'
        });
        if (confirmed) {
          await authService.logout();
          window.location.reload();
        }
        return;
      }

      // ─── Subscription Lifecycle Actions ──────────────────────────────────

      // Activate
      const activateBtn = e.target.closest('[data-action="activate-sub"]');
      if (activateBtn) {
        const subId = activateBtn.dataset.id;
        const confirmed = await confirmDialog({
          title: 'Activate Subscription',
          message: `Activate subscription ${subId}? Billing and entitlement quotas will go live immediately.`,
          confirmText: 'Activate'
        });
        if (!confirmed) return;
        try {
          activateBtn.disabled = true;
          await subscriptionService.activate(subId, store.getState().user?.name);
          toast.success('Subscription activated successfully.');
          this.router?.handleRoute();
        } catch (err) {
          toast.error(err.message);
        }
        return;
      }

      // Pause
      const pauseBtn = e.target.closest('[data-action="pause-sub"]');
      if (pauseBtn) {
        const subId = pauseBtn.dataset.id;
        const reason = await promptDialog({
          title: 'Pause Subscription',
          message: 'Enter the reason for pausing recurring billing:',
          placeholder: 'e.g. Customer system maintenance',
          defaultValue: 'Customer requested pause'
        });
        if (!reason) return;
        try {
          pauseBtn.disabled = true;
          await subscriptionService.pause(subId, reason, store.getState().user?.name);
          toast.success('Subscription paused. Recurring billing suspended.');
          this.router?.handleRoute();
        } catch (err) {
          toast.error(err.message);
        }
        return;
      }

      // Resume
      const resumeBtn = e.target.closest('[data-action="resume-sub"]');
      if (resumeBtn) {
        const subId = resumeBtn.dataset.id;
        const confirmed = await confirmDialog({
          title: 'Resume Subscription',
          message: 'Resume billing for this subscription? Recurring invoicing will restart.',
          confirmText: 'Resume Billing'
        });
        if (!confirmed) return;
        try {
          resumeBtn.disabled = true;
          await subscriptionService.resume(subId, store.getState().user?.name);
          toast.success('Subscription resumed. Billing re-aligned.');
          this.router?.handleRoute();
        } catch (err) {
          toast.error(err.message);
        }
        return;
      }

      // Renew
      const renewBtn = e.target.closest('[data-action="renew-sub"]');
      if (renewBtn) {
        const subId = renewBtn.dataset.id;
        const confirmed = await confirmDialog({
          title: 'Renew Subscription',
          message: 'Create a new renewal term? The current subscription will be closed and a new one will be created.',
          confirmText: 'Renew Now'
        });
        if (!confirmed) return;
        try {
          renewBtn.disabled = true;
          renewBtn.innerHTML = '<span class="material-symbols-outlined text-[16px] animate-spin">refresh</span> Renewing...';
          const result = await subscriptionService.renew(subId, store.getState().user?.name);
          toast.success(`Subscription renewed into ${result.data?.renewedSubscription?.sub_number || 'new term'}.`);
          this.router?.handleRoute();
        } catch (err) {
          toast.error(err.message);
        }
        return;
      }

      // Cancel
      const cancelBtn = e.target.closest('[data-action="cancel-sub"]');
      if (cancelBtn) {
        const subId = cancelBtn.dataset.id;
        const confirmed = await confirmDialog({
          title: 'Cancel Subscription',
          message: 'Are you sure? This will permanently cancel the subscription and revoke all entitlements.',
          confirmText: 'Cancel Subscription',
          danger: true
        });
        if (!confirmed) return;
        const reason = await promptDialog({
          title: 'Cancellation Reason',
          message: 'Please provide a reason for cancellation:',
          placeholder: 'e.g. Voluntary cancellation, budget reduction'
        });
        try {
          cancelBtn.disabled = true;
          await subscriptionService.cancel(subId, { reason: reason || 'Unspecified', cancelAtPeriodEnd: false });
          toast.success('Subscription cancelled.');
          this.router?.handleRoute();
        } catch (err) {
          toast.error(err.message);
        }
        return;
      }

      // ─── Dunning retry ───────────────────────────────────────────────────
      const retryBtn = e.target.closest('[data-action="retry-payment"]');
      if (retryBtn) {
        const invoiceId = retryBtn.dataset.id;
        const { dunningService } = await import('./services/api.js');
        try {
          retryBtn.disabled = true;
          await dunningService.retry(invoiceId);
          toast.info(`Payment retry queued for invoice ${invoiceId}.`);
        } catch (err) {
          toast.error(err.message);
        }
        return;
      }
    });
  }

  syncStateToDOM(state) {
    // Command Palette
    const paletteBackdrop = document.querySelector('#command-palette-backdrop');
    if (state.isCommandPaletteOpen && !paletteBackdrop) {
      this.render();
      this.router?.handleRoute();
    } else if (!state.isCommandPaletteOpen && paletteBackdrop) {
      paletteBackdrop.remove();
    }

    // Active nav item
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
