/**
 * Invoices, Receipts & Global Collections Ledger Page View
 * High-fidelity implementation matching Brightloop Invoices & Receipts specs
 * Fully connected to real database invoices, real-time filtering, creation modal, and payment recording.
 */

import { MetricCard } from '../components/metrics/MetricCard.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';
import { invoiceService, customerService, paymentService } from '../services/api.js';
import { toast, confirmDialog, promptDialog } from '../components/common/Toast.js';

export async function InvoicesPage() {
  let invRes, custRes;
  try {
    [invRes, custRes] = await Promise.all([
      invoiceService.list({ limit: 100 }),
      customerService.list({ limit: 100 })
    ]);
  } catch (err) {
    return `<div class="p-6 text-error">Failed to load invoices: ${err.message}</div>`;
  }

  const invoices = invRes.data || [];
  const totals = invRes.totals || { collectedMtd: 0, receivables: 0, pastDue: 0, netTaxWithheld: 0 };
  const statusCounts = invRes.statusCounts || {};
  const customers = custRes.data || [];

  const formatCurrency = (n) => `$${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  const totalInvoices = invRes.total || invoices.length;
  const paidCount = statusCounts['paid'] || invoices.filter(i => i.status === 'paid').length;
  const pendingCount = statusCounts['pending'] || invoices.filter(i => i.status === 'pending').length;
  const pastDueCount = statusCounts['past_due'] || invoices.filter(i => i.status === 'past_due').length;
  const draftCount = statusCounts['draft'] || invoices.filter(i => i.status === 'draft').length;

  return `
    <div class="flex flex-col w-full pb-12 animate-fade-in">
      <!-- Section Header -->
      <section class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">Invoices & Receipts</h1>
            ${Badge({ text: 'Automated Billing Active', variant: 'success', dot: true })}
            <span class="px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-caption-mono text-caption-mono text-[11px] font-semibold">Stripe & NetSuite ERP Synced</span>
          </div>
          <p class="font-body-md text-on-surface-variant max-w-4xl mt-1">
            Manage recurring customer invoices, automated collections, credit notes, payment receipts, and tax reconciliation across global billing entities.
          </p>
        </div>

        <div class="flex items-center gap-2 flex-wrap shrink-0">
          <button id="btn-export-invoices-csv" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg font-label-md font-semibold text-[13px] transition-all">
            <span class="material-symbols-outlined text-[18px]">download</span>
            <span>Export Ledger (CSV)</span>
          </button>
          <button id="btn-open-create-invoice" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary-container text-on-primary rounded-lg shadow-sm font-label-md font-semibold text-[13px] transition-all">
            <span class="material-symbols-outlined text-[18px]">add</span>
            <span>+ Create Manual Invoice</span>
          </button>
        </div>
      </section>

      <!-- Top KPI Cards Grid -->
      <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        ${MetricCard({
          title: 'Total Collected (MTD)',
          value: formatCurrency(totals.collectedMtd),
          delta: '+12.4%',
          deltaType: 'positive',
          footerText: `<span>${paidCount} invoices settled</span><span class="text-tertiary font-medium">Reconciled</span>`
        })}

        ${MetricCard({
          title: 'Outstanding Receivables',
          value: formatCurrency(totals.receivables),
          badgeText: `${pendingCount + pastDueCount} Unpaid`,
          delta: `Pending: ${formatCurrency(totals.receivables - totals.pastDue)}`,
          deltaType: totals.receivables > 0 ? 'neutral' : 'positive',
          footerText: `<span class="text-secondary">Overdue: ${formatCurrency(totals.pastDue)}</span>`
        })}

        ${MetricCard({
          title: 'Past Due / Dunning',
          value: formatCurrency(totals.pastDue),
          delta: `${pastDueCount} Invoices At-Risk`,
          deltaType: totals.pastDue > 0 ? 'negative' : 'neutral',
          icon: 'warning',
          footerText: '<span class="text-error font-semibold">Smart Dunning Active</span>'
        })}

        ${MetricCard({
          title: 'Net Tax Withheld',
          value: formatCurrency(totals.netTaxWithheld),
          badgeText: 'Avalara Verified',
          delta: '8.0% Avg',
          deltaType: 'neutral',
          footerText: '<span>Q4 Remittance: Scheduled</span><span class="text-tertiary font-semibold">Ledgers Balanced</span>'
        })}
      </section>

      <!-- Invoices Ledger Section -->
      <section class="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50 overflow-hidden mb-6">
        <!-- Filter Tabs -->
        <div class="border-b border-surface-container/60 px-4 pt-3 flex items-center gap-2 overflow-x-auto">
          <button class="invoice-tab px-3.5 py-2 font-label-md font-semibold text-primary border-b-2 border-primary flex items-center gap-1.5 shrink-0" data-status="all">
            <span>All Invoices</span>
            <span class="px-1.5 py-0.2 rounded-full bg-primary/10 text-primary text-[10px] font-bold">${totalInvoices}</span>
          </button>
          <button class="invoice-tab px-3.5 py-2 font-label-md font-semibold text-secondary hover:text-on-surface flex items-center gap-1.5 shrink-0" data-status="paid">
            <span>Paid / Settled</span>
            <span class="px-1.5 py-0.2 rounded-full bg-surface-container text-secondary text-[10px]">${paidCount}</span>
          </button>
          <button class="invoice-tab px-3.5 py-2 font-label-md font-semibold text-secondary hover:text-on-surface flex items-center gap-1.5 shrink-0" data-status="pending">
            <span>Pending / Issued</span>
            <span class="px-1.5 py-0.2 rounded-full bg-surface-container text-secondary text-[10px]">${pendingCount}</span>
          </button>
          <button class="invoice-tab px-3.5 py-2 font-label-md font-semibold text-error hover:text-error/80 flex items-center gap-1.5 shrink-0" data-status="past_due">
            <span>Past Due / Overdue</span>
            <span class="px-1.5 py-0.2 rounded-full bg-error-container text-on-error-container text-[10px] font-bold">${pastDueCount}</span>
          </button>
          <button class="invoice-tab px-3.5 py-2 font-label-md font-semibold text-secondary hover:text-on-surface flex items-center gap-1.5 shrink-0" data-status="draft">
            <span>Drafts</span>
            <span class="px-1.5 py-0.2 rounded-full bg-surface-container text-secondary text-[10px]">${draftCount}</span>
          </button>
        </div>

        <!-- Filter and Search Toolbar -->
        <div class="p-4 bg-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div class="flex items-center gap-2 flex-1 max-w-md">
            <div class="relative w-full">
              <span class="material-symbols-outlined absolute left-3 top-2 text-[18px] text-on-surface-variant">search</span>
              <input
                id="invoice-search-input"
                type="text"
                placeholder="Search by invoice ID, customer name..."
                class="w-full bg-surface-container-lowest text-on-surface font-body-sm pl-9 pr-3 py-1.5 rounded-lg border border-surface-container text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-sm"
              />
            </div>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <select id="invoice-currency-filter" class="bg-surface-container-lowest text-on-surface font-label-md text-[12px] px-2.5 py-1.5 rounded-lg border border-surface-container shadow-sm focus:outline-none">
              <option value="all">All Currencies</option>
              <option value="USD">Currency: USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>

        <!-- High-Density Invoices Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-container-low text-secondary font-label-sm uppercase tracking-wider text-[11px]">
                <th class="py-3 px-4 font-semibold">Invoice ID</th>
                <th class="py-3 px-4 font-semibold">Customer</th>
                <th class="py-3 px-4 font-semibold">Subtotal</th>
                <th class="py-3 px-4 font-semibold">Tax</th>
                <th class="py-3 px-4 font-semibold">Total Amount</th>
                <th class="py-3 px-4 font-semibold">Status</th>
                <th class="py-3 px-4 font-semibold">Due Date</th>
                <th class="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody id="invoices-table-body" class="divide-y divide-surface-container text-body-sm text-on-surface">
              ${invoices.length === 0 ? `
                <tr>
                  <td colspan="8" class="py-12 text-center text-secondary text-[13px]">
                    <span class="material-symbols-outlined block text-[32px] mb-2 text-secondary/60">receipt_long</span>
                    No invoices recorded in database. Click <strong>+ Create Manual Invoice</strong> to issue one.
                  </td>
                </tr>
              ` : invoices.map(inv => {
                const isPaid = inv.status === 'paid';
                const isPast = inv.status === 'past_due';
                const isPending = inv.status === 'pending';
                return `
                  <tr class="hover:bg-surface-container-low/50 transition-colors" data-invoice-id="${inv.id}" data-status="${inv.status}">
                    <td class="py-3.5 px-4">
                      <div class="flex flex-col">
                        <span class="font-bold text-on-surface font-caption-mono text-[13px]">${inv.invoice_number || inv.id}</span>
                        <span class="text-[11px] text-secondary font-mono">${inv.payment_method || 'Stripe'}</span>
                      </div>
                    </td>
                    <td class="py-3.5 px-4">
                      <span class="font-semibold text-on-surface">${inv.customer_name || 'Customer'}</span>
                    </td>
                    <td class="py-3.5 px-4 tabular-nums text-secondary">
                      ${formatCurrency(inv.subtotal)}
                    </td>
                    <td class="py-3.5 px-4 tabular-nums text-secondary">
                      ${formatCurrency(inv.tax)}
                    </td>
                    <td class="py-3.5 px-4 tabular-nums font-bold text-on-surface">
                      ${formatCurrency(inv.total)}
                    </td>
                    <td class="py-3.5 px-4">
                      ${isPaid
                        ? Badge({ text: 'Paid', variant: 'success', dot: true })
                        : (isPast
                          ? Badge({ text: 'Past Due', variant: 'danger', dot: true })
                          : Badge({ text: 'Pending', variant: 'neutral' }))
                      }
                    </td>
                    <td class="py-3.5 px-4 text-secondary font-caption-mono text-[12px]">
                      ${formatDate(inv.due_date)}
                    </td>
                    <td class="py-3.5 px-4 text-right">
                      <div class="inline-flex items-center gap-1.5 justify-end">
                        ${!isPaid ? `
                          <button
                            data-action="record-payment"
                            data-id="${inv.id}"
                            data-amount="${inv.total}"
                            data-num="${inv.invoice_number || inv.id}"
                            class="px-2.5 py-1 bg-tertiary text-white rounded-lg text-[12px] font-semibold hover:bg-tertiary-container transition-all flex items-center gap-1 shadow-sm"
                            title="Record Payment"
                          >
                            <span class="material-symbols-outlined text-[14px]">paid</span>
                            Record Pay
                          </button>
                        ` : ''}
                        <button
                          data-action="print-invoice"
                          data-id="${inv.id}"
                          data-num="${inv.invoice_number || inv.id}"
                          data-customer="${inv.customer_name || 'Customer'}"
                          data-total="${inv.total}"
                          data-date="${inv.created_at}"
                          class="px-2.5 py-1 text-primary hover:bg-surface-container rounded-lg font-label-md font-semibold text-[12px] transition-colors flex items-center gap-1"
                        >
                          <span class="material-symbols-outlined text-[14px]">picture_as_pdf</span>
                          PDF
                        </button>
                        <button
                          data-action="delete-invoice"
                          data-id="${inv.id}"
                          ${isPaid ? 'disabled title="Paid invoices cannot be deleted"' : 'title="Delete Invoice"'}
                          class="p-1 rounded-lg text-secondary hover:text-error hover:bg-error-container/20 disabled:opacity-30 disabled:pointer-events-none transition-colors"
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

        <!-- Pagination info -->
        <div class="p-4 bg-surface-container-low flex items-center justify-between text-[13px] text-secondary">
          <span>Showing <strong>${invoices.length}</strong> of <strong>${totalInvoices}</strong> invoices</span>
          <span>Page 1 of ${invRes.totalPages || 1}</span>
        </div>
      </section>

      <!-- Bottom Dual Recovery & Tax Panels -->
      <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Card 1: Payment Recovery & Dunning Telemetry -->
        <div class="p-5 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-2">
              <span class="font-headline-sm text-[16px] font-bold text-on-surface">Payment Recovery & Dunning Telemetry</span>
              ${Badge({ text: 'ML Smart Retries Active', variant: 'success', dot: true })}
            </div>
            <p class="font-body-sm text-on-surface-variant text-[13px] mb-4">
              Adaptive retry engine evaluates optimal card processing windows and automated account updater feeds to minimize churn.
            </p>
            <div class="grid grid-cols-3 gap-3 p-3 rounded-xl bg-surface-container-low mb-3">
              <div>
                <span class="font-label-sm text-[10px] uppercase text-secondary font-semibold block">Recovered MTD</span>
                <span class="font-bold text-[18px] text-on-surface tabular-nums">$42,100.00</span>
              </div>
              <div>
                <span class="font-label-sm text-[10px] uppercase text-secondary font-semibold block">Recovery Rate</span>
                <span class="font-bold text-[18px] text-tertiary tabular-nums">84.2%</span>
              </div>
              <div>
                <span class="font-label-sm text-[10px] uppercase text-secondary font-semibold block">Next Scheduled</span>
                <span class="font-bold text-[14px] text-on-surface tabular-nums">Oct 30, 04:00Z</span>
              </div>
            </div>
          </div>
          <div class="pt-4 border-t border-surface-container/40 flex justify-between items-center text-[12px] mt-4">
            <a href="#payments-dunning" class="text-primary font-semibold hover:underline">Configure Dunning Cadence & Webhooks &rarr;</a>
            <span class="text-secondary font-caption-mono">Health: 99.98% OK</span>
          </div>
        </div>

        <!-- Card 2: Tax Compliance & Multi-Jurisdiction Ledger -->
        <div class="p-5 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-2">
              <span class="font-headline-sm text-[16px] font-bold text-on-surface">Tax Compliance & Multi-Jurisdiction Ledger</span>
              ${Badge({ text: 'AvaTax Synchronized', variant: 'info' })}
            </div>
            <p class="font-body-sm text-on-surface-variant text-[13px] mb-4">
              Automated sales tax, EU OSS VAT, and digital goods cross-border withholding calculations reconciled through Avalara.
            </p>
            <div class="space-y-2.5 mb-3 text-[13px]">
              <div class="flex items-center justify-between">
                <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-primary"></span> US State Sales Tax (42 Jurisdictions)</span>
                <span class="font-caption-mono font-bold">$28,450.00 <span class="text-tertiary font-medium">Remitted</span></span>
              </div>
              <div class="flex items-center justify-between">
                <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-secondary"></span> European Union (VAT One Stop Shop)</span>
                <span class="font-caption-mono font-bold">$6,840.00 <span class="text-secondary font-medium">Accruing</span></span>
              </div>
              <div class="flex items-center justify-between">
                <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-tertiary"></span> United Kingdom (HMRC VAT Scheme)</span>
                <span class="font-caption-mono font-bold">$3,343.60 <span class="text-tertiary font-medium">Remitted</span></span>
              </div>
            </div>
          </div>
          <div class="pt-4 border-t border-surface-container/40 flex justify-between items-center text-[12px] mt-4">
            <a href="#tax-ledgers" class="text-primary font-semibold hover:underline flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">menu_book</span>
              <span>View Tax Ledger</span>
            </a>
            <span class="text-tertiary font-semibold flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">verified</span> 100% Reconciled
            </span>
          </div>
        </div>
      </section>

      <!-- Create Invoice Modal -->
      <div id="create-invoice-modal" class="hidden fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
          <div class="px-6 py-4 border-b border-surface-container/60 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[22px]">receipt</span>
              <h3 class="font-bold text-[16px] text-on-surface">Issue Manual Invoice</h3>
            </div>
            <button id="close-invoice-modal" class="text-secondary hover:text-on-surface">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <form id="create-invoice-form" class="p-6 flex flex-col gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-[12px] font-semibold text-on-surface">Customer *</label>
              <select id="inv-customer" required class="px-3.5 py-2 border border-surface-container rounded-lg text-[13px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary">
                <option value="">Select Customer...</option>
                ${customers.map(c => `<option value="${c.id}">${c.name} (${c.id})</option>`).join('')}
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1.5">
                <label class="text-[12px] font-semibold text-on-surface">Subtotal Amount ($) *</label>
                <input id="inv-subtotal" type="number" min="1" step="0.01" required placeholder="1000.00" class="px-3.5 py-2 border border-surface-container rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-[12px] font-semibold text-on-surface">Tax Rate %</label>
                <input id="inv-tax-rate" type="number" min="0" max="50" step="0.5" value="8" class="px-3.5 py-2 border border-surface-container rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1.5">
                <label class="text-[12px] font-semibold text-on-surface">Due Date</label>
                <input id="inv-due-date" type="date" value="${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}" class="px-3.5 py-2 border border-surface-container rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-[12px] font-semibold text-on-surface">Payment Method</label>
                <select id="inv-payment-method" class="px-3.5 py-2 border border-surface-container rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary">
                  <option value="Credit Card (Stripe)">Credit Card (Stripe)</option>
                  <option value="Wire Transfer / ACH">Wire Transfer / ACH</option>
                  <option value="Account Balance / Credit">Account Balance / Credit</option>
                </select>
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-[12px] font-semibold text-on-surface">Notes / Memo</label>
              <textarea id="inv-notes" rows="2" placeholder="Itemized details, terms..." class="px-3.5 py-2 border border-surface-container rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"></textarea>
            </div>

            <div id="inv-form-error" class="hidden px-3.5 py-2 bg-error-container/20 border border-error/30 rounded-lg text-error text-[12px]"></div>

            <div class="flex gap-2 justify-end pt-2">
              <button type="button" id="cancel-invoice-modal" class="px-4 py-2 rounded-lg text-[13px] font-semibold text-on-surface hover:bg-surface-container transition-colors">Cancel</button>
              <button type="submit" id="submit-invoice-btn" class="px-4 py-2 rounded-lg text-[13px] font-semibold bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-sm">
                <span class="material-symbols-outlined text-[16px]">send</span>
                <span>Issue Invoice</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

// Interactive handlers for InvoicesPage
document.addEventListener('page:rendered', (e) => {
  if (e.detail.route !== 'invoices-receipts') return;

  const modal = document.querySelector('#create-invoice-modal');
  const openBtn = document.querySelector('#btn-open-create-invoice');
  const closeBtn = document.querySelector('#close-invoice-modal');
  const cancelBtn = document.querySelector('#cancel-invoice-modal');
  const form = document.querySelector('#create-invoice-form');
  const errorDiv = document.querySelector('#inv-form-error');

  openBtn?.addEventListener('click', () => modal?.classList.remove('hidden'));
  closeBtn?.addEventListener('click', () => modal?.classList.add('hidden'));
  cancelBtn?.addEventListener('click', () => modal?.classList.add('hidden'));

  // Create invoice form submit
  form?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const customerId = document.querySelector('#inv-customer')?.value;
    const subtotal = parseFloat(document.querySelector('#inv-subtotal')?.value || 0);
    const taxRate = parseFloat(document.querySelector('#inv-tax-rate')?.value || 0) / 100;
    const dueDate = document.querySelector('#inv-due-date')?.value;
    const paymentMethod = document.querySelector('#inv-payment-method')?.value;
    const notes = document.querySelector('#inv-notes')?.value;

    if (!customerId || !subtotal) {
      if (errorDiv) { errorDiv.textContent = 'Customer and Subtotal are required.'; errorDiv.classList.remove('hidden'); }
      return;
    }

    try {
      await invoiceService.create({ customerId, subtotal, taxRate, dueDate, paymentMethod, notes, status: 'pending' });
      toast.success('Invoice issued successfully!');
      modal?.classList.add('hidden');
      form.reset();
      const { Router } = await import('../router.js');
      new Router('#page-content').handleRoute();
    } catch (err) {
      if (errorDiv) { errorDiv.textContent = err.message; errorDiv.classList.remove('hidden'); }
    }
  });

  // Filter tabs
  document.querySelectorAll('.invoice-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.invoice-tab').forEach(t => {
        t.className = 'invoice-tab px-3.5 py-2 font-label-md font-semibold text-secondary hover:text-on-surface flex items-center gap-1.5 shrink-0';
      });
      tab.className = 'invoice-tab px-3.5 py-2 font-label-md font-semibold text-primary border-b-2 border-primary flex items-center gap-1.5 shrink-0';
      const status = tab.getAttribute('data-status');
      filterInvoices(status, document.querySelector('#invoice-search-input')?.value || '');
    });
  });

  // Search input
  document.querySelector('#invoice-search-input')?.addEventListener('input', (ev) => {
    const activeTab = document.querySelector('.invoice-tab.text-primary')?.getAttribute('data-status') || 'all';
    filterInvoices(activeTab, ev.target.value);
  });

  function filterInvoices(status, search) {
    const rows = document.querySelectorAll('#invoices-table-body tr');
    const s = search.toLowerCase();
    rows.forEach(r => {
      const text = r.innerText.toLowerCase();
      const rowStatus = r.getAttribute('data-status');
      const matchesSearch = !s || text.includes(s);
      const matchesStatus = status === 'all' || rowStatus === status;
      r.style.display = matchesSearch && matchesStatus ? '' : 'none';
    });
  }

  // Record Payment Action
  document.querySelectorAll('[data-action="record-payment"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const invoiceId = btn.getAttribute('data-id');
      const amount = btn.getAttribute('data-amount');
      const invoiceNum = btn.getAttribute('data-num');

      const confirmed = await confirmDialog({
        title: `Record Payment for ${invoiceNum}`,
        message: `Confirm manual payment receipt of $${parseFloat(amount).toFixed(2)}? This will reconcile the invoice and update the ledger.`,
        confirmText: 'Confirm Payment'
      });
      if (!confirmed) return;

      try {
        btn.disabled = true;
        const res = await paymentService.record({ invoiceId, amount: parseFloat(amount), method: 'manual_reconciliation' });
        toast.success(res.message || 'Payment recorded successfully.');
        const { Router } = await import('../router.js');
        new Router('#page-content').handleRoute();
      } catch (err) {
        toast.error(err.message);
        btn.disabled = false;
      }
    });
  });

  // Print/Download PDF action
  document.querySelectorAll('[data-action="print-invoice"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const num = btn.getAttribute('data-num');
      const cust = btn.getAttribute('data-customer');
      const tot = btn.getAttribute('data-total');
      const dt = btn.getAttribute('data-date');

      const printWin = window.open('', '_blank', 'width=800,height=600');
      printWin.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice ${num}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0b1c30; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #004ac6; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #004ac6; }
            .inv-num { font-size: 20px; font-weight: bold; margin-top: 10px; }
            .section { margin: 30px 0; }
            .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
            th, td { border: 1px solid #e5eeff; padding: 12px; text-align: left; }
            th { background: #eff4ff; color: #565e74; }
            .total-row { font-weight: bold; font-size: 16px; background: #eff4ff; }
            .footer { margin-top: 50px; font-size: 12px; color: #565e74; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">Brightloop Software Inc.</div>
              <p>Enterprise Subscription & Billing Management</p>
            </div>
            <div style="text-align: right;">
              <div class="inv-num">${num}</div>
              <p>Date: ${new Date(dt).toLocaleDateString()}</p>
            </div>
          </div>
          <div class="section meta">
            <div>
              <strong>Billed To:</strong>
              <p>${cust}</p>
            </div>
            <div>
              <strong>Remittance Entity:</strong>
              <p>Brightloop Enterprise Services LLC<br/>742 Market Street, San Francisco, CA</p>
            </div>
          </div>
          <table>
            <thead>
              <tr><th>Description</th><th>Qty</th><th>Amount</th></tr>
            </thead>
            <tbody>
              <tr><td>SaaS Subscription License & Entitlements</td><td>1</td><td>$${parseFloat(tot).toFixed(2)}</td></tr>
              <tr class="total-row"><td colspan="2" style="text-align: right;">Total Amount Due:</td><td>$${parseFloat(tot).toFixed(2)} USD</td></tr>
            </tbody>
          </table>
          <div class="footer">
            Thank you for partnering with Brightloop. For inquiries: billing@brightloop.io
          </div>
          <script>window.print();</script>
        </body>
        </html>
      `);
      printWin.document.close();
    });
  });

  // Delete Invoice Action
  document.querySelectorAll('[data-action="delete-invoice"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const confirmed = await confirmDialog({
        title: 'Delete Invoice',
        message: 'Are you sure you want to delete this invoice record?',
        confirmText: 'Delete',
        danger: true
      });
      if (!confirmed) return;
      try {
        await invoiceService.delete(id);
        toast.success('Invoice deleted.');
        const { Router } = await import('../router.js');
        new Router('#page-content').handleRoute();
      } catch (err) {
        toast.error(err.message);
      }
    });
  });

  // Export CSV
  document.querySelector('#btn-export-invoices-csv')?.addEventListener('click', async () => {
    try {
      const res = await invoiceService.list({ limit: 1000 });
      const rows = res.data || [];
      const headers = ['Invoice #', 'Customer', 'Subtotal', 'Tax', 'Total', 'Status', 'Due Date', 'Payment Method'];
      const csvRows = rows.map(r => [
        r.invoice_number || r.id,
        `"${(r.customer_name || '').replace(/"/g, '""')}"`,
        r.subtotal,
        r.tax,
        r.total,
        r.status,
        r.due_date || '',
        `"${(r.payment_method || '').replace(/"/g, '""')}"`
      ]);
      const csv = [headers.join(','), ...csvRows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoices_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Invoices CSV exported.');
    } catch (err) {
      toast.error(err.message);
    }
  });
});
