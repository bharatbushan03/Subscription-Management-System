/**
 * Global Command Palette (Cmd+K) Component
 */

export function CommandPalette({ isOpen, onClose, onSelect }) {
  if (!isOpen) return '';

  return `
    <div id="command-palette-backdrop" class="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-[100] flex items-start justify-center pt-20 px-4">
      <div class="bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant/30 w-full max-w-xl overflow-hidden animate-fade-in">
        <div class="flex items-center px-4 py-3 border-b border-surface-container-low gap-3">
          <span class="material-symbols-outlined text-secondary text-[22px]">search</span>
          <input
            id="command-palette-input"
            type="text"
            placeholder="Search subscriptions, invoices, customers, settings (Esc to close)..."
            class="flex-1 bg-transparent text-on-surface font-body-md placeholder:text-on-surface-variant focus:outline-none"
            autofocus
          />
          <span class="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-caption-mono text-[10px]">ESC</span>
        </div>

        <div class="max-h-80 overflow-y-auto p-2 divide-y divide-surface-container/50">
          <div class="py-1">
            <span class="px-3 py-1 font-label-sm text-[11px] uppercase tracking-wider text-secondary font-semibold block">Navigation & Views</span>
            <div class="flex flex-col gap-0.5 mt-1">
              <a href="#dashboard" class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-container-low text-on-surface transition-colors cursor-pointer group">
                <div class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-[18px] text-primary">grid_view</span>
                  <span class="font-body-sm font-medium">Executive Dashboard</span>
                </div>
                <span class="text-caption-mono text-[11px] text-on-surface-variant group-hover:text-primary">View MRR/ARR</span>
              </a>
              <a href="#customers" class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-container-low text-on-surface transition-colors cursor-pointer group">
                <div class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-[18px] text-secondary">group</span>
                  <span class="font-body-sm font-medium">Customer 360 & Lifecycle</span>
                </div>
                <span class="text-caption-mono text-[11px] text-on-surface-variant group-hover:text-primary">OmniFlow, Synthetix...</span>
              </a>
              <a href="#invoices-receipts" class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-container-low text-on-surface transition-colors cursor-pointer group">
                <div class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-[18px] text-tertiary">receipt_long</span>
                  <span class="font-body-sm font-medium">Invoices & Receipts Ledger</span>
                </div>
                <span class="text-caption-mono text-[11px] text-on-surface-variant group-hover:text-primary">3,842 Invoices</span>
              </a>
              <a href="#tax-ledgers" class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-container-low text-on-surface transition-colors cursor-pointer group">
                <div class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-[18px] text-secondary">menu_book</span>
                  <span class="font-body-sm font-medium">Tax & General Ledgers / Dunning</span>
                </div>
                <span class="text-caption-mono text-[11px] text-on-surface-variant group-hover:text-primary">Avalara & GAAP</span>
              </a>
              <a href="#churn-retention" class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-container-low text-on-surface transition-colors cursor-pointer group">
                <div class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-[18px] text-error">query_stats</span>
                  <span class="font-body-sm font-medium">Churn & Retention Telemetry</span>
                </div>
                <span class="text-caption-mono text-[11px] text-on-surface-variant group-hover:text-primary">Cohort Decay & ML</span>
              </a>
              <a href="#organization-settings" class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-container-low text-on-surface transition-colors cursor-pointer group">
                <div class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-[18px] text-primary">admin_panel_settings</span>
                  <span class="font-body-sm font-medium">Organization Settings & RBAC</span>
                </div>
                <span class="text-caption-mono text-[11px] text-on-surface-variant group-hover:text-primary">Okta SSO · 48 Seats</span>
              </a>
            </div>
          </div>
        </div>
        <div class="px-4 py-2 bg-surface-container-low/50 border-t border-surface-container-low flex items-center justify-between text-caption-mono text-[11px] text-secondary">
          <span>Navigate with <kbd class="px-1 rounded bg-surface-container">↑</kbd> <kbd class="px-1 rounded bg-surface-container">↓</kbd></span>
          <span>Select <kbd class="px-1 rounded bg-surface-container">↵</kbd></span>
        </div>
      </div>
    </div>
  `;
}

