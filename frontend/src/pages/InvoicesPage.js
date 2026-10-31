/**
 * Invoices, Receipts & Global Collections Ledger Page View
 */

import { MetricCard } from '../components/metrics/MetricCard.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';

export async function InvoicesPage() {
  const invoices = [
    {
      id: 'INV-2024-8819',
      hash: '9b2d-114c',
      customer: 'OmniFlow Logistics',
      account: 'CUST-4481',
      plan: 'Enterprise Custom (Annual)',
      date: 'Oct 24, 2024 – Oct 24, 2025',
      amount: '$24,500.00',
      subtotal: '$22,685.19',
      tax: '$1,814.81',
      status: 'past_due'
    },
    {
      id: 'INV-2024-8818',
      hash: 'f4e8-89aa',
      customer: 'HyperScale Technologies',
      account: 'CUST-1049',
      plan: 'Dedicated Cloud Shard x3 (Monthly)',
      date: 'Oct 22, 2024 – Nov 22, 2024',
      amount: '$4,000.00',
      subtotal: '$3,703.70',
      tax: '$296.30',
      status: 'paid'
    },
    {
      id: 'INV-2024-8817',
      hash: 'c701-44bb',
      customer: 'CloudScale Systems',
      account: 'CUST-9214',
      plan: 'Scale Enterprise + Extra API',
      date: 'Oct 20, 2024 – Oct 20, 2025',
      amount: '$36,250.00',
      subtotal: '$33,564.81',
      tax: '$2,685.19',
      status: 'paid'
    },
    {
      id: 'INV-2024-8816',
      hash: '110f-28ee',
      customer: 'Apex Media Group',
      account: 'CUST-8821',
      plan: 'Growth Pro Annual License',
      date: 'Oct 18, 2024 – Oct 18, 2025',
      amount: '$11,247.18',
      subtotal: '$10,414.06',
      tax: '$833.12',
      status: 'paid'
    },
    {
      id: 'INV-2024-8815',
      hash: '78aa-0041',
      customer: 'Vanguard AI Labs',
      account: 'CUST-3310',
      plan: 'Metered LLM Ingestion True-Up',
      date: 'Oct 15, 2024 – Nov 15, 2024',
      amount: '$15,799.00',
      subtotal: 'Base: $799.00',
      tax: 'Usage: $15,000.00',
      status: 'pending'
    }
  ];

  return `
    <div class="flex flex-col w-full pb-12">
      <!-- Section Header -->
      <section class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">Invoices & Receipts</h1>
            ${Badge({ text: 'Automated Billing Active', variant: 'success', dot: true })}
          </div>
          <p class="font-body-md text-on-surface-variant mt-1">
            Manage recurring customer invoices, automated collections, credit notes, payment receipts, and tax reconciliation.
          </p>
        </div>

        <div class="flex items-center gap-2">
          ${Button({ label: 'Export Ledger (CSV / PDF)', icon: 'download', variant: 'secondary' })}
          ${Button({ label: 'Create Manual Invoice', icon: 'add', variant: 'primary' })}
        </div>
      </section>

      <!-- KPI Grid -->
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
          footerText: '<span>Due 1-14d: $24.4k</span><span class="text-secondary">Overdue: $24.5k</span>'
        })}

        ${MetricCard({
          title: 'Past Due / Dunning',
          value: '$24,500.00',
          delta: '3 Invoices At-Risk',
          deltaType: 'negative',
          footerText: '<span class="text-error font-semibold">OmniFlow Logistics (... Dunning)</span>'
        })}

        ${MetricCard({
          title: 'Net Tax Withheld',
          value: '$38,633.60',
          badgeText: 'Avalara Verified',
          footerText: '<span>Q4 Remittance: Scheduled</span><span class="text-tertiary font-semibold">Ledgers Balanced</span>'
        })}
      </section>

      <!-- Invoices Ledger Data Table -->
      <section class="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50 overflow-hidden">
        <div class="p-4 bg-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[20px]">receipt</span>
            <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">Billing Ledger (3,842 Invoices)</h2>
          </div>
          <div class="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search by invoice ID, customer..."
              class="bg-surface-container-lowest text-on-surface font-body-sm px-3 py-1.5 rounded-lg border border-outline-variant/30 text-[13px] focus:outline-none"
            />
            <button class="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface text-label-md font-semibold border border-outline-variant/30 shadow-sm">Filter</button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-container-low text-secondary font-label-sm uppercase tracking-wider text-[11px]">
                <th class="py-3 px-4 font-semibold">Invoice ID</th>
                <th class="py-3 px-4 font-semibold">Customer & Plan</th>
                <th class="py-3 px-4 font-semibold">Billing Window</th>
                <th class="py-3 px-4 font-semibold">Amount / Tax</th>
                <th class="py-3 px-4 font-semibold">Status</th>
                <th class="py-3 px-4 font-semibold text-right">Receipt</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-container text-body-sm text-on-surface">
              ${invoices.map(inv => `
                <tr class="hover:bg-surface-container-low/50 transition-colors">
                  <td class="py-3.5 px-4">
                    <div class="flex flex-col">
                      <span class="font-semibold text-primary font-caption-mono">${inv.id}</span>
                      <span class="font-caption-mono text-[10px] text-secondary">Hash: ${inv.hash}</span>
                    </div>
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="flex flex-col">
                      <span class="font-semibold text-on-surface">${inv.customer}</span>
                      <span class="text-caption-mono text-[11px] text-secondary">${inv.plan}</span>
                    </div>
                  </td>
                  <td class="py-3.5 px-4 text-secondary text-[12px] font-caption-mono">
                    ${inv.date}
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="flex flex-col">
                      <span class="font-bold tabular-nums">${inv.amount}</span>
                      <span class="text-caption-mono text-[10px] text-secondary">Sub: ${inv.subtotal}</span>
                    </div>
                  </td>
                  <td class="py-3.5 px-4">
                    ${inv.status === 'past_due'
                      ? Badge({ text: 'Past Due', variant: 'danger', dot: true })
                      : inv.status === 'paid'
                      ? Badge({ text: 'Paid', variant: 'success', dot: true })
                      : Badge({ text: 'Pending', variant: 'warning', dot: true })
                    }
                  </td>
                  <td class="py-3.5 px-4 text-right">
                    <button class="text-primary hover:underline font-semibold text-label-md">Download PDF</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

