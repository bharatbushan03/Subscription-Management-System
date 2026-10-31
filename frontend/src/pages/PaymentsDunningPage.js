/**
 * Payments & Dunning Operations Page View
 * High-fidelity implementation for Smart Dunning, card updater & failed collections
 */

import { MetricCard } from '../components/metrics/MetricCard.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';

export async function PaymentsDunningPage() {
  const dunningQueue = [
    {
      invoiceId: 'INV-2024-8819',
      customer: 'OmniFlow Logistics',
      amount: '$24,500.00',
      attempt: 'Retry #2 Failed',
      nextRetry: 'Oct 30, 2024 (04:00Z)',
      error: '2004 - Insufficient Funds',
      action: 'Launch Playbook',
      status: 'critical'
    },
    {
      invoiceId: 'INV-2024-8830',
      customer: 'Apex Media Group',
      amount: '$1,850.00',
      attempt: 'Retry #1 Scheduled',
      nextRetry: 'Oct 31, 2024 (11:00Z)',
      error: '1002 - Card Expired',
      action: 'Card Updater Sync',
      status: 'warning'
    },
    {
      invoiceId: 'INV-2024-8812',
      customer: 'CloudScale Systems',
      amount: '$4,200.00',
      attempt: 'Recovered (Auto)',
      nextRetry: 'Settled',
      error: 'Smart Retry Succeeded',
      action: 'View Receipt',
      status: 'success'
    }
  ];

  return `
    <div class="flex flex-col w-full pb-12 animate-fade-in">
      <!-- Section Header -->
      <section class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">Payments Recovery & Dunning Cadence</h1>
            ${Badge({ text: 'ML Smart Retries Active', variant: 'success', dot: true })}
            <span class="px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-caption-mono text-caption-mono text-[11px] font-semibold">Payment records synced</span>
          </div>
          <p class="font-body-md text-on-surface-variant max-w-4xl mt-1">
            Configure automated retry schedules, multi-channel dunning communication rules, card updater hooks, and involuntary churn mitigation playbooks.
          </p>
        </div>

        <div class="flex items-center gap-2 flex-wrap shrink-0">
          ${Button({ label: 'Dunning Settings & Cadence', icon: 'tune', variant: 'secondary' })}
          ${Button({ label: '+ Ad-hoc Retry Trigger', icon: 'refresh', variant: 'primary' })}
        </div>
      </section>

      <!-- KPI Grid -->
      <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        ${MetricCard({
          title: 'Total Recovered MTD',
          value: '$42,100.00',
          delta: '+18.4% vs Manual',
          deltaType: 'positive',
          footerText: '<span>14 Invoices Saved</span>'
        })}

        ${MetricCard({
          title: 'Recovery Success Rate',
          value: '84.2%',
          delta: '+4.2% ML Optimization',
          deltaType: 'positive',
          progress: 84,
          footerText: '<span>Optimal Retry Window: 04:00Z</span>'
        })}

        ${MetricCard({
          title: 'Active At-Risk Queue',
          value: '$26,350.00',
          badgeText: '2 Invoices',
          delta: 'OmniFlow & Apex',
          deltaType: 'negative',
          footerText: '<span class="text-error font-semibold">Code 2004 Escalation</span>'
        })}

        ${MetricCard({
          title: 'Account Updater Matches',
          value: '38 Cards',
          badgeText: 'Visa & AMEX VAU',
          delta: 'Zero Interruption',
          deltaType: 'positive',
          footerText: '<span>Auto-Replaced Before Expiry</span>'
        })}
      </section>

      <!-- Dunning Queue Table -->
      <section class="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50 overflow-hidden mb-6">
        <div class="p-4 bg-surface-container-low flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[20px]">schedule</span>
            <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">Active Dunning & Recovery Queue</h2>
          </div>
          <span class="text-caption-mono text-[12px] text-secondary">Displaying Real-Time Payment Intents</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-container-low text-secondary font-label-sm uppercase tracking-wider text-[11px]">
                <th class="py-3 px-4 font-semibold">Invoice & Account</th>
                <th class="py-3 px-4 font-semibold">Amount</th>
                <th class="py-3 px-4 font-semibold">Retry Cadence State</th>
                <th class="py-3 px-4 font-semibold">Next Scheduled Window</th>
                <th class="py-3 px-4 font-semibold">Decline Code / Reason</th>
                <th class="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-container text-body-sm text-on-surface">
              ${dunningQueue.map(item => `
                <tr class="hover:bg-surface-container-low/50 transition-colors">
                  <td class="py-3.5 px-4">
                    <div class="flex flex-col">
                      <span class="font-semibold text-primary font-caption-mono">${item.invoiceId}</span>
                      <span class="text-caption-mono text-[11px] text-secondary">${item.customer}</span>
                    </div>
                  </td>
                  <td class="py-3.5 px-4 font-bold tabular-nums">${item.amount}</td>
                  <td class="py-3.5 px-4">
                    ${item.status === 'critical'
                      ? Badge({ text: item.attempt, variant: 'danger', dot: true })
                      : item.status === 'warning'
                      ? Badge({ text: item.attempt, variant: 'warning', dot: true })
                      : Badge({ text: item.attempt, variant: 'success', dot: true })
                    }
                  </td>
                  <td class="py-3.5 px-4 text-secondary font-caption-mono text-[12px]">${item.nextRetry}</td>
                  <td class="py-3.5 px-4 text-secondary text-[12px] font-caption-mono">${item.error}</td>
                  <td class="py-3.5 px-4 text-right">
                    <button class="px-3 py-1 rounded bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-[12px] font-semibold transition-colors">
                      ${item.action}
                    </button>
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
