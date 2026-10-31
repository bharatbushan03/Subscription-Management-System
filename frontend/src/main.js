/**
 * Main Application Bootstrap & Lifecycle Manager
 * Brightloop Enterprise Subscription & Billing System
 */

import './styles/main.css';
import { store } from './store/index.js';
import { AppLayout } from './components/layout/AppLayout.js';
import { Router } from './router.js';
import { subscriptionService } from './services/api.js';

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

    // 1. Render initial master layout
    this.render();

    // 2. Initialize client-side router
    this.router = new Router('#page-content');
    this.router.handleRoute();

    // 3. Register global keyboard listeners & interactions
    this.setupEventListeners();

    // 4. Subscribe to state changes
    store.subscribe((state) => {
      this.syncStateToDOM(state);
    });

    console.log('🚀 Brightloop Billing Core SPA Architecture Initialized.');
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
