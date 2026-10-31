/**
 * Application Top Header Bar
 */

export function Header({
  breadcrumbs = ['Home', 'Overview', 'Dashboard'],
  user = {},
  notificationCount = 3,
  isCollapsed = false
}) {
  const breadcrumbMarkup = breadcrumbs.map((crumb, idx) => {
    const isLast = idx === breadcrumbs.length - 1;
    return `
      ${idx > 0 ? `<span class="material-symbols-outlined text-[14px]">chevron_right</span>` : ''}
      <span class="${isLast ? 'text-on-surface font-semibold' : 'hover:text-primary transition-colors cursor-pointer'}">${crumb}</span>
    `;
  }).join('');

  return `
    <header class="fixed top-0 ${isCollapsed ? 'left-16' : 'left-64'} right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-6 transition-all duration-300">
      <div class="flex items-center gap-3 min-w-0">
        <button id="mobile-menu-btn" aria-label="Toggle menu" class="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors md:hidden" type="button">
          <span class="material-symbols-outlined text-[22px]">menu</span>
        </button>
        <nav aria-label="Breadcrumbs" class="hidden sm:flex items-center gap-1.5 text-on-surface-variant font-label-md text-label-md">
          ${breadcrumbMarkup}
        </nav>
      </div>

      <!-- Cmd+K Search trigger -->
      <div class="flex-1 max-w-md mx-6 hidden md:block">
        <div id="header-search-trigger" class="relative flex items-center cursor-pointer">
          <span class="material-symbols-outlined absolute left-3 text-[18px] text-on-surface-variant">search</span>
          <input
            readonly
            class="w-full bg-surface-container-low text-on-surface placeholder:text-on-surface-variant font-body-sm text-body-sm rounded-lg pl-9 pr-12 py-2 focus:outline-none hover:bg-surface-container cursor-pointer transition-all"
            placeholder="Search subscriptions, invoices, customers (Cmd+K)..."
            type="text"
          />
          <span class="absolute right-3 px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-caption-mono text-caption-mono text-[10px]">⌘K</span>
        </div>
      </div>

      <!-- Action & Profile cluster -->
      <div class="flex items-center gap-2.5">
        <div class="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary/10 text-tertiary font-label-sm text-label-sm font-semibold">
          <span class="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>Live Mode
        </div>

        <button aria-label="Documentation" class="text-on-surface-variant hover:text-on-surface hover:bg-surface-container p-2 rounded-lg transition-colors" type="button">
          <span class="material-symbols-outlined text-[20px]">help_outline</span>
        </button>

        <div class="relative">
          <button id="notifications-btn" aria-label="Notifications" class="text-on-surface-variant hover:text-on-surface hover:bg-surface-container p-2 rounded-lg transition-colors relative" type="button">
            <span class="material-symbols-outlined text-[20px]">notifications</span>
            ${notificationCount > 0 ? `
              <span class="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-error text-on-error font-label-sm text-[10px] leading-tight flex items-center justify-center font-bold">
                ${notificationCount}
              </span>
            ` : ''}
          </button>
        </div>

        <button class="hidden sm:flex items-center gap-1.5 bg-primary hover:bg-primary-container text-on-primary px-3 py-2 rounded-lg font-label-md text-label-md font-semibold transition-colors shadow-sm" type="button">
          <span class="material-symbols-outlined text-[18px]">add</span>
          <span>New Subscription</span>
        </button>

        <div class="h-6 w-px bg-surface-container hidden sm:block mx-0.5"></div>

        <!-- User Profile Chip -->
        <a href="#organization-settings" class="flex items-center gap-2 pl-1 cursor-pointer group">
          <img
            alt="${user.name || 'User'}"
            class="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all"
            src="${user.avatarUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVuhKdcH1Gx1p6jzzF0KvFDgy0L0qLuaRTmGXWv0Nrgjevn4geJKiLNCw_cMcQmkYfZkYEeyCoKjZJB1Ina4DyrcnUsXeToP13HVgpD-vH93M0ywXFvXyyP307j1jSHMA613p2fh3Ms0e7Lv3qGxtmIHbxF3lcwdBuFOnuKMuzheaqhcDweFzyo11bOtQtt2l4EIYfqk9JNXhOAWc5JJSCxevgBj2ZwGdT1IMtOJ7t'}"
          />
          <div class="hidden lg:flex flex-col text-left">
            <span class="font-label-md text-label-md text-on-surface font-semibold leading-tight">${user.name || 'Elena Vance'}</span>
            <span class="font-label-sm text-[11px] text-on-surface-variant leading-tight">${user.role || 'Enterprise Admin'}</span>
          </div>
          <span class="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-on-surface transition-colors">expand_more</span>
        </a>
        <button id="logout-btn" type="button" class="text-on-surface-variant hover:text-error p-2 rounded-lg" aria-label="Sign out">
          <span class="material-symbols-outlined text-[20px]">logout</span>
        </button>
      </div>
    </header>
  `;
}
