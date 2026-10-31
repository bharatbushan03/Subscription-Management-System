/**
 * Executive Dashboard Page View
 */

import { MetricCard } from '../components/metrics/MetricCard.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';
import { analyticsService, subscriptionService } from '../services/api.js';

export async function DashboardPage() {
  const analytics = await analyticsService.getOverview();
  const subscriptions = await subscriptionService.list();

  return `
    <div class="flex flex-col w-full pb-12">
      <!-- Title & Action Bar -->
      <section class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">Executive Telemetry</h1>
            ${Badge({ text: 'Real-Time Sync', variant: 'success', dot: true })}
            <span class="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-caption-mono text-caption-mono text-[11px]">ASC 606 Compliant</span>
          </div>
          <p class="font-body-md text-on-surface-variant mt-1">
            Real-time monthly recurring revenue velocity, plan distribution cohorts, and live billing telemetry.
          </p>
        </div>

        <div class="flex items-center gap-2">
          ${Button({ label: 'Export Telemetry', icon: 'download', variant: 'secondary' })}
          ${Button({ label: 'Create Plan', icon: 'add', variant: 'primary' })}
        </div>
      </section>

      <!-- KPI Cards Grid -->
      <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        ${MetricCard({
          title: 'Monthly Recurring Revenue (MRR)',
          value: analytics.mrr.formatted,
          delta: '+14.8%',
          deltaType: 'positive',
          progress: 78,
          footerText: '<span>vs $112,000 last month</span><span class="text-tertiary font-semibold">ARR: ' + analytics.arr.formatted + '</span>'
        })}

        ${MetricCard({
          title: 'Active Subscriptions',
          value: analytics.mrr.activeSubscriptions.toLocaleString(),
          subvalue: 'seats',
          delta: '+34 new',
          deltaType: 'positive',
          icon: 'autorenew',
          footerText: '<span>98.2% Auto-renewal</span><span class="text-primary font-semibold">94 Enterprise</span>'
        })}

        ${MetricCard({
          title: 'Gross Logo Churn Rate',
          value: analytics.churn.ratePercent + '%',
          subvalue: '/ mo',
          delta: '-0.15%',
          deltaType: 'positive',
          badgeText: 'Net Retention: ' + analytics.churn.netRetention + '%',
          footerText: '<span>At-Risk ARR Exposure:</span><span class="text-error font-semibold">' + analytics.churn.atRiskExposure + '</span>'
        })}

        ${MetricCard({
          title: 'Outstanding Receivables',
          value: '$' + analytics.receivables.outstanding.toLocaleString(),
          delta: '3 Overdue',
          deltaType: 'negative',
          icon: 'account_balance_wallet',
          footerText: '<span>Settled MTD:</span><span class="text-tertiary font-semibold">$' + analytics.receivables.settledMTD.toLocaleString() + '</span>'
        })}
      </section>

      <!-- Main Two-Column Analytics & Subscriptions Section -->
      <section class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Subscriptions Table (8 cols) -->
        <div class="lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50 overflow-hidden">
          <div class="p-4 bg-surface-container-low flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[20px]">subscriptions</span>
              <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">Recent Subscription Cohorts</h2>
            </div>
            <a href="#customers" class="text-label-md text-primary font-semibold hover:underline">View All Customers &rarr;</a>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-surface-container-low text-secondary font-label-sm uppercase tracking-wider text-[11px]">
                  <th class="py-3 px-4 font-semibold">Subscription & Customer</th>
                  <th class="py-3 px-4 font-semibold">Plan Tier</th>
                  <th class="py-3 px-4 font-semibold">MRR Value</th>
                  <th class="py-3 px-4 font-semibold">Cadence</th>
                  <th class="py-3 px-4 font-semibold">Billing Health</th>
                  <th class="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-surface-container text-body-sm text-on-surface">
                ${subscriptions.map(sub => `
                  <tr class="hover:bg-surface-container-low/50 transition-colors">
                    <td class="py-3 px-4">
                      <div class="flex flex-col">
                        <span class="font-semibold text-on-surface">${sub.customerName}</span>
                        <span class="font-caption-mono text-[11px] text-on-surface-variant">${sub.id}</span>
                      </div>
                    </td>
                    <td class="py-3 px-4">
                      <span class="font-medium">${sub.planName}</span>
                    </td>
                    <td class="py-3 px-4 tabular-nums font-semibold">
                      $${sub.amount.toLocaleString()}
                    </td>
                    <td class="py-3 px-4 text-secondary">
                      ${sub.billingCycle}
                    </td>
                    <td class="py-3 px-4">
                      ${sub.status === 'past_due'
                        ? Badge({ text: 'Past Due · Retry #2', variant: 'danger', dot: true })
                        : Badge({ text: 'Active & Verified', variant: 'success', dot: true })
                      }
                    </td>
                    <td class="py-3 px-4 text-right">
                      <a href="#customers" class="text-primary hover:underline font-semibold text-label-md">Inspect</a>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Quick Telemetry & Playbooks (4 cols) -->
        <div class="lg:col-span-4 flex flex-col gap-4">
          <!-- Card: Smart Dunning Status -->
          <div class="p-5 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50 flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="font-label-sm uppercase tracking-wider text-secondary font-semibold">Smart Dunning Engine</span>
              ${Badge({ text: 'ML v4.2 Active', variant: 'info' })}
            </div>
            <p class="font-body-sm text-on-surface-variant">
              Adaptive retry engine schedules next card retry attempt using optimal authorization windows.
            </p>
            <div class="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1">
              <div class="flex items-center justify-between text-caption-mono text-[12px]">
                <span class="text-secondary font-medium">Next Scheduled Recovery:</span>
                <span class="font-bold text-on-surface">Oct 30, 04:00Z</span>
              </div>
              <div class="flex items-center justify-between text-caption-mono text-[12px]">
                <span class="text-secondary font-medium">Recovery Success Rate:</span>
                <span class="font-bold text-tertiary">84.2%</span>
              </div>
            </div>
            <a href="#churn-retention" class="text-label-md text-primary font-semibold hover:underline flex items-center gap-1">
              <span>View Churn & Retention Telemetry</span>
              <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
          </div>

          <!-- Card: Multi-Jurisdiction Tax Ledger -->
          <div class="p-5 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50 flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="font-label-sm uppercase tracking-wider text-secondary font-semibold">Tax & Nexus Ledger</span>
              ${Badge({ text: 'Avalara Synced', variant: 'success' })}
            </div>
            <div class="flex flex-col gap-1.5 text-body-sm">
              <div class="flex justify-between items-center">
                <span class="text-secondary">California (CDTFA):</span>
                <span class="font-caption-mono text-error font-semibold">88.0% (Warning)</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-secondary">United Kingdom (HMRC):</span>
                <span class="font-caption-mono text-error font-semibold">94.0% (Near Limit)</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-secondary">European Union (OSS):</span>
                <span class="font-caption-mono text-tertiary font-semibold">Active Registered</span>
              </div>
            </div>
            <a href="#tax-ledgers" class="text-label-md text-primary font-semibold hover:underline flex items-center gap-1">
              <span>Open Tax & General Ledgers</span>
              <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  `;
}

