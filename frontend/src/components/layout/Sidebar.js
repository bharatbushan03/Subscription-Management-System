/**
 * Application Sidebar Navigation Rail
 */

export function Sidebar({ currentRoute = 'dashboard', isCollapsed = false }) {
  const navSections = [
    {
      title: 'Overview',
      items: [
        { path: 'dashboard', label: 'Dashboard', icon: 'grid_view' }
      ]
    },
    {
      title: 'Catalog & Pricing',
      items: [
        { path: 'products-plans', label: 'Products & Plans', icon: 'inventory_2', badge: 'Tiering' },
        { path: 'addons-coupons', label: 'Add-ons & Coupons', icon: 'sell' }
      ]
    },
    {
      title: 'Lifecycle',
      items: [
        { path: 'customers', label: 'Customers', icon: 'group', badge: '2.8k' },
        { path: 'subscriptions', label: 'Subscriptions', icon: 'autorenew' },
        { path: 'quotations-deals', label: 'Quotations & Deals', icon: 'request_quote' }
      ]
    },
    {
      title: 'Billing & Finance',
      items: [
        { path: 'invoices-receipts', label: 'Invoices & Receipts', icon: 'receipt_long' },
        { path: 'payments-dunning', label: 'Payments & Dunning', icon: 'account_balance_wallet', badge: 'Retry #2' },
        { path: 'tax-ledgers', label: 'Tax & Ledgers', icon: 'menu_book' }
      ]
    },
    {
      title: 'Intelligence',
      items: [
        { path: 'revenue-analytics', label: 'Revenue Analytics', icon: 'query_stats' },
        { path: 'churn-retention', label: 'Churn & Retention', icon: 'stacked_line_chart', badge: 'ML v4.2' }
      ]
    },
    {
      title: 'Settings & Dev',
      items: [
        { path: 'webhooks-api', label: 'Webhooks & API', icon: 'terminal' },
        { path: 'organization-settings', label: 'Organization Settings', icon: 'settings' }
      ]
    }
  ];

  return `
    <aside class="fixed left-0 top-0 h-full ${isCollapsed ? 'w-16' : 'w-64'} bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between select-none transition-all duration-300">
      <div class="flex flex-col h-full">
        <!-- Logo Header -->
        <div class="h-16 px-4 flex items-center justify-between bg-surface-container-lowest border-b border-surface-container-low/60">
          <a href="#dashboard" class="flex items-center gap-2.5 min-w-0">
            <img
              alt="Brightloop Logo"
              class="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida/AEtjO1WMyxc0NHxkyj9Cc8SAIuc4S52jbrmHWHfHtksfJmbwzgwjxwGq1cz9dvU1cvXEueYY8RuwmTx0r6hEccTWSCeLBR2yWfvYbIzpZU7-YuPCkSCH8QQMerywUBk4mJaKTRja5X3_-Jh3APv_0SZjHazBWl2o6GgmDxu5K7wAG4UGp0xWIdJ2ani8zPvC3glNTHUZDa76xUkWn4E7b6tam-JpuCMqmqfwH3m_iWPwU0Af-A"
            />
            ${!isCollapsed ? `
              <div class="flex flex-col min-w-0">
                <span class="font-headline-sm text-[16px] text-on-surface truncate tracking-tight font-bold">Brightloop</span>
                <span class="font-label-sm text-[10px] text-primary uppercase tracking-wider font-semibold">Billing Core</span>
              </div>
            ` : ''}
          </a>
          ${!isCollapsed ? `
            <button id="sidebar-toggle-btn" aria-label="Collapse sidebar" class="text-on-surface-variant hover:text-on-surface hover:bg-surface-container p-1 rounded-lg transition-colors" type="button">
              <span class="material-symbols-outlined text-[18px]">dock_to_left</span>
            </button>
          ` : ''}
        </div>

        <!-- Tenant Realm Indicator -->
        ${!isCollapsed ? `
          <div class="px-4 py-2">
            <div class="flex items-center justify-between px-2.5 py-1.5 bg-surface-container-low rounded-lg cursor-pointer hover:bg-surface-container transition-colors">
              <div class="flex items-center gap-2 min-w-0">
                <span class="material-symbols-outlined text-[18px] text-primary">cloud_done</span>
                <div class="flex flex-col min-w-0">
                  <span class="font-label-md text-label-md text-on-surface font-semibold truncate">Brightloop Cloud</span>
                  <span class="font-label-sm text-[10px] text-on-surface-variant truncate">Production US-East</span>
                </div>
              </div>
              <span class="material-symbols-outlined text-[16px] text-on-surface-variant">unfold_more</span>
            </div>
          </div>
        ` : ''}

        <!-- Nav Links List -->
        <div class="flex-1 overflow-y-auto px-2 py-2">
          <nav class="flex flex-col gap-1">
            ${navSections.map(section => `
              ${!isCollapsed ? `
                <div class="px-2 pt-3 pb-1">
                  <span class="font-label-sm text-[11px] uppercase tracking-wider text-secondary font-semibold">${section.title}</span>
                </div>
              ` : '<div class="h-px bg-surface-container my-1"></div>'}
              ${section.items.map(item => {
                const isActive = currentRoute === item.path || (item.path === 'dashboard' && currentRoute === '');
                return `
                  <a
                    href="#${item.path}"
                    data-nav-path="${item.path}"
                    title="${item.label}"
                    class="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-body-sm transition-all group ${
                      isActive
                        ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                        : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                    }"
                  >
                    <div class="flex items-center gap-2.5 min-w-0">
                      <span class="material-symbols-outlined text-[18px] ${isActive ? 'text-on-primary' : 'text-on-surface-variant group-hover:text-primary'}">${item.icon}</span>
                      ${!isCollapsed ? `<span class="truncate">${item.label}</span>` : ''}
                    </div>
                    ${!isCollapsed && item.badge ? `
                      <span class="px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-surface-container-high text-on-surface-variant'
                      }">${item.badge}</span>
                    ` : ''}
                  </a>
                `;
              }).join('')}
            `).join('')}
          </nav>
        </div>
      </div>
    </aside>
  `;
}

