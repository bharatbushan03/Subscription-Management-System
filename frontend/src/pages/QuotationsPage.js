/**
 * Quotations & Deals Page
 * Brightloop Subscription Management System
 */

import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';
import { quotationService, customerService, planService } from '../services/api.js';
import { toast, confirmDialog } from '../components/common/Toast.js';

const statusConfig = {
  draft:     { label: 'Draft',     variant: 'neutral' },
  sent:      { label: 'Sent',      variant: 'info' },
  confirmed: { label: 'Confirmed', variant: 'success', dot: true },
  converted: { label: 'Converted', variant: 'primary', dot: true },
  expired:   { label: 'Expired',   variant: 'danger' }
};

export async function QuotationsPage() {
  let quotationsRes, customersRes, plansRes;
  try {
    [quotationsRes, customersRes, plansRes] = await Promise.all([
      quotationService.list(),
      customerService.list({ limit: 100 }),
      planService.list()
    ]);
  } catch (err) {
    return `<div class="p-6 text-error">Failed to load quotations: ${err.message}</div>`;
  }

  const quotations = quotationsRes.data || [];
  const customers = customersRes.data || [];
  const plans = plansRes.data || [];

  const totalQuotes = quotations.length;
  const confirmedQuotes = quotations.filter(q => q.status === 'confirmed').length;
  const convertedQuotes = quotations.filter(q => q.status === 'converted').length;
  const pipelineValue = quotations
    .filter(q => ['draft', 'sent', 'confirmed'].includes(q.status))
    .reduce((sum, q) => sum + (q.total || 0), 0);

  const formatCurrency = (n) => `$${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  return `
    <div class="flex flex-col w-full pb-12 animate-fade-in">
      <!-- Section Header -->
      <section class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">Quotations & Deals CPQ</h1>
            ${Badge({ text: `${confirmedQuotes} Confirmed Deals`, variant: 'success', dot: true })}
          </div>
          <p class="font-body-md text-on-surface-variant max-w-4xl mt-1">
            Generate and manage subscription proposals, discount structures, contract durations, and convert confirmed deals into active subscriptions.
          </p>
        </div>

        <div class="flex items-center gap-2 flex-wrap shrink-0">
          ${Button({ label: 'Export Deals (CSV)', icon: 'download', variant: 'secondary' })}
          <button id="btn-open-quote-modal" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary-container text-on-primary rounded-lg shadow-sm font-label-md font-semibold transition-all">
            <span class="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ Create Quotation</span>
          </button>
        </div>
      </section>

      <!-- KPI Grid -->
      <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div class="p-5 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50">
          <span class="font-label-sm uppercase tracking-wider text-secondary font-semibold text-[11px]">Active Pipeline Value</span>
          <div class="text-[26px] font-bold text-on-surface tabular-nums mt-1">${formatCurrency(pipelineValue)}</div>
          <div class="text-[12px] text-tertiary mt-1 flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">trending_up</span> Across open proposals
          </div>
        </div>

        <div class="p-5 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50">
          <span class="font-label-sm uppercase tracking-wider text-secondary font-semibold text-[11px]">Total Quotations</span>
          <div class="text-[26px] font-bold text-on-surface tabular-nums mt-1">${totalQuotes}</div>
          <div class="text-[12px] text-secondary mt-1">All stages recorded</div>
        </div>

        <div class="p-5 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50">
          <span class="font-label-sm uppercase tracking-wider text-secondary font-semibold text-[11px]">Ready to Convert</span>
          <div class="text-[26px] font-bold text-primary tabular-nums mt-1">${confirmedQuotes}</div>
          <div class="text-[12px] text-primary mt-1">Confirmed by customer</div>
        </div>

        <div class="p-5 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50">
          <span class="font-label-sm uppercase tracking-wider text-secondary font-semibold text-[11px]">Converted to Subscriptions</span>
          <div class="text-[26px] font-bold text-tertiary tabular-nums mt-1">${convertedQuotes}</div>
          <div class="text-[12px] text-tertiary mt-1">Active subscriptions provisioned</div>
        </div>
      </section>

      <!-- Quotations Ledger -->
      <section class="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50 overflow-hidden mb-6">
        <!-- Filter Tabs & Search -->
        <div class="border-b border-surface-container/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-2 flex-1 max-w-md">
            <div class="relative w-full">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[18px]">search</span>
              <input
                id="quote-search-input"
                type="text"
                placeholder="Search quotes, customers, IDs..."
                class="w-full pl-9 pr-3 py-1.5 bg-surface-container-lowest border border-surface-container rounded-lg text-body-sm text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>
          </div>

          <div class="flex items-center gap-1.5 p-1 bg-surface-container-low rounded-lg text-label-sm font-semibold">
            <button class="quote-filter-tab px-3 py-1 rounded-md bg-surface-container-lowest text-primary shadow-sm font-bold" data-status="all">All</button>
            <button class="quote-filter-tab px-3 py-1 rounded-md text-secondary hover:text-on-surface" data-status="confirmed">Confirmed</button>
            <button class="quote-filter-tab px-3 py-1 rounded-md text-secondary hover:text-on-surface" data-status="converted">Converted</button>
            <button class="quote-filter-tab px-3 py-1 rounded-md text-secondary hover:text-on-surface" data-status="draft">Draft</button>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-container-low text-secondary font-label-sm uppercase tracking-wider text-[11px]">
                <th class="py-3 px-4 font-semibold">Quotation #</th>
                <th class="py-3 px-4 font-semibold">Customer</th>
                <th class="py-3 px-4 font-semibold">Subtotal</th>
                <th class="py-3 px-4 font-semibold">Discount</th>
                <th class="py-3 px-4 font-semibold">Tax</th>
                <th class="py-3 px-4 font-semibold">Total Amount</th>
                <th class="py-3 px-4 font-semibold">Status</th>
                <th class="py-3 px-4 font-semibold">Valid Until</th>
                <th class="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody id="quotations-table-body" class="divide-y divide-surface-container text-body-sm text-on-surface">
              ${quotations.length === 0 ? `
                <tr>
                  <td colspan="9" class="py-12 text-center text-secondary text-[13px]">
                    <span class="material-symbols-outlined block text-[32px] mb-2 text-secondary/60">request_quote</span>
                    No quotations generated yet. Click <strong>+ Create Quotation</strong> to issue a proposal.
                  </td>
                </tr>
              ` : quotations.map(q => {
                const sc = statusConfig[q.status] || { label: q.status, variant: 'neutral' };
                return `
                  <tr class="hover:bg-surface-container-low/50 transition-colors" data-quote-id="${q.id}">
                    <td class="py-3.5 px-4">
                      <span class="font-bold text-on-surface">${q.quote_number}</span>
                    </td>
                    <td class="py-3.5 px-4 font-medium">
                      ${q.customer_name || 'Customer'}
                    </td>
                    <td class="py-3.5 px-4 tabular-nums text-secondary">
                      ${formatCurrency(q.subtotal)}
                    </td>
                    <td class="py-3.5 px-4 tabular-nums text-secondary">
                      ${formatCurrency(q.discount)}
                    </td>
                    <td class="py-3.5 px-4 tabular-nums text-secondary">
                      ${formatCurrency(q.tax)}
                    </td>
                    <td class="py-3.5 px-4 tabular-nums font-bold text-on-surface">
                      ${formatCurrency(q.total)}
                    </td>
                    <td class="py-3.5 px-4">
                      ${Badge({ text: sc.label, variant: sc.variant, dot: sc.dot })}
                    </td>
                    <td class="py-3.5 px-4 text-secondary text-[12px] font-caption-mono">
                      ${formatDate(q.valid_until)}
                    </td>
                    <td class="py-3.5 px-4 text-right">
                      <div class="flex items-center justify-end gap-1.5">
                        ${q.status === 'confirmed' ? `
                          <button
                            data-action="convert-quote"
                            data-id="${q.id}"
                            class="px-2.5 py-1 bg-primary text-white text-[12px] font-semibold rounded-lg hover:bg-primary/90 transition-all flex items-center gap-1 shadow-sm"
                            title="Convert to Active Subscription"
                          >
                            <span class="material-symbols-outlined text-[14px]">autorenew</span>
                            Convert
                          </button>
                        ` : ''}
                        ${q.status === 'draft' ? `
                          <button
                            data-action="confirm-quote"
                            data-id="${q.id}"
                            class="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high text-primary text-[12px] font-semibold rounded-lg transition-colors flex items-center gap-1"
                            title="Confirm Quotation"
                          >
                            <span class="material-symbols-outlined text-[14px]">check</span>
                            Confirm
                          </button>
                        ` : ''}
                        <button
                          data-action="delete-quote"
                          data-id="${q.id}"
                          class="p-1 rounded-lg hover:bg-error-container/20 text-secondary hover:text-error transition-colors"
                          title="Delete Quotation"
                        >
                          <span class="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <!-- Create Quotation Modal -->
      <div id="create-quote-modal" class="hidden fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-xl mx-4 overflow-hidden max-h-[90vh] flex flex-col">
          <div class="px-6 py-4 border-b border-surface-container/60 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[22px]">request_quote</span>
              <h3 class="font-bold text-[16px] text-on-surface">Create New Quotation</h3>
            </div>
            <button id="close-quote-modal" class="text-secondary hover:text-on-surface">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <form id="create-quote-form" class="p-6 flex flex-col gap-4 overflow-y-auto">
            <div class="flex flex-col gap-1.5">
              <label class="text-[12px] font-semibold text-on-surface">Customer *</label>
              <select id="quote-customer" required class="px-3.5 py-2 border border-surface-container rounded-lg text-[13px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary">
                <option value="">Select a Customer...</option>
                ${customers.map(c => `<option value="${c.id}">${c.name} (${c.id})</option>`).join('')}
              </select>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-[12px] font-semibold text-on-surface">Select Subscription Plan *</label>
              <select id="quote-plan" required class="px-3.5 py-2 border border-surface-container rounded-lg text-[13px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary">
                <option value="">Select a Plan...</option>
                ${plans.map(p => `<option value="${p.id}" data-name="${p.name}" data-price="${p.price}" data-cycle="${p.billing_cycle}">${p.name} — $${p.price}/${p.billing_cycle}</option>`).join('')}
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1.5">
                <label class="text-[12px] font-semibold text-on-surface">Quantity / Seats</label>
                <input id="quote-qty" type="number" min="1" value="1" class="px-3.5 py-2 border border-surface-container rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-[12px] font-semibold text-on-surface">Discount %</label>
                <input id="quote-discount" type="number" min="0" max="100" value="0" step="1" class="px-3.5 py-2 border border-surface-container rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1.5">
                <label class="text-[12px] font-semibold text-on-surface">Tax Rate %</label>
                <input id="quote-tax-rate" type="number" min="0" max="50" value="8" step="0.5" class="px-3.5 py-2 border border-surface-container rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-[12px] font-semibold text-on-surface">Valid Until</label>
                <input id="quote-valid-until" type="date" value="${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}" class="px-3.5 py-2 border border-surface-container rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
              </div>
            </div>

            <!-- Auto-Calculated Totals Box -->
            <div class="p-3.5 bg-surface-container-low rounded-xl flex flex-col gap-1 text-[13px]">
              <div class="flex justify-between text-secondary">
                <span>Subtotal:</span>
                <span id="quote-calc-subtotal" class="font-semibold text-on-surface">$0.00</span>
              </div>
              <div class="flex justify-between text-secondary">
                <span>Discount:</span>
                <span id="quote-calc-discount" class="font-semibold text-error">-$0.00</span>
              </div>
              <div class="flex justify-between text-secondary">
                <span>Estimated Tax:</span>
                <span id="quote-calc-tax" class="font-semibold text-on-surface">$0.00</span>
              </div>
              <div class="border-t border-surface-container/60 mt-1 pt-1.5 flex justify-between font-bold text-on-surface text-[14px]">
                <span>Total Proposal:</span>
                <span id="quote-calc-total" class="text-primary">$0.00</span>
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-[12px] font-semibold text-on-surface">Internal Notes</label>
              <textarea id="quote-notes" rows="2" placeholder="Contract terms, custom SLA notes..." class="px-3.5 py-2 border border-surface-container rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"></textarea>
            </div>

            <div id="quote-form-error" class="hidden px-3.5 py-2 bg-error-container/20 border border-error/30 rounded-lg text-error text-[12px]"></div>

            <div class="flex gap-2 justify-end pt-2">
              <button type="button" id="cancel-quote-modal" class="px-4 py-2 rounded-lg text-[13px] font-semibold text-on-surface hover:bg-surface-container transition-colors">Cancel</button>
              <button type="submit" id="submit-quote-btn" class="px-4 py-2 rounded-lg text-[13px] font-semibold bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-sm">
                <span class="material-symbols-outlined text-[16px]">check</span>
                <span>Issue Quotation</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

// Interactive handlers for QuotationsPage
document.addEventListener('page:rendered', (e) => {
  if (e.detail.route !== 'quotations-deals') return;

  const modal = document.querySelector('#create-quote-modal');
  const openBtn = document.querySelector('#btn-open-quote-modal');
  const closeBtn = document.querySelector('#close-quote-modal');
  const cancelBtn = document.querySelector('#cancel-quote-modal');
  const form = document.querySelector('#create-quote-form');

  const customerSelect = document.querySelector('#quote-customer');
  const planSelect = document.querySelector('#quote-plan');
  const qtyInput = document.querySelector('#quote-qty');
  const discountInput = document.querySelector('#quote-discount');
  const taxRateInput = document.querySelector('#quote-tax-rate');

  const subtotalEl = document.querySelector('#quote-calc-subtotal');
  const discountEl = document.querySelector('#quote-calc-discount');
  const taxEl = document.querySelector('#quote-calc-tax');
  const totalEl = document.querySelector('#quote-calc-total');
  const errorDiv = document.querySelector('#quote-form-error');

  openBtn?.addEventListener('click', () => modal?.classList.remove('hidden'));
  closeBtn?.addEventListener('click', () => modal?.classList.add('hidden'));
  cancelBtn?.addEventListener('click', () => modal?.classList.add('hidden'));

  function calculateTotals() {
    const selected = planSelect?.options[planSelect.selectedIndex];
    const price = parseFloat(selected?.dataset?.price || 0);
    const qty = parseInt(qtyInput?.value || 1);
    const discountPct = parseFloat(discountInput?.value || 0);
    const taxPct = parseFloat(taxRateInput?.value || 0);

    const subtotal = price * qty;
    const discountAmt = subtotal * (discountPct / 100);
    const taxable = subtotal - discountAmt;
    const taxAmt = taxable * (taxPct / 100);
    const total = taxable + taxAmt;

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (discountEl) discountEl.textContent = `-$${discountAmt.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `$${taxAmt.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;

    return { subtotal, discountAmt, taxAmt, total, planName: selected?.dataset?.name || 'Custom Plan', price, qty };
  }

  planSelect?.addEventListener('change', calculateTotals);
  qtyInput?.addEventListener('input', calculateTotals);
  discountInput?.addEventListener('input', calculateTotals);
  taxRateInput?.addEventListener('input', calculateTotals);

  form?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const customerId = customerSelect?.value;
    if (!customerId) {
      if (errorDiv) { errorDiv.textContent = 'Please select a customer.'; errorDiv.classList.remove('hidden'); }
      return;
    }
    const { subtotal, discountAmt, taxAmt, total, planName, price, qty } = calculateTotals();
    const validUntil = document.querySelector('#quote-valid-until')?.value;
    const notes = document.querySelector('#quote-notes')?.value;

    const items = [{ name: planName, quantity: qty, unitPrice: price, total: price * qty }];

    try {
      await quotationService.create({
        customerId,
        items,
        discount: parseFloat(discountInput?.value || 0),
        taxRate: parseFloat(taxRateInput?.value || 0) / 100,
        validUntil,
        notes
      });
      toast.success('Quotation generated successfully!');
      modal?.classList.add('hidden');
      form.reset();
      const { Router } = await import('../router.js');
      new Router('#page-content').handleRoute();
    } catch (err) {
      if (errorDiv) { errorDiv.textContent = err.message; errorDiv.classList.remove('hidden'); }
    }
  });

  // Convert Quote to Subscription
  document.querySelectorAll('[data-action="convert-quote"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const confirmed = await confirmDialog({
        title: 'Convert Quotation to Subscription',
        message: 'Convert this quotation into an active subscription and generate the opening invoice?',
        confirmText: 'Convert & Activate'
      });
      if (!confirmed) return;
      try {
        btn.disabled = true;
        btn.innerHTML = '<span class="material-symbols-outlined text-[14px] animate-spin">refresh</span> Converting...';
        const res = await quotationService.convert(id);
        toast.success(res.message || 'Quotation converted successfully!');
        const { Router } = await import('../router.js');
        new Router('#page-content').handleRoute();
      } catch (err) {
        toast.error(err.message);
        btn.disabled = false;
        btn.innerHTML = '<span class="material-symbols-outlined text-[14px]">autorenew</span> Convert';
      }
    });
  });

  // Confirm Quote
  document.querySelectorAll('[data-action="confirm-quote"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      try {
        await quotationService.update(id, { status: 'confirmed' });
        toast.success('Quotation marked as Confirmed.');
        const { Router } = await import('../router.js');
        new Router('#page-content').handleRoute();
      } catch (err) {
        toast.error(err.message);
      }
    });
  });

  // Delete Quote
  document.querySelectorAll('[data-action="delete-quote"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const confirmed = await confirmDialog({
        title: 'Delete Quotation',
        message: 'Are you sure you want to delete this quotation?',
        confirmText: 'Delete',
        danger: true
      });
      if (!confirmed) return;
      try {
        await quotationService.delete(id);
        toast.success('Quotation deleted.');
        const { Router } = await import('../router.js');
        new Router('#page-content').handleRoute();
      } catch (err) {
        toast.error(err.message);
      }
    });
  });

  // Filter Tabs
  document.querySelectorAll('.quote-filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.quote-filter-tab').forEach(t => {
        t.className = 'quote-filter-tab px-3 py-1 rounded-md text-secondary hover:text-on-surface';
      });
      tab.className = 'quote-filter-tab px-3 py-1 rounded-md bg-surface-container-lowest text-primary shadow-sm font-bold';
      const status = tab.getAttribute('data-status');
      filterQuotes(status, document.querySelector('#quote-search-input')?.value || '');
    });
  });

  // Search input
  document.querySelector('#quote-search-input')?.addEventListener('input', (e) => {
    const activeTab = document.querySelector('.quote-filter-tab.text-primary')?.getAttribute('data-status') || 'all';
    filterQuotes(activeTab, e.target.value);
  });

  function filterQuotes(status, search) {
    const rows = document.querySelectorAll('#quotations-table-body tr');
    const s = search.toLowerCase();
    rows.forEach(r => {
      const text = r.innerText.toLowerCase();
      const matchesSearch = !s || text.includes(s);
      const matchesStatus = status === 'all' || text.includes(status);
      r.style.display = matchesSearch && matchesStatus ? '' : 'none';
    });
  }
});

