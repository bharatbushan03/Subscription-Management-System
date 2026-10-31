/**
 * Executive Dashboard Page View
 * High-fidelity implementation matching Brightloop design specs
 */

import { MetricCard } from '../components/metrics/MetricCard.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';
import { analyticsService, subscriptionService } from '../services/api.js';

export async function DashboardPage() {
  const analytics = await analyticsService.getOverview();
  const subscriptions = await subscriptionService.list();

  return `
    <div class="flex flex-col w-full pb-12 animate-fade-in">
      <!-- Section 1: Page Header & Title Toolbar -->
      <section class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">Executive Telemetry & Revenue Operations</h1>
            ${Badge({ text: 'Stripe & NetSuite ERP Synced', variant: 'success', dot: true })}
            <span class="px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-caption-mono text-caption-mono text-[11px] font-semibold">ASC 606 Compliant</span>
          </div>
          <p class="font-body-md text-on-surface-variant max-w-4xl mt-1">
            Real-time monthly recurring revenue velocity, empirical cohort decay curves, multi-currency plan tiering, and automated recovery telemetry.
          </p>
        </div>

        <div class="flex items-center gap-2 flex-wrap shrink-0">
          ${Button({ label: 'Export Telemetry (CSV)', icon: 'download', variant: 'secondary' })}
          ${Button({ label: 'Audit Package', icon: 'verified', variant: 'secondary' })}
          <a href="#products-plans" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary-container text-on-primary rounded-lg shadow-sm font-label-md font-semibold transition-all">
            <span class="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ Create Plan Tier</span>
          </a>
        </div>
      </section>

      <!-- Section 2: Top KPI Metric Cards Grid -->
      <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        ${MetricCard({
          title: 'Monthly Recurring Revenue (MRR)',
          value: analytics.mrr.formatted,
          delta: '+14.8% QoQ',
          deltaType: 'positive',
          progress: 82,
          footerText: '<span>April 1 – April 30: $112,000</span><span class="text-tertiary font-semibold">ARR: ' + analytics.arr.formatted + '</span>'
        })}

        ${MetricCard({
          title: 'Active Provisioned Subscriptions',
          value: analytics.mrr.activeSubscriptions.toLocaleString(),
          subvalue: 'seats',
          delta: '+34 this week',
          deltaType: 'positive',
          icon: 'autorenew',
          footerText: '<span>98.2% Auto-Renewal Rate</span><span class="text-primary font-semibold">94 Enterprise Tier</span>'
        })}

        ${MetricCard({
          title: 'Gross Logo Churn Rate',
          value: analytics.churn.ratePercent + '%',
          subvalue: '/ mo',
          delta: '-0.15% vs Benchmark',
          deltaType: 'positive',
          badgeText: 'Net Retention: ' + analytics.churn.netRetention + '%',
          footerText: '<span>Flagged Cohort Exposure:</span><span class="text-error font-semibold">' + analytics.churn.atRiskExposure + '</span>'
        })}

        ${MetricCard({
          title: 'Outstanding Receivables & Dunning',
          value: '$' + analytics.receivables.outstanding.toLocaleString(),
          delta: '3 Invoices At-Risk',
          deltaType: 'negative',
          icon: 'account_balance_wallet',
          footerText: '<span>Settled MTD:</span><span class="text-tertiary font-semibold">$' + analytics.receivables.settledMTD.toLocaleString() + '</span>'
        })}
      </section>

      <!-- Section 3: Catalog & Plan Tier Matrix Cards -->
      <section class="mb-6">
        <div class="flex items-center justify-between pb-3">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[20px]">layers</span>
            <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">Active Subscription Catalog & Tiers</h2>
          </div>
          <div class="flex items-center gap-1.5 p-1 bg-surface-container-low rounded-lg text-label-sm font-semibold">
            <button class="px-2.5 py-1 rounded-md bg-surface-container-lowest text-primary shadow-sm font-bold">Annual (Save 15%)</button>
            <button class="px-2.5 py-1 rounded-md text-secondary hover:text-on-surface">Monthly Billing</button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <!-- Plan 1: Starter Cloud -->
          <div class="p-6 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/60 flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div class="flex justify-between items-start">
                <div>
                  <span class="font-label-sm uppercase tracking-wider text-secondary font-semibold">Self-Serve SaaS</span>
                  <h3 class="font-headline-sm text-[20px] font-bold text-on-surface mt-0.5">Starter Cloud</h3>
                </div>
                <span class="px-2 py-0.5 rounded-full bg-surface-container text-secondary font-caption-mono text-[11px] font-semibold">Tier 1</span>
              </div>
              <div class="flex items-baseline gap-1 mt-4 mb-3">
                <span class="font-headline-lg text-[32px] font-bold text-on-surface tabular-nums">$990</span>
                <span class="text-body-sm text-secondary font-medium">/ month billed annually</span>
              </div>
              <p class="font-body-sm text-on-surface-variant text-[13px] mb-4">
                Core subscription billing, unified customer directory, standard invoices, and automated credit card processing.
              </p>
              <div class="space-y-2 pt-2 border-t border-surface-container/40 text-[13px]">
                <div class="flex items-center gap-2 text-on-surface">
                  <span class="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
                  <span>Up to 10 Team Seats Provisioned</span>
                </div>
                <div class="flex items-center gap-2 text-on-surface">
                  <span class="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
                  <span>100,000 API Metered Requests / mo</span>
                </div>
                <div class="flex items-center gap-2 text-on-surface">
                  <span class="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
                  <span>Standard Stripe Gateway Sync</span>
                </div>
              </div>
            </div>
            <div class="mt-6 pt-4 border-t border-surface-container/40 flex items-center justify-between">
              <span class="text-caption-mono text-[12px] text-secondary">320 Active Tenants</span>
              <button class="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-md font-semibold transition-colors">Configure Plan</button>
            </div>
          </div>

          <!-- Plan 2: Growth Pro (Featured) -->
          <div class="p-6 bg-surface-container-lowest rounded-xl shadow-md border-2 border-primary relative flex flex-col justify-between hover:shadow-lg transition-all">
            <span class="absolute -top-3 right-5 px-2.5 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-[10px] font-bold uppercase tracking-wider shadow-sm">Most Popular</span>
            <div>
              <div class="flex justify-between items-start">
                <div>
                  <span class="font-label-sm uppercase tracking-wider text-primary font-semibold">Mid-Market Scale</span>
                  <h3 class="font-headline-sm text-[20px] font-bold text-on-surface mt-0.5">Growth Pro</h3>
                </div>
                <span class="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-caption-mono text-[11px] font-semibold">Tier 2</span>
              </div>
              <div class="flex items-baseline gap-1 mt-4 mb-3">
                <span class="font-headline-lg text-[32px] font-bold text-primary tabular-nums">$3,450</span>
                <span class="text-body-sm text-secondary font-medium">/ month billed annually</span>
              </div>
              <p class="font-body-sm text-on-surface-variant text-[13px] mb-4">
                Full automated CPQ, dunning cadence engine, Avalara multi-state sales tax calculations, and volume discounts.
              </p>
              <div class="space-y-2 pt-2 border-t border-surface-container/40 text-[13px]">
                <div class="flex items-center gap-2 text-on-surface">
                  <span class="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
                  <span>Up to 50 Team Seats & RBAC</span>
                </div>
                <div class="flex items-center gap-2 text-on-surface">
                  <span class="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
                  <span>5,000,000 API Requests / mo</span>
                </div>
                <div class="flex items-center gap-2 text-on-surface">
                  <span class="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
                  <span>Smart Dunning & Card Updater</span>
                </div>
                <div class="flex items-center gap-2 text-on-surface">
                  <span class="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
                  <span>Avalara Real-Time Tax Nexus Engine</span>
                </div>
              </div>
            </div>
            <div class="mt-6 pt-4 border-t border-surface-container/40 flex items-center justify-between">
              <span class="text-caption-mono text-[12px] text-tertiary font-semibold">680 Active Tenants (+14%)</span>
              <button class="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md font-semibold transition-colors shadow-sm">Configure Plan</button>
            </div>
          </div>

          <!-- Plan 3: Enterprise Infinite -->
          <div class="p-6 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/60 flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div class="flex justify-between items-start">
                <div>
                  <span class="font-label-sm uppercase tracking-wider text-secondary font-semibold">Global Enterprise</span>
                  <h3 class="font-headline-sm text-[20px] font-bold text-on-surface mt-0.5">Enterprise Infinite</h3>
                </div>
                <span class="px-2 py-0.5 rounded-full bg-tertiary-container/10 text-tertiary font-caption-mono text-[11px] font-semibold">Tier 3</span>
              </div>
              <div class="flex items-baseline gap-1 mt-4 mb-3">
                <span class="font-headline-lg text-[32px] font-bold text-on-surface tabular-nums">$24,500</span>
                <span class="text-body-sm text-secondary font-medium">/ year custom contract</span>
              </div>
              <p class="font-body-sm text-on-surface-variant text-[13px] mb-4">
                Unlimited enterprise seats, multi-entity NetSuite ERP sync, dedicated webhook pipelines, Okta SCIM, and 99.99% SLA.
              </p>
              <div class="space-y-2 pt-2 border-t border-surface-container/40 text-[13px]">
                <div class="flex items-center gap-2 text-on-surface">
                  <span class="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
                  <span>Unlimited Seats · Custom RBAC Policies</span>
                </div>
                <div class="flex items-center gap-2 text-on-surface">
                  <span class="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
                  <span>Dedicated Cloud Shards & 99.99% SLA</span>
                </div>
                <div class="flex items-center gap-2 text-on-surface">
                  <span class="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
                  <span>NetSuite / Workday ERP Double-Entry GL</span>
                </div>
                <div class="flex items-center gap-2 text-on-surface">
                  <span class="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
                  <span>Okta / Azure AD SCIM 2.0 Provisioning</span>
                </div>
              </div>
            </div>
            <div class="mt-6 pt-4 border-t border-surface-container/40 flex items-center justify-between">
              <span class="text-caption-mono text-[12px] text-secondary">420 Enterprise Accounts</span>
              <button class="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-md font-semibold transition-colors">Configure Plan</button>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 4: Cohort Subscriptions Table & Side Panel -->
      <section class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Subscriptions Table (8 cols) -->
        <div class="lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50 overflow-hidden">
          <div class="p-4 bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[20px]">subscriptions</span>
              <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">Active Subscription Cohorts & Health</h2>
            </div>
            <div class="flex items-center gap-2">
              <input
                type="text"
                placeholder="Filter cohorts, plans, accounts..."
                class="bg-surface-container-lowest text-on-surface font-body-sm px-3 py-1.5 rounded-lg border border-outline-variant/30 text-[13px] focus:outline-none"
              />
              <a href="#customers" class="text-label-md text-primary font-semibold hover:underline shrink-0">Directory &rarr;</a>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-surface-container-low text-secondary font-label-sm uppercase tracking-wider text-[11px]">
                  <th class="py-3 px-4 font-semibold">Account & ID</th>
                  <th class="py-3 px-4 font-semibold">Plan Tier</th>
                  <th class="py-3 px-4 font-semibold">Contract Value</th>
                  <th class="py-3 px-4 font-semibold">Billing Health</th>
                  <th class="py-3 px-4 font-semibold">Term Cycle</th>
                  <th class="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-surface-container text-body-sm text-on-surface">
                ${subscriptions.map(sub => `
                  <tr class="hover:bg-surface-container-low/50 transition-colors">
                    <td class="py-3.5 px-4">
                      <div class="flex flex-col">
                        <span class="font-semibold text-on-surface">${sub.customerName}</span>
                        <span class="font-caption-mono text-[11px] text-secondary">${sub.id}</span>
                      </div>
                    </td>
                    <td class="py-3.5 px-4 font-medium">${sub.planName}</td>
                    <td class="py-3.5 px-4 tabular-nums font-semibold">$${sub.amount.toLocaleString()} / ${sub.billingCycle}</td>
                    <td class="py-3.5 px-4">
                      ${sub.status === 'past_due'
                        ? Badge({ text: 'Past Due · Retry #2 Failed', variant: 'danger', dot: true })
                        : Badge({ text: 'Active · Auto-Debit Verified', variant: 'success', dot: true })
                      }
                    </td>
                    <td class="py-3.5 px-4 text-secondary font-caption-mono text-[12px]">${sub.nextBilling}</td>
                    <td class="py-3.5 px-4 text-right">
                      <a href="#customers" class="text-primary hover:underline font-semibold text-label-md">Inspect 360</a>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right Side Widgets (4 cols) -->
        <div class="lg:col-span-4 flex flex-col gap-4">
          <!-- Widget 1: Smart Dunning Status -->
          <div class="p-5 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50 flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="font-label-sm uppercase tracking-wider text-secondary font-semibold">Smart Dunning Telemetry</span>
              ${Badge({ text: 'ML Retries Active', variant: 'success', dot: true })}
            </div>
            <p class="font-body-sm text-on-surface-variant text-[13px]">
              Adaptive retry engine evaluates optimal card processing windows and automated account updater feeds to minimize churn.
            </p>
            <div class="grid grid-cols-2 gap-2 pt-1">
              <div class="p-2.5 rounded-lg bg-surface-container-low flex flex-col">
                <span class="text-caption-mono text-[11px] text-secondary">Recovered MTD</span>
                <span class="font-bold text-[16px] text-on-surface tabular-nums">$42,100.00</span>
              </div>
              <div class="p-2.5 rounded-lg bg-surface-container-low flex flex-col">
                <span class="text-caption-mono text-[11px] text-secondary">Recovery Rate</span>
                <span class="font-bold text-[16px] text-tertiary tabular-nums">84.2%</span>
              </div>
            </div>
            <a href="#payments-dunning" class="text-label-md text-primary font-semibold hover:underline flex items-center gap-1 pt-1">
              <span>Configure Dunning Cadence & Webhooks</span>
              <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
          </div>

          <!-- Widget 2: Tax Compliance & Avalara -->
          <div class="p-5 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50 flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="font-label-sm uppercase tracking-wider text-secondary font-semibold">Tax Compliance (Avalara)</span>
              ${Badge({ text: 'AvaTax Synced', variant: 'info' })}
            </div>
            <div class="space-y-2 text-[13px]">
              <div class="flex justify-between items-center">
                <span class="text-on-surface">US State Sales Tax (42 Jurisdictions)</span>
                <span class="font-caption-mono font-bold text-tertiary">$28,450.00 Remitted</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-on-surface">European Union (VAT One Stop Shop)</span>
                <span class="font-caption-mono font-bold text-secondary">$6,840.00 Accruing</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-on-surface">United Kingdom (HMRC VAT Scheme)</span>
                <span class="font-caption-mono font-bold text-tertiary">$3,343.60 Remitted</span>
              </div>
            </div>
            <a href="#tax-ledgers" class="text-label-md text-primary font-semibold hover:underline flex items-center gap-1 pt-1">
              <span>View GAAP Tax Ledger & Filings</span>
              <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  `;
}
