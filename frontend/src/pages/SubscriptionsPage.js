/**
 * Subscriptions List Page — Real API Connected
 * Brightloop Subscription Management System
 */

import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';
import { subscriptionService, customerService, planService } from '../services/api.js';

const statusConfig = {
  active:    { label: 'Active',    variant: 'success', dot: true },
  paused:    { label: 'Paused',    variant: 'warning' },
  past_due:  { label: 'Past Due',  variant: 'danger', dot: true },
  canceled:  { label: 'Canceled',  variant: 'neutral' },
  closed:    { label: 'Closed',    variant: 'neutral' },
  draft:     { label: 'Draft',     variant: 'info' },
  trialing:  { label: 'Trialing',  variant: 'info', dot: true },
  confirmed: { label: 'Confirmed', variant: 'success' }
};

export async function SubscriptionsPage() {
  let result, customers, plans;
  try {
    [result, customers, plans] = await Promise.all([
      subscriptionService.list(),
      customerService.list({ limit: 100 }),
      planService.list()
    ]);
  } catch (err) {
    return `<div class="p-6 text-error">Failed to load subscriptions: ${err.message}</div>`;
  }

  const subscriptions = result.data || [];
  const statusCounts = result.statusCounts || {};
  const totalSubs = result.total || 0;

  const statusTabs = [
    { key: 'all', label: 'All', count: totalSubs },
    { key: 'active', label: 'Active', count: statusCounts.active || 0 },
    { key: 'paused', label: 'Paused', count: statusCounts.paused || 0 },
    { key: 'past_due', label: 'Past Due', count: statusCounts.past_due || 0 },
    { key: 'canceled', label: 'Canceled', count: statusCounts.canceled || 0 },
    { key: 'draft', label: 'Draft', count: statusCounts.draft || 0 }
  ];

  const formatCurrency = (n) => `$${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  const renderRows = (subs) => subs.length === 0
    ? `<tr><td colspan="7" class="py-12 text-center text-secondary text-[13px]">
        <span class="material-symbols-outlined block text-[32px] mb-2">inbox</span>No subscriptions found.
      </td></tr>`
    : subs.map(sub => {
        const sc = statusConfig[sub.status] || { label: sub.status, variant: 'neutral' };
        return `
          <tr class="border-b border-surface-container/40 hover:bg-surface-container-low/50 transition-colors" data-sub-id="${sub.id}">
            <td class="py-3.5 px-4">
              <div class="flex flex-col">
                <span class="font-semibold text-on-surface text-[13px]">${sub.sub_number}</span>
                <span class="text-[11px] text-secondary font-mono">${sub.id}</span>
              </div>
            </td>
            <td class="py-3.5 px-4">
              <span class="font-medium text-on-surface text-[13px]">${sub.customer_name || sub.customerId || '—'}</span>
            </td>
            <td class="py-3.5 px-4">
              <span class="text-[13px] text-on-surface">${sub.plan_name || '—'}</span>
            </td>
            <td class="py-3.5 px-4 tabular-nums font-semibold text-[13px]">
              ${formatCurrency(sub.mrr_amount)}<span class="text-secondary font-normal">/mo</span>
            </td>
            <td class="py-3.5 px-4">
              ${Badge({ text: sc.label, variant: sc.variant, dot: sc.dot })}
            </td>
            <td class="py-3.5 px-4 text-[12px] text-secondary">
              ${formatDate(sub.next_invoice_date)}
            </td>
            <td class="py-3.5 px-4">
              <div class="flex items-center gap-1.5 justify-end">
                ${sub.status === 'active' ? `
                  <button data-action="pause-sub" data-id="${sub.id}" title="Pause"
                    class="p-1.5 rounded-lg hover:bg-surface-container text-secondary hover:text-on-surface transition-colors">
                    <span class="material-symbols-outlined text-[16px]">pause</span>
                  </button>
                  <button data-action="cancel-sub" data-id="${sub.id}" title="Cancel"
                    class="p-1.5 rounded-lg hover:bg-error-container/20 text-secondary hover:text-error transition-colors">
                    <span class="material-symbols-outlined text-[16px]">cancel</span>
                  </button>
                ` : ''}
                ${sub.status === 'paused' ? `
                  <button data-action="resume-sub" data-id="${sub.id}" title="Resume"
                    class="p-1.5 rounded-lg hover:bg-surface-container text-secondary hover:text-tertiary transition-colors">
                    <span class="material-symbols-outlined text-[16px]">play_circle</span>
                  </button>
                ` : ''}
                ${['active', 'past_due'].includes(sub.status) ? `
                  <button data-action="renew-sub" data-id="${sub.id}" title="Renew"
                    class="p-1.5 rounded-lg hover:bg-surface-container text-secondary hover:text-primary transition-colors">
                    <span class="material-symbols-outlined text-[16px]">autorenew</span>
                  </button>
                ` : ''}
                ${sub.status === 'draft' || sub.status === 'confirmed' ? `
                  <button data-action="activate-sub" data-id="${sub.id}" title="Activate"
                    class="p-1.5 rounded-lg hover:bg-primary-container/20 text-secondary hover:text-primary transition-colors">
                    <span class="material-symbols-outlined text-[16px]">check_circle</span>
                  </button>
                ` : ''}
              </div>
            </td>
          </tr>
        `;
      }).join('');

  return `
    <div class="flex flex-col w-full pb-12 animate-fade-in">
      <!-- Header -->
      <section class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">Subscriptions</h1>
            ${Badge({ text: `${statusCounts.active || 0} Active`, variant: 'success', dot: true })}
          </div>
          <p class="font-body-md text-on-surface-variant mt-1">
            Manage the full subscription lifecycle — activate, pause, resume, renew, upgrade, and cancel.
          </p>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          ${Button({ label: 'Export CSV', icon: 'download', variant: 'secondary' })}
          <button id="btn-create-sub" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold text-[13px] transition-all">
            <span class="material-symbols-outlined text-[18px]">add</span>
            New Subscription
          </button>
        </div>
      </section>

      <!-- Summary KPI row -->
      <section class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        ${['active','paused','past_due','canceled'].map(s => {
          const c = statusConfig[s];
          return `<div class="p-4 bg-white rounded-xl shadow-sm border border-surface-container/50">
            <span class="text-[11px] uppercase tracking-wider text-secondary font-semibold">${c.label}</span>
            <div class="text-[26px] font-bold text-on-surface tabular-nums mt-1">${statusCounts[s] || 0}</div>
          </div>`;
        }).join('')}
      </section>

      <!-- Table -->
      <section class="bg-white rounded-xl shadow-sm border border-surface-container/50 overflow-hidden">
        <!-- Filter row -->
        <div class="flex items-center gap-2 px-4 py-3 border-b border-surface-container/60 flex-wrap">
          <div class="flex-1 min-w-[200px] relative">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[18px]">search</span>
            <input id="sub-search" type="text" placeholder="Search by customer, plan, sub number..."
              class="w-full pl-9 pr-3 py-2 border border-surface-container rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <select id="sub-status-filter" class="px-3 py-2 border border-surface-container rounded-lg text-[13px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30">
            ${statusTabs.map(t => `<option value="${t.key}">${t.label} (${t.count})</option>`).join('')}
          </select>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-[13px]">
            <thead>
              <tr class="bg-surface-container-low/50 text-left">
                <th class="py-3 px-4 font-semibold text-on-surface-variant text-[11px] uppercase tracking-wider">Sub #</th>
                <th class="py-3 px-4 font-semibold text-on-surface-variant text-[11px] uppercase tracking-wider">Customer</th>
                <th class="py-3 px-4 font-semibold text-on-surface-variant text-[11px] uppercase tracking-wider">Plan</th>
                <th class="py-3 px-4 font-semibold text-on-surface-variant text-[11px] uppercase tracking-wider">MRR</th>
                <th class="py-3 px-4 font-semibold text-on-surface-variant text-[11px] uppercase tracking-wider">Status</th>
                <th class="py-3 px-4 font-semibold text-on-surface-variant text-[11px] uppercase tracking-wider">Next Invoice</th>
                <th class="py-3 px-4 font-semibold text-on-surface-variant text-[11px] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody id="subs-table-body">
              ${renderRows(subscriptions)}
            </tbody>
          </table>
        </div>

        <!-- Pagination info -->
        <div class="px-4 py-3 border-t border-surface-container/60 flex items-center justify-between text-[12px] text-secondary">
          <span>Showing ${subscriptions.length} of ${totalSubs} subscriptions</span>
          <span>Page 1 of ${result.totalPages || 1}</span>
        </div>
      </section>

      <!-- Create Subscription Modal -->
      <div id="create-sub-modal" class="hidden fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
          <div class="px-6 py-4 border-b border-surface-container/60 flex items-center justify-between">
            <h3 class="font-bold text-[16px] text-on-surface">Create Subscription</h3>
            <button id="close-create-sub" class="text-secondary hover:text-on-surface">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <form id="create-sub-form" class="p-6 flex flex-col gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-[12px] font-semibold text-on-surface">Customer *</label>
              <select id="sub-customer" required class="px-3 py-2 border border-surface-container rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">Select customer...</option>
                ${(customers.data || []).map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
              </select>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-[12px] font-semibold text-on-surface">Plan</label>
              <select id="sub-plan" class="px-3 py-2 border border-surface-container rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">Select plan...</option>
                ${(plans.data || []).map(p => `<option value="${p.id}" data-price="${p.price}">${p.name} — $${p.price}/${p.billing_cycle}</option>`).join('')}
              </select>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1.5">
                <label class="text-[12px] font-semibold text-on-surface">MRR Amount ($)</label>
                <input id="sub-mrr" type="number" min="0" step="0.01" placeholder="0.00"
                  class="px-3 py-2 border border-surface-container rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-[12px] font-semibold text-on-surface">Billing Cycle</label>
                <select id="sub-cycle" class="px-3 py-2 border border-surface-container rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annually">Annually</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1.5">
                <label class="text-[12px] font-semibold text-on-surface">Start Date</label>
                <input id="sub-start" type="date" value="${new Date().toISOString().split('T')[0]}"
                  class="px-3 py-2 border border-surface-container rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-[12px] font-semibold text-on-surface">Status</label>
                <select id="sub-status-new" class="px-3 py-2 border border-surface-container rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                </select>
              </div>
            </div>
            <div id="sub-form-error" class="hidden text-error text-[12px] bg-error-container/20 p-2 rounded-lg"></div>
            <div class="flex gap-2 justify-end pt-2">
              <button type="button" id="cancel-create-sub" class="px-4 py-2 rounded-lg text-[13px] font-semibold text-on-surface hover:bg-surface-container transition-colors">Cancel</button>
              <button type="submit" id="submit-create-sub" class="px-4 py-2 rounded-lg text-[13px] font-semibold bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px]">add</span> Create Subscription
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

// Initialize subscriptions page interactive elements
document.addEventListener('page:rendered', (e) => {
  if (e.detail.route !== 'subscriptions') return;

  const modal = document.querySelector('#create-sub-modal');
  const createBtn = document.querySelector('#btn-create-sub');
  const closeBtn = document.querySelector('#close-create-sub');
  const cancelBtn = document.querySelector('#cancel-create-sub');
  const form = document.querySelector('#create-sub-form');
  const planSelect = document.querySelector('#sub-plan');
  const mrrInput = document.querySelector('#sub-mrr');
  const searchInput = document.querySelector('#sub-search');
  const statusFilter = document.querySelector('#sub-status-filter');

  createBtn?.addEventListener('click', () => modal?.classList.remove('hidden'));
  closeBtn?.addEventListener('click', () => modal?.classList.add('hidden'));
  cancelBtn?.addEventListener('click', () => modal?.classList.add('hidden'));

  // Auto-fill MRR from plan selection
  planSelect?.addEventListener('change', () => {
    const selected = planSelect.options[planSelect.selectedIndex];
    const price = selected?.dataset.price;
    if (price && mrrInput) mrrInput.value = price;
  });

  // Live search/filter
  async function applyFilter() {
    const search = searchInput?.value || '';
    const status = statusFilter?.value || 'all';
    const tbody = document.querySelector('#subs-table-body');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-secondary">
      <span class="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
    </td></tr>`;

    try {
      const params = {};
      if (search) params.search = search;
      if (status && status !== 'all') params.status = status;
      const result = await subscriptionService.list(params);
      const subs = result.data || [];

      if (subs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="py-12 text-center text-secondary text-[13px]">
          <span class="material-symbols-outlined block text-[32px] mb-2">inbox</span>No subscriptions found.
        </td></tr>`;
        return;
      }

      const statusConfig = {
        active: { label: 'Active', variant: 'success', dot: true },
        paused: { label: 'Paused', variant: 'warning' },
        past_due: { label: 'Past Due', variant: 'danger', dot: true },
        canceled: { label: 'Canceled', variant: 'neutral' },
        closed: { label: 'Closed', variant: 'neutral' },
        draft: { label: 'Draft', variant: 'info' }
      };
      const { Badge } = await import('../components/common/Badge.js');
      const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

      tbody.innerHTML = subs.map(sub => {
        const sc = statusConfig[sub.status] || { label: sub.status, variant: 'neutral' };
        return `<tr class="border-b border-surface-container/40 hover:bg-surface-container-low/50">
          <td class="py-3.5 px-4"><span class="font-semibold">${sub.sub_number}</span></td>
          <td class="py-3.5 px-4">${sub.customer_name || '—'}</td>
          <td class="py-3.5 px-4">${sub.plan_name || '—'}</td>
          <td class="py-3.5 px-4 tabular-nums font-semibold">$${(sub.mrr_amount||0).toFixed(2)}<span class="text-secondary font-normal">/mo</span></td>
          <td class="py-3.5 px-4">${Badge({ text: sc.label, variant: sc.variant, dot: sc.dot })}</td>
          <td class="py-3.5 px-4 text-secondary text-[12px]">${formatDate(sub.next_invoice_date)}</td>
          <td class="py-3.5 px-4 text-right">
            ${sub.status === 'active' ? `
              <button data-action="pause-sub" data-id="${sub.id}" class="p-1.5 rounded hover:bg-surface-container text-secondary">
                <span class="material-symbols-outlined text-[16px]">pause</span></button>
              <button data-action="cancel-sub" data-id="${sub.id}" class="p-1.5 rounded hover:bg-error-container/20 text-secondary">
                <span class="material-symbols-outlined text-[16px]">cancel</span></button>` : ''}
            ${sub.status === 'paused' ? `
              <button data-action="resume-sub" data-id="${sub.id}" class="p-1.5 rounded hover:bg-surface-container text-secondary">
                <span class="material-symbols-outlined text-[16px]">play_circle</span></button>` : ''}
          </td>
        </tr>`;
      }).join('');
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-error text-[13px]">Error: ${err.message}</td></tr>`;
    }
  }

  let searchTimer;
  searchInput?.addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(applyFilter, 400); });
  statusFilter?.addEventListener('change', applyFilter);

  // Create subscription form submit
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorDiv = document.querySelector('#sub-form-error');
    const submitBtn = document.querySelector('#submit-create-sub');

    const customerId = document.querySelector('#sub-customer')?.value;
    const planId = document.querySelector('#sub-plan')?.value;
    const mrrAmount = parseFloat(document.querySelector('#sub-mrr')?.value || 0);
    const billingCycle = document.querySelector('#sub-cycle')?.value;
    const startDate = document.querySelector('#sub-start')?.value;
    const status = document.querySelector('#sub-status-new')?.value;

    if (!customerId) {
      errorDiv.textContent = 'Please select a customer.';
      errorDiv.classList.remove('hidden');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating...';
    errorDiv.classList.add('hidden');

    try {
      await subscriptionService.create({ customerId, planId, mrrAmount, billingCycle, startDate, status });
      const { toast } = await import('../components/common/Toast.js');
      toast.success('Subscription created successfully!');
      modal?.classList.add('hidden');
      form.reset();
      // Reload page
      const { Router } = await import('../router.js');
      const r = new Router('#page-content');
      r.handleRoute();
    } catch (err) {
      errorDiv.textContent = err.message;
      errorDiv.classList.remove('hidden');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">add</span> Create Subscription';
    }
  });
});

