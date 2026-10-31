/**
 * Main Application Bootstrap & Lifecycle Manager
 * Brightloop Enterprise Subscription & Billing System
 */

import './styles/main.css';
import { store } from './store/index.js';
import { AppLayout } from './components/layout/AppLayout.js';
import { Router } from './router.js';
import { identityService } from './services/api.js';

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
    identityService.current().then((user) => {
      store.setState({ user });
    }).catch((error) => {
      console.error('[App] Unable to load Odoo session:', error);
    });

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
