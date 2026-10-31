/**
 * Invoices, Receipts & Global Collections Ledger Page View
 * High-fidelity implementation matching Brightloop Invoices & Receipts specs
 */

import { MetricCard } from '../components/metrics/MetricCard.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';
import { invoiceService } from '../services/api.js';

export async function InvoicesPage() {
  const invoices = await invoiceService.list();

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
          ${Button({ label: 'Export Ledger (CSV / PDF)', icon: 'download', variant: 'secondary' })}
          ${Button({ label: 'Batch Actions', icon: 'checklist', variant: 'secondary' })}
          ${Button({ label: '+ Create Manual Invoice', icon: 'add', variant: 'primary' })}
        </div>
      </section>

      <!-- Top KPI Cards Grid -->
      <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        ${MetricCard({
          title: 'Total Collected (MTD)',
          value: '$482,920.00',
          delta: '+12.4%',
          deltaType: 'positive',
          footerText: '<span>1,420 invoices settled</span><span class="text-secondary font-medium">vs $429.6k last mo</span>'
        })}

        ${MetricCard({
          title: 'Outstanding Receivables',
          value: '$48,900.00',
          badgeText: '18 Unpaid',
          delta: 'Due 1-14d: $24.4k',
          deltaType: 'neutral',
          footerText: '<span class="text-secondary">Overdue: $24.5k</span><span class="text-error font-medium">Action Pending</span>'
        })}

        ${MetricCard({
          title: 'Past Due / Dunning',
          value: '$24,500.00',
          delta: '3 Invoices At-Risk',
          deltaType: 'negative',
          icon: 'warning',
          footerText: '<span class="text-error font-semibold">OmniFlow Logistics (... Dunning)</span>'
        })}

        ${MetricCard({
          title: 'Net Tax Withheld',
          value: '$38,633.60',
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
          <button class="px-3.5 py-2 font-label-md font-semibold text-primary border-b-2 border-primary flex items-center gap-1.5 shrink-0">
            <span>All Invoices</span>
            <span class="px-1.5 py-0.2 rounded-full bg-primary/10 text-primary text-[10px] font-bold">3,842</span>
          </button>
          <button class="px-3.5 py-2 font-label-md font-semibold text-secondary hover:text-on-surface flex items-center gap-1.5 shrink-0">
            <span>Paid / Settled</span>
            <span class="px-1.5 py-0.2 rounded-full bg-surface-container text-secondary text-[10px]">3,780</span>
          </button>
          <button class="px-3.5 py-2 font-label-md font-semibold text-secondary hover:text-on-surface flex items-center gap-1.5 shrink-0">
            <span>Pending / Issued</span>
            <span class="px-1.5 py-0.2 rounded-full bg-surface-container text-secondary text-[10px]">41</span>
          </button>
          <button class="px-3.5 py-2 font-label-md font-semibold text-error hover:text-error/80 flex items-center gap-1.5 shrink-0">
            <span>Past Due / Overdue</span>
            <span class="px-1.5 py-0.2 rounded-full bg-error-container text-on-error-container text-[10px] font-bold">18</span>
          </button>
          <button class="px-3.5 py-2 font-label-md font-semibold text-secondary hover:text-on-surface flex items-center gap-1.5 shrink-0">
            <span>Drafts</span>
            <span class="px-1.5 py-0.2 rounded-full bg-surface-container text-secondary text-[10px]">3</span>
          </button>
          <button class="px-3.5 py-2 font-label-md font-semibold text-secondary hover:text-on-surface flex items-center gap-1.5 shrink-0">
            <span>Credit Notes & Refunds</span>
            <span class="px-1.5 py-0.2 rounded-full bg-surface-container text-secondary text-[10px]">12</span>
          </button>
        </div>

        <!-- Filter and Search Toolbar -->
        <div class="p-4 bg-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div class="flex items-center gap-2 flex-1 max-w-md">
            <div class="relative w-full">
              <span class="material-symbols-outlined absolute left-3 top-2 text-[18px] text-on-surface-variant">search</span>
              <input
                type="text"
                placeholder="Search by invoice ID, customer name (⌘K)..."
                class="w-full bg-surface-container-lowest text-on-surface font-body-sm pl-9 pr-3 py-1.5 rounded-lg border border-outline-variant/30 text-[13px] focus:outline-none shadow-sm"
              />
            </div>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <select class="bg-surface-container-lowest text-on-surface font-label-md text-[12px] px-2.5 py-1.5 rounded-lg border border-outline-variant/30 shadow-sm focus:outline-none">
              <option>Date: Last 30 Days (Oct 1 – Oct 31)</option>
              <option>Last Quarter (Q3 2024)</option>
              <option>Year to Date (YTD 2024)</option>
            </select>
            <select class="bg-surface-container-lowest text-on-surface font-label-md text-[12px] px-2.5 py-1.5 rounded-lg border border-outline-variant/30 shadow-sm focus:outline-none">
              <option>Currency: USD ($)</option>
              <option>EUR (€)</option>
              <option>GBP (£)</option>
            </select>
            <select class="bg-surface-container-lowest text-on-surface font-label-md text-[12px] px-2.5 py-1.5 rounded-lg border border-outline-variant/30 shadow-sm focus:outline-none">
              <option>All Payment Methods</option>
              <option>Credit Card (Stripe)</option>
              <option>ACH / Wire Transfer</option>
            </select>
          </div>
        </div>

        <!-- High-Density Invoices Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-container-low text-secondary font-label-sm uppercase tracking-wider text-[11px]">
                <th class="py-3 px-4 font-semibold w-10"><input type="checkbox" class="rounded border-outline-variant/40" /></th>
                <th class="py-3 px-4 font-semibold">Invoice ID</th>
                <th class="py-3 px-4 font-semibold">Customer & Plan</th>
                <th class="py-3 px-4 font-semibold">Amount / Tax Breakdown</th>
                <th class="py-3 px-4 font-semibold">Status</th>
                <th class="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-container text-body-sm text-on-surface">
              ${invoices.map(inv => `
                <tr class="hover:bg-surface-container-low/50 transition-colors">
                  <td class="py-3.5 px-4"><input type="checkbox" class="rounded border-outline-variant/40" /></td>
                  <td class="py-3.5 px-4">
                    <div class="flex flex-col">
                      <span class="font-semibold text-primary font-caption-mono hover:underline cursor-pointer">${inv.id}</span>
                      <span class="font-caption-mono text-[10px] text-secondary">Hash: ${inv.hash}</span>
                    </div>
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="flex flex-col">
                      <div class="flex items-center gap-1.5">
                        <span class="font-semibold text-on-surface">${inv.customer}</span>
                        <span class="px-1.5 py-0.2 rounded bg-surface-container font-caption-mono text-[10px] text-secondary">${inv.account}</span>
                      </div>
                      <span class="text-caption-mono text-[11px] text-secondary mt-0.5">${inv.plan} · ${inv.date}</span>
                    </div>
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="flex flex-col">
                      <span class="font-bold tabular-nums text-[14px] ${inv.status === 'credit' ? 'text-primary' : ''}">${inv.amount}</span>
                      <span class="text-caption-mono text-[10px] text-secondary">Subtotal: ${inv.subtotal} · Tax: ${inv.tax}</span>
                    </div>
                  </td>
                  <td class="py-3.5 px-4">
                    ${inv.status === 'past_due'
                      ? Badge({ text: 'Past Due', variant: 'danger', dot: true })
                      : inv.status === 'paid'
                      ? Badge({ text: 'Paid', variant: 'success', dot: true })
                      : inv.status === 'credit'
                      ? Badge({ text: 'Credit Memo', variant: 'info' })
                      : Badge({ text: 'Pending', variant: 'warning', dot: true })
                    }
                  </td>
                  <td class="py-3.5 px-4 text-right">
                    <div class="inline-flex items-center gap-1">
                      <button class="px-2.5 py-1 text-primary hover:bg-surface-container rounded font-label-md font-semibold transition-colors">Download PDF</button>
                      <button class="p-1 text-secondary hover:text-on-surface hover:bg-surface-container rounded transition-colors"><span class="material-symbols-outlined text-[18px]">more_vert</span></button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="p-4 bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px] text-secondary">
          <span>Showing <strong>1 to 6</strong> of <strong>3,842</strong> invoices (Rows: 10)</span>
          <div class="flex items-center gap-1">
            <button class="px-2.5 py-1 rounded bg-surface-container-lowest text-secondary shadow-sm">&lt;</button>
            <button class="px-2.5 py-1 rounded bg-primary text-on-primary font-bold shadow-sm">1</button>
            <button class="px-2.5 py-1 rounded bg-surface-container-lowest text-on-surface shadow-sm">2</button>
            <button class="px-2.5 py-1 rounded bg-surface-container-lowest text-on-surface shadow-sm">3</button>
            <span class="px-1">...</span>
            <button class="px-2.5 py-1 rounded bg-surface-container-lowest text-on-surface shadow-sm">385</button>
            <button class="px-2.5 py-1 rounded bg-surface-container-lowest text-secondary shadow-sm">&gt;</button>
          </div>
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
            <div class="p-3 rounded-lg border border-surface-container flex items-center justify-between text-[12px]">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[18px]">autorenew</span>
                <span>OmniFlow Logistics (INV-2024-8819): Card Updater check verified · Retry #3 queued</span>
              </div>
              <button class="text-primary font-semibold hover:underline shrink-0">Adjust Cadence</button>
            </div>
          </div>
          <div class="pt-4 border-t border-surface-container/40 flex justify-between items-center text-[12px] mt-4">
            <a href="#payments-dunning" class="text-primary font-semibold hover:underline">Configure Dunning Cadence & Webhooks &rarr;</a>
            <span class="text-secondary font-caption-mono">Webhook health: 99.98% OK</span>
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
              <span class="material-symbols-outlined text-[16px]">download</span>
              <span>Download GAAP Summary (Q4)</span>
            </a>
            <span class="text-tertiary font-semibold flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">verified</span> 100% Reconciled
            </span>
          </div>
        </div>
      </section>
    </div>
  `;
}
