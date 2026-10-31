/**
 * Customer 360 & Lifecycle Detail Page View
 */

import { MetricCard } from '../components/metrics/MetricCard.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';
import { customerService } from '../services/api.js';

export async function CustomersPage() {
  const customers = await customerService.list();

  return `
    <div class="flex flex-col w-full pb-12">
      <!-- Account Header Banner -->
      <section class="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-surface-container/50 mb-6">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div class="flex items-start gap-4">
            <div class="w-14 h-14 rounded-xl bg-primary text-on-primary font-headline-md text-headline-md font-bold flex items-center justify-center shrink-0">
              OF
            </div>
            <div class="flex flex-col">
              <div class="flex items-center gap-2 flex-wrap">
                <h1 class="font-headline-lg text-headline-lg font-bold text-on-surface">OmniFlow Logistics</h1>
                <span class="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-caption-mono text-caption-mono text-[11px]">CUST-4481</span>
                ${Badge({ text: 'Enterprise Custom', variant: 'info' })}
                ${Badge({ text: '64% · At Risk (Dunning Escalation)', variant: 'danger', dot: true })}
              </div>
              <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption-mono text-[12px] text-secondary mt-1">
                <span>Freight & Supply Chain Tech</span>
                <span>·</span>
                <span>Region: US-East-1</span>
                <span>·</span>
                <span>Customer Since: Oct 2022 (2y tenure)</span>
                <span>·</span>
                <span class="font-semibold text-on-surface">Net ARR: $24,500.00</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            ${Button({ label: 'Log Activity', icon: 'edit_note', variant: 'secondary' })}
            ${Button({ label: 'Send Statement', icon: 'mail', variant: 'secondary' })}
            ${Button({ label: 'Create Add-on', icon: 'add_circle', variant: 'primary' })}
          </div>
        </div>
      </section>

      <!-- Account KPIs -->
      <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        ${MetricCard({
          title: 'Total Lifetime Value (LTV)',
          value: '$68,600.00',
          delta: '+18.4% Expansion',
          deltaType: 'positive',
          icon: 'payments'
        })}

        ${MetricCard({
          title: 'Active Subscriptions',
          value: '1 Active',
          subvalue: '(1 Overdue)',
          delta: '$24,500/yr in retry',
          deltaType: 'negative',
          icon: 'cached'
        })}

        ${MetricCard({
          title: 'Account Health Score',
          value: '64',
          subvalue: '/ 100',
          delta: 'Gateway Code 2004',
          deltaType: 'negative',
          progress: 64,
          footerText: '<span>At-Risk Threshold: &lt;70</span>'
        })}

        ${MetricCard({
          title: 'Outstanding Balance',
          value: '$24,500.00',
          delta: '3 Days Overdue',
          deltaType: 'negative',
          icon: 'priority_high'
        })}
      </section>

      <!-- Payment Alert Box -->
      <div class="p-4 rounded-xl bg-error-container/20 border border-error-container flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div class="flex items-start gap-3">
          <span class="material-symbols-outlined text-error text-[24px] mt-0.5">credit_card_off</span>
          <div class="flex flex-col">
            <div class="flex items-center gap-2">
              <span class="font-headline-sm text-[16px] font-bold text-on-surface">Payment Renewal Overdue — $24,500.00</span>
              <span class="px-2 py-0.2 rounded-full bg-error text-on-error font-caption-mono text-[10px] font-bold">RETRY #2 FAILED</span>
            </div>
            <p class="font-body-sm text-on-surface-variant text-[13px] mt-0.5">
              Automated renewal failed on AMEX •••• 1009 with Gateway Error Code 2004 (Insufficient Funds). Smart Dunning retry #3 scheduled for <strong>Oct 30, 2024 at 04:00 AM UTC</strong>.
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          ${Button({ label: 'Launch Dunning Playbook', icon: 'play_arrow', variant: 'primary', size: 'sm' })}
          ${Button({ label: 'Send Direct Payment Link', icon: 'link', variant: 'secondary', size: 'sm' })}
        </div>
      </div>

      <!-- Customer Directory Table -->
      <section class="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50 overflow-hidden">
        <div class="p-4 bg-surface-container-low flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-secondary text-[20px]">groups</span>
            <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">Enterprise Accounts Directory</h2>
          </div>
          <span class="text-caption-mono text-[12px] text-secondary">Showing 4 Flagged Accounts</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-container-low text-secondary font-label-sm uppercase tracking-wider text-[11px]">
                <th class="py-3 px-4 font-semibold">Account & Identifier</th>
                <th class="py-3 px-4 font-semibold">Plan Tier</th>
                <th class="py-3 px-4 font-semibold">Lifetime Value</th>
                <th class="py-3 px-4 font-semibold">Health Score</th>
                <th class="py-3 px-4 font-semibold">Assigned CSM</th>
                <th class="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-container text-body-sm text-on-surface">
              ${customers.map(c => `
                <tr class="hover:bg-surface-container-low/50 transition-colors">
                  <td class="py-3.5 px-4">
                    <div class="flex flex-col">
                      <span class="font-semibold text-on-surface">${c.name}</span>
                      <span class="font-caption-mono text-[11px] text-secondary">${c.id}</span>
                    </div>
                  </td>
                  <td class="py-3.5 px-4 font-medium">${c.tier}</td>
                  <td class="py-3.5 px-4 tabular-nums font-semibold">${c.ltv}</td>
                  <td class="py-3.5 px-4">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-caption-mono text-[12px] font-bold ${
                      c.healthScore >= 70 ? 'bg-tertiary-container/10 text-tertiary' : c.healthScore >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-error-container text-on-error-container'
                    }">
                      ${c.healthScore} / 100
                    </span>
                  </td>
                  <td class="py-3.5 px-4 text-secondary">${c.csm}</td>
                  <td class="py-3.5 px-4 text-right">
                    <a href="#customers" class="text-primary hover:underline font-semibold text-label-md">Open 360</a>
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

