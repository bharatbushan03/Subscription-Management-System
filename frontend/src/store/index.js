/**
 * Global Reactive Application State Store
 * Brightloop Subscription & Billing Architecture
 */

class Store {
  constructor() {
    this.state = {
      currentRoute: 'dashboard',
      isSidebarCollapsed: false,
      isCommandPaletteOpen: false,
      searchQuery: '',
      liveMode: true,
      user: {
        name: 'Elena Vance',
        email: 'elena@brightloop.io',
        role: 'Enterprise Admin',
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVuhKdcH1Gx1p6jzzF0KvFDgy0L0qLuaRTmGXWv0Nrgjevn4geJKiLNCw_cMcQmkYfZkYEeyCoKjZJB1Ina4DyrcnUsXeToP13HVgpD-vH93M0ywXFvXyyP307j1jSHMA613p2fh3Ms0e7Lv3qGxtmIHbxF3lcwdBuFOnuKMuzheaqhcDweFzyo11bOtQtt2l4EIYfqk9JNXhOAWc5JJSCxevgBj2ZwGdT1IMtOJ7t'
      },
      breadcrumbs: ['Home', 'Overview', 'Dashboard'],
      notifications: [
        { id: 1, title: 'Payment Renewal Overdue', amount: '$24,500.00', time: '18m ago', type: 'error' },
        { id: 2, title: 'Avalara Tax Nexus Warning', amount: 'California (88%)', time: '1h ago', type: 'warning' },
        { id: 3, title: 'SCIM Directory Synced', amount: '48 Provisioned', time: '3h ago', type: 'success' }
      ]
    };
    this.listeners = new Set();
  }

  getState() {
    return this.state;
  }

  setState(partialState) {
    this.state = { ...this.state, ...partialState };
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  // Helper actions
  setRoute(route, breadcrumbs = []) {
    this.setState({
      currentRoute: route,
      breadcrumbs: breadcrumbs.length ? breadcrumbs : this.getDefaultBreadcrumbs(route)
    });
  }

  toggleSidebar() {
    this.setState({ isSidebarCollapsed: !this.state.isSidebarCollapsed });
  }

  toggleCommandPalette(isOpen) {
    this.setState({
      isCommandPaletteOpen: typeof isOpen === 'boolean' ? isOpen : !this.state.isCommandPaletteOpen
    });
  }

  setSearchQuery(query) {
    this.setState({ searchQuery: query });
  }

  getDefaultBreadcrumbs(route) {
    const map = {
      dashboard: ['Brightloop', 'Overview', 'Dashboard'],
      customers: ['Brightloop', 'Lifecycle', 'Customers Directory'],
      'invoices-receipts': ['Brightloop', 'Billing & Finance', 'Invoices & Receipts'],
      'tax-ledgers': ['Brightloop', 'Billing & Finance', 'Tax & General Ledgers'],
      'payments-dunning': ['Brightloop', 'Billing & Finance', 'Payments & Dunning'],
      'churn-retention': ['Brightloop', 'Intelligence', 'Churn & Retention Telemetry'],
      'revenue-analytics': ['Brightloop', 'Intelligence', 'Revenue Analytics'],
      'organization-settings': ['Brightloop', 'Settings & Dev', 'Organization Settings']
    };
    return map[route] || ['Brightloop', 'Overview'];
  }
}

export const store = new Store();

