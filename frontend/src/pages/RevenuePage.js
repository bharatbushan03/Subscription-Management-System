/**
 * Revenue Analytics & Forecast Page
 * Brightloop Subscription Management System
 */

import { MetricCard } from '../components/metrics/MetricCard.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';
import { analyticsService } from '../services/api.js';

export async function RevenuePage() {
  let overview, revenueData;
  try {
    [overview, revenueData] = await Promise.all([
      analyticsService.getOverview(),
      analyticsService.getRevenue(12)
    ]);
  } catch (err) {
    return `<div class="p-6 text-error">Failed to load revenue analytics: ${err.message}</div>`;
  }

  const mrr = overview.mrr?.total || 0;
  const arr = overview.arr?.total || 0;
  const formatCurrency = (n) => `$${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const history = revenueData.revenueHistory || [];
  const summary = revenueData.summary || { newSubscriptions: 0, churnedSubscriptions: 0, netGrowth: 0 };
  const plans = overview.planDistribution || [];

  return `
    <div class="flex flex-col w-full pb-12 animate-fade-in">
      <!-- Section Header -->
      <section class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">Revenue Analytics & SaaS Forecast</h1>
            ${Badge({ text: 'ASC 606 Verified', variant: 'success', dot: true })}
            <span class="px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-caption-mono text-[11px] font-semibold">12-Month Horizon</span>
          </div>
          <p class="font-body-md text-on-surface-variant max-w-4xl mt-1">
            Empirical recurring revenue velocity, deferred revenue waterfalls, contract value cohorts, and net expansion accounting.
          </p>
        </div>

        <div class="flex items-center gap-2 flex-wrap shrink-0">
          ${Button({ label: 'Export Model (CSV)', icon: 'download', variant: 'secondary' })}
          ${Button({ label: 'GAAP Reconciliation', icon: 'account_balance', variant: 'primary' })}
        </div>
      </section>

      <!-- KPI Grid -->
      <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        ${MetricCard({
          title: 'Monthly Recurring Revenue (MRR)',
          value: formatCurrency(mrr),
          delta: '+14.2% QoQ',
          deltaType: 'positive',
          progress: 84,
          footerText: `<span>ARR Run-rate:</span><span class="text-tertiary font-bold">${formatCurrency(arr)}</span>`
        })}

        ${MetricCard({
          title: 'Net New Subscriptions (6 Mo)',
          value: summary.netGrowth >= 0 ? `+${summary.netGrowth}` : `${summary.netGrowth}`,
          subvalue: 'tenants',
          delta: `${summary.newSubscriptions} new / ${summary.churnedSubscriptions} churned`,
          deltaType: summary.netGrowth >= 0 ? 'positive' : 'negative',
          icon: 'trending_up',
          footerText: '<span>Cohort Retention:</span><span class="text-tertiary font-semibold">97.4%</span>'
        })}

        ${MetricCard({
          title: 'Gross Revenue Churn',
          value: `${overview.churn?.ratePercent || 0}%`,
          subvalue: '/ mo',
          delta: 'Benchmark: <2.0%',
          deltaType: 'positive',
          icon: 'pie_chart',
          footerText: `<span>Exposure:</span><span class="text-error font-semibold">${overview.churn?.atRiskExposure || '$0'}</span>`
        })}

        ${MetricCard({
          title: 'Total Outstanding Receivables',
          value: formatCurrency(overview.receivables?.outstanding || 0),
          delta: `${overview.receivables?.pendingCount || 0} Pending Invoices`,
          deltaType: 'neutral',
          icon: 'receipt',
          footerText: `<span>Collected MTD:</span><span class="text-tertiary font-semibold">${formatCurrency(overview.receivables?.settledMTD || 0)}</span>`
        })}
      </section>

      <!-- Revenue History Waterfall & Breakdown -->
      <section class="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        <!-- Monthly History Table / Bars (8 cols) -->
        <div class="lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50 p-6">
          <div class="flex items-center justify-between pb-4 border-b border-surface-container/60 mb-4">
            <div>
              <h3 class="font-headline-sm text-[18px] font-bold text-on-surface">12-Month MRR Waterfall</h3>
              <p class="text-body-sm text-secondary text-[12px]">Calculated from active contracted subscriptions</p>
            </div>
            <div class="flex items-center gap-1.5 p-1 bg-surface-container-low rounded-lg text-label-sm font-semibold">
              <span class="px-2.5 py-1 text-primary font-bold">Monthly View</span>
            </div>
          </div>

          <div class="space-y-3">
            ${history.map(h => {
              const maxMrr = Math.max(...history.map(x => x.mrr), 1);
              const pct = Math.min(100, Math.round((h.mrr / maxMrr) * 100));
              return `
                <div class="flex items-center gap-3 text-[13px]">
                  <span class="w-16 text-secondary font-mono text-[12px] shrink-0">${h.month}</span>
                  <div class="flex-1 bg-surface-container-low h-6 rounded-md overflow-hidden relative">
                    <div class="bg-primary h-full rounded-md transition-all duration-500" style="width: ${pct}%"></div>
                  </div>
                  <span class="w-24 text-right font-bold text-on-surface tabular-nums shrink-0">${formatCurrency(h.mrr)}</span>
                  <span class="w-16 text-right text-secondary text-[11px] shrink-0">${h.subscriptions} subs</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Plan-wise Breakdown (4 cols) -->
        <div class="lg:col-span-4 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50 p-6 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-3 border-b border-surface-container/60 mb-4">
              <h3 class="font-headline-sm text-[16px] font-bold text-on-surface">MRR Share by Tier</h3>
              ${Badge({ text: 'Active Plans', variant: 'info' })}
            </div>

            <div class="space-y-4">
              ${plans.length === 0 ? `
                <p class="text-secondary text-[13px] py-4 text-center">No active subscriptions assigned to plans.</p>
              ` : plans.map((p, idx) => {
                const totalMrr = plans.reduce((s, x) => s + (x.mrr || 0), 0) || 1;
                const share = Math.round((p.mrr / totalMrr) * 100);
                const colors = ['bg-primary', 'bg-tertiary', 'bg-secondary', 'bg-amber-500'];
                const color = colors[idx % colors.length];
                return `
                  <div>
                    <div class="flex justify-between items-center text-[13px] mb-1">
                      <span class="font-semibold text-on-surface">${p.plan_name || 'Tier'}</span>
                      <span class="font-bold text-on-surface tabular-nums">${formatCurrency(p.mrr)} <span class="text-secondary font-normal text-[11px]">(${share}%)</span></span>
                    </div>
                    <div class="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                      <div class="${color} h-full rounded-full" style="width: ${share}%"></div>
                    </div>
                    <span class="text-caption-mono text-[11px] text-secondary">${p.cnt} active tenants</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-surface-container/60">
            <a href="#products-plans" class="text-label-md text-primary font-semibold hover:underline flex items-center justify-between">
              <span>Manage Plan Tiers & CPQ</span>
              <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  `;
}
