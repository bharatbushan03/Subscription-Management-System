/**
 * Customer 360 & Lifecycle Detail Page View
 * High-fidelity implementation matching Brightloop Customer 360 specs
 */

import { MetricCard } from '../components/metrics/MetricCard.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';
import { customerService } from '../services/api.js';

export async function CustomersPage() {
  const customers = await customerService.list();

  return `
    <div class="flex flex-col w-full pb-12 animate-fade-in">
      <!-- Breadcrumb indicator -->
      <div class="flex items-center gap-1.5 text-on-surface-variant font-label-md text-label-md mb-3">
        <a href="#dashboard" class="hover:text-primary transition-colors">Home</a>
        <span class="material-symbols-outlined text-[14px]">chevron_right</span>
        <span>Lifecycle</span>
        <span class="material-symbols-outlined text-[14px]">chevron_right</span>
        <a href="#customers" class="hover:text-primary transition-colors">Customers</a>
        <span class="material-symbols-outlined text-[14px]">chevron_right</span>
        <span class="text-on-surface font-semibold">OmniFlow Logistics (CUST-4481)</span>
      </div>

      <!-- Account Top Header Profile Banner -->
      <section class="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-surface-container/60 mb-6">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div class="flex items-start gap-4">
            <div class="w-14 h-14 rounded-xl bg-primary text-on-primary font-headline-md text-headline-md font-bold flex items-center justify-center shrink-0 shadow-sm">
              OF
            </div>
            <div class="flex flex-col">
              <div class="flex items-center gap-2 flex-wrap">
                <h1 class="font-headline-lg text-headline-lg font-bold text-on-surface">OmniFlow Logistics</h1>
                <span class="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-caption-mono text-caption-mono text-[11px] font-semibold">CUST-4481</span>
                ${Badge({ text: 'Enterprise Custom', variant: 'info' })}
                ${Badge({ text: '64% · At Risk (Dunning Escalation)', variant: 'danger', dot: true })}
              </div>
              <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption-mono text-[12px] text-secondary mt-1">
                <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">business</span> Freight & Supply Chain Tech</span>
                <span>·</span>
                <span>Cloud Region: US-East-1</span>
                <span>·</span>
                <span>Customer Since: Oct 2022 (2y tenure)</span>
                <span>·</span>
                <span class="font-bold text-on-surface">Net ARR: $24,500.00</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-wrap shrink-0">
            ${Button({ label: 'Log Activity', icon: 'edit_note', variant: 'secondary' })}
            ${Button({ label: 'Send Statement', icon: 'mail', variant: 'secondary' })}
            <button id="add-customer-btn" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary-container text-on-primary rounded-lg shadow-sm font-label-md font-semibold"><span class="material-symbols-outlined text-[18px]">add_circle</span>Add Customer</button>
          </div>
        </div>

        <!-- Sub-Navigation Tabs inside Customer 360 -->
        <nav class="flex items-center gap-2 overflow-x-auto border-t border-surface-container/60 mt-5 pt-3">
          <button class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-container text-on-primary font-label-md font-semibold shadow-sm shrink-0">
            <span>Overview & Subscriptions</span>
            <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
          </button>
          <button class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low font-label-md font-semibold transition-colors shrink-0">
            <span>Invoices & Transactions</span>
            <span class="px-1.5 py-0.2 rounded-full bg-surface-container text-secondary text-[10px] font-bold">14</span>
          </button>
          <button class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low font-label-md font-semibold transition-colors shrink-0">
            <span>Entitlements & Usage Metering</span>
          </button>
          <button class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low font-label-md font-semibold transition-colors shrink-0">
            <span>Contacts & Users</span>
            <span class="px-1.5 py-0.2 rounded-full bg-surface-container text-secondary text-[10px] font-bold">18</span>
          </button>
        </nav>
      </section>

      <!-- Account Top KPI Cards -->
      <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        ${MetricCard({
          title: 'Total Lifetime Value (LTV)',
          value: '$68,600.00',
          delta: '+18.4% Expansion over tenure',
          deltaType: 'positive',
          icon: 'payments'
        })}

        ${MetricCard({
          title: 'Active Subscriptions',
          value: '1 Active',
          subvalue: '(1 Overdue)',
          delta: '$24,500/yr renewal in retry',
          deltaType: 'negative',
          icon: 'cached'
        })}

        ${MetricCard({
          title: 'Account Health Score',
          value: '64',
          subvalue: '/ 100',
          delta: 'At-Risk: Gateway Code 2004',
          deltaType: 'negative',
          progress: 64,
          footerText: '<span class="text-error font-medium">Critical Action Required</span>'
        })}

        ${MetricCard({
          title: 'Outstanding Balance',
          value: '$24,500.00',
          delta: '3 Days Overdue',
          deltaType: 'negative',
          icon: 'priority_high',
          footerText: '<span class="text-secondary">Due Oct 24, 2024</span>'
        })}
      </section>

      <!-- Payment Renewal Overdue Alert Banner -->
      <div class="p-5 rounded-xl bg-error-container/20 border-2 border-error-container flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shadow-sm">
        <div class="flex items-start gap-3.5">
          <div class="p-2 rounded-lg bg-error text-on-error shrink-0 mt-0.5">
            <span class="material-symbols-outlined text-[24px]">credit_card_off</span>
          </div>
          <div class="flex flex-col">
            <div class="flex items-center gap-2">
              <span class="font-headline-sm text-[16px] font-bold text-on-surface">Payment Renewal Overdue — $24,500.00</span>
              <span class="px-2 py-0.5 rounded-full bg-error text-on-error font-caption-mono text-[10px] font-bold">RETRY #2 FAILED</span>
            </div>
            <p class="font-body-sm text-on-surface-variant text-[13px] mt-1">
              Automated invoice renewal failed on <strong>AMEX •••• 1009</strong> with Gateway Error Code <code>2004 (Insufficient Funds)</code>. Smart Dunning retry #3 is scheduled for <strong>Oct 30, 2024 at 04:00 AM UTC</strong>.
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          ${Button({ label: 'Launch Dunning Playbook', icon: 'play_arrow', variant: 'primary', size: 'sm' })}
          ${Button({ label: 'Send Direct Payment Link', icon: 'link', variant: 'secondary', size: 'sm' })}
          ${Button({ label: 'Update Card', icon: 'credit_card', variant: 'secondary', size: 'sm' })}
        </div>
      </div>

      <!-- Two-Column Split Layout -->
      <section class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Left Column: Plans, Ledgers, Activity (8 cols) -->
        <div class="lg:col-span-8 flex flex-col gap-6">
          <!-- Active Plan & Entitlements -->
          <div class="p-5 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50 flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[20px]">autorenew</span>
                <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">Active Plan & Entitlements</h2>
              </div>
              <span class="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-caption-mono text-[10px] font-bold">Past Due Cycle</span>
            </div>

            <div class="p-4 rounded-xl bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span class="font-headline-sm text-[18px] font-bold text-on-surface">Enterprise Custom Plan</span>
                <span class="font-caption-mono text-[11px] text-secondary ml-1">sub_4481_ent</span>
                <p class="text-caption-mono text-[12px] text-secondary mt-0.5">Billed Annually · Next scheduled term cycle: Oct 24, 2025</p>
              </div>
              <div class="flex flex-col sm:items-end">
                <span class="font-headline-lg text-[24px] font-bold text-on-surface tabular-nums">$24,500.00 <span class="text-body-sm font-normal text-secondary">/ yr</span></span>
                <span class="text-caption-mono text-[11px] text-secondary">Covers 50 base enterprise seats + API bundle</span>
              </div>
            </div>

            <!-- Allocated Quota & Live Metering -->
            <div class="space-y-3 pt-1">
              <span class="font-label-sm uppercase tracking-wider text-secondary font-semibold">Allocated Quota & Live Metering</span>
              <div>
                <div class="flex justify-between text-body-sm text-[13px] mb-1">
                  <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[16px] text-secondary">badge</span> User Seats Provisioned</span>
                  <span class="font-caption-mono font-bold">38 / 50 seats used (76%)</span>
                </div>
                <div class="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div class="h-full bg-primary rounded-full" style="width: 76%;"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-body-sm text-[13px] mb-1">
                  <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[16px] text-secondary">data_usage</span> Monthly API Quota Usage</span>
                  <span class="font-caption-mono font-bold">4.2M / 10.0M requests (42%)</span>
                </div>
                <div class="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div class="h-full bg-tertiary rounded-full" style="width: 42%;"></div>
                </div>
              </div>

              <div class="flex justify-between items-center text-body-sm text-[13px] pt-1">
                <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[16px] text-secondary">webhook</span> Dedicated Webhook Pipelines</span>
                <span class="font-caption-mono font-bold text-on-surface">20 active pipelines (Unlimited tier)</span>
              </div>
            </div>

            <!-- Lifecycle Action Controls -->
            <div class="p-3.5 rounded-lg bg-surface-container-low border border-surface-container flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[20px]">sync_saved_locally</span>
                <div class="flex flex-col">
                  <span class="font-label-md font-semibold text-on-surface">Subscription Lifecycle Management</span>
                  <span class="text-caption-mono text-[11px] text-secondary">Execute state machine transitions with proration & audit logging</span>
                </div>
              </div>
              <div class="flex items-center gap-2 flex-wrap">
                <button id="btn-sub-renew" class="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md font-semibold transition-all shadow-sm flex items-center gap-1 text-[12px]">
                  <span class="material-symbols-outlined text-[16px]">autorenew</span>
                  <span>Renew (+1 Year)</span>
                </button>
                <button id="btn-sub-pause" class="px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md font-semibold transition-all shadow-sm border border-outline-variant/30 flex items-center gap-1 text-[12px]">
                  <span class="material-symbols-outlined text-[16px]">pause_circle</span>
                  <span>Pause Billing</span>
                </button>
                <button id="btn-sub-upgrade" class="px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md font-semibold transition-all shadow-sm border border-outline-variant/30 flex items-center gap-1 text-[12px]">
                  <span class="material-symbols-outlined text-[16px]">upgrade</span>
                  <span>Change Tier</span>
                </button>
                <button id="btn-sub-cancel" class="px-2.5 py-1.5 rounded-lg text-error hover:bg-error-container/40 font-label-md font-semibold transition-all text-[12px] flex items-center gap-1">
                  <span class="material-symbols-outlined text-[16px]">cancel</span>
                  <span>Cancel</span>
                </button>
              </div>
            </div>

            <div class="flex justify-between items-center pt-2 border-t border-surface-container/40">
              <a href="#" class="text-label-md text-primary font-semibold hover:underline">View Subscription Details (sub_4481_ent) &rarr;</a>
              <button class="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-md font-semibold transition-colors">Modify Seats / Add-ons</button>
            </div>
          </div>

          <!-- Billing Ledger & Invoices Table -->
          <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50 overflow-hidden">
            <div class="p-4 bg-surface-container-low flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[20px]">receipt_long</span>
                <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">Billing Ledger & Invoices</h2>
              </div>
              <span class="text-caption-mono text-[12px] text-secondary">Showing 4 of 14 records</span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-surface-container-low text-secondary font-label-sm uppercase tracking-wider text-[11px]">
                    <th class="py-3 px-4 font-semibold">Invoice ID</th>
                    <th class="py-3 px-4 font-semibold">Date</th>
                    <th class="py-3 px-4 font-semibold">Amount</th>
                    <th class="py-3 px-4 font-semibold">Status</th>
                    <th class="py-3 px-4 font-semibold text-right">Payment Method</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-surface-container text-body-sm text-on-surface">
                  <tr class="hover:bg-surface-container-low/50 transition-colors">
                    <td class="py-3 px-4 font-semibold text-primary font-caption-mono">inv_2024_8819</td>
                    <td class="py-3 px-4 text-secondary text-[12px] font-caption-mono">Oct 24, 2024</td>
                    <td class="py-3 px-4 font-bold tabular-nums">$24,500.00</td>
                    <td class="py-3 px-4">${Badge({ text: 'Past Due', variant: 'danger', dot: true })}</td>
                    <td class="py-3 px-4 text-right font-caption-mono text-[12px] text-secondary">AMEX •••• 1009</td>
                  </tr>
                  <tr class="hover:bg-surface-container-low/50 transition-colors">
                    <td class="py-3 px-4 font-semibold text-primary font-caption-mono">inv_2024_4412</td>
                    <td class="py-3 px-4 text-secondary text-[12px] font-caption-mono">Sep 15, 2024</td>
                    <td class="py-3 px-4 font-bold tabular-nums">$2,400.00</td>
                    <td class="py-3 px-4">${Badge({ text: 'Paid', variant: 'success', dot: true })}</td>
                    <td class="py-3 px-4 text-right font-caption-mono text-[12px] text-secondary">AMEX •••• 1009</td>
                  </tr>
                  <tr class="hover:bg-surface-container-low/50 transition-colors">
                    <td class="py-3 px-4 font-semibold text-primary font-caption-mono">inv_2023_1092</td>
                    <td class="py-3 px-4 text-secondary text-[12px] font-caption-mono">Oct 24, 2023</td>
                    <td class="py-3 px-4 font-bold tabular-nums">$22,100.00</td>
                    <td class="py-3 px-4">${Badge({ text: 'Paid', variant: 'success', dot: true })}</td>
                    <td class="py-3 px-4 text-right font-caption-mono text-[12px] text-secondary">AMEX •••• 1009</td>
                  </tr>
                  <tr class="hover:bg-surface-container-low/50 transition-colors">
                    <td class="py-3 px-4 font-semibold text-primary font-caption-mono">inv_2022_0182</td>
                    <td class="py-3 px-4 text-secondary text-[12px] font-caption-mono">Oct 24, 2022</td>
                    <td class="py-3 px-4 font-bold tabular-nums">$19,600.00</td>
                    <td class="py-3 px-4">${Badge({ text: 'Paid', variant: 'success', dot: true })}</td>
                    <td class="py-3 px-4 text-right font-caption-mono text-[12px] text-secondary">Wire Transfer / ACH</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Lifecycle & Activity Stream -->
          <div class="p-5 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50 flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">Lifecycle & Activity Stream</h2>
              <span class="text-caption-mono text-[11px] text-tertiary flex items-center gap-1 font-semibold">
                <span class="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span> Real-time webhook events
              </span>
            </div>
            <div class="space-y-3 pt-1 border-l-2 border-surface-container pl-4 ml-2">
              <div class="relative">
                <span class="w-2.5 h-2.5 rounded-full bg-error absolute -left-[21px] top-1 ring-4 ring-white"></span>
                <p class="font-body-sm text-[13px] text-on-surface">
                  <strong>Payment Retry Failed:</strong> Oct 27, 2024 · 04:12 AM UTC
                </p>
                <p class="text-caption-mono text-[12px] text-secondary">Payment retry #2 rejected. Next attempt queued for Oct 30.</p>
              </div>

              <div class="relative">
                <span class="w-2.5 h-2.5 rounded-full bg-primary absolute -left-[21px] top-1 ring-4 ring-white"></span>
                <p class="font-body-sm text-[13px] text-on-surface">
                  <strong>Smart Dunning Email #1 Opened:</strong> Oct 25, 2024 · 09:00 AM UTC
                </p>
                <p class="text-caption-mono text-[12px] text-secondary">Recipient Elena Rostova viewed renewal notification email. Self-service payment token generated.</p>
              </div>

              <div class="relative">
                <span class="w-2.5 h-2.5 rounded-full bg-tertiary absolute -left-[21px] top-1 ring-4 ring-white"></span>
                <p class="font-body-sm text-[13px] text-on-surface">
                  <strong>Seat Expansion Add-on (+10 Seats):</strong> Sep 15, 2024 · 02:45 PM UTC
                </p>
                <p class="text-caption-mono text-[12px] text-secondary">Prorated charge of $2,400.00 processed successfully. Approved by CSM Marcus Vance.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Stakeholders, Payment, Tax, Sync (4 cols) -->
        <div class="lg:col-span-4 flex flex-col gap-6">
          <!-- Stakeholders Directory -->
          <div class="p-5 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50 flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="font-headline-sm text-[16px] font-bold text-on-surface">Stakeholders</span>
              <button class="text-label-sm text-primary font-semibold hover:underline">+ Add Contact</button>
            </div>
            <div class="space-y-3 pt-1">
              <div class="flex items-start gap-3 p-2.5 rounded-lg bg-surface-container-low">
                <div class="w-8 h-8 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center shrink-0 text-[12px]">ER</div>
                <div class="flex flex-col min-w-0">
                  <div class="flex items-center gap-1.5">
                    <span class="font-semibold text-on-surface text-[13px]">Elena Rostova</span>
                    <span class="px-1.5 py-0.2 rounded bg-primary/10 text-primary font-caption-mono text-[9px] font-bold">PRIMARY BILLING</span>
                  </div>
                  <span class="text-caption-mono text-[11px] text-secondary">VP of Engineering</span>
                  <span class="text-caption-mono text-[11px] text-primary">finance@omniflow.com</span>
                </div>
              </div>

              <div class="flex items-start gap-3 p-2.5 rounded-lg bg-surface-container-low">
                <div class="w-8 h-8 rounded-full bg-secondary text-on-secondary font-bold flex items-center justify-center shrink-0 text-[12px]">VK</div>
                <div class="flex flex-col min-w-0">
                  <div class="flex items-center gap-1.5">
                    <span class="font-semibold text-on-surface text-[13px]">Viktor Kasparov</span>
                    <span class="px-1.5 py-0.2 rounded bg-surface-container text-secondary font-caption-mono text-[9px] font-bold">TECH ADMIN</span>
                  </div>
                  <span class="text-caption-mono text-[11px] text-secondary">Chief Technology Officer</span>
                  <span class="text-caption-mono text-[11px] text-primary">viktor@omniflow.com</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Methods On File -->
          <div class="p-5 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50 flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="font-headline-sm text-[16px] font-bold text-on-surface">Payment Methods</span>
              <span class="px-2 py-0.2 rounded-full bg-error text-on-error font-caption-mono text-[10px] font-bold">Action Needed</span>
            </div>
            <div class="p-3 rounded-lg border border-error/30 bg-error-container/10 flex flex-col gap-1.5">
              <div class="flex justify-between items-center">
                <span class="font-bold text-on-surface text-[13px]">AMEX •••• 1009</span>
                <span class="px-2 py-0.2 rounded bg-error text-on-error font-caption-mono text-[10px] font-bold">DECLINED</span>
              </div>
              <span class="text-caption-mono text-[11px] text-secondary">Exp 09/27 · Corporate Card</span>
              <p class="text-caption-mono text-[11px] text-error font-semibold mt-1">Last failure: Oct 27, 2024 · Insufficient funds code 2004.</p>
            </div>
            <div class="flex justify-between items-center text-[12px] text-secondary pt-1">
              <span>Backup Method: <strong>None</strong></span>
              <button class="text-primary font-semibold hover:underline">+ Add Backup ACH</button>
            </div>
            <button class="w-full py-2 bg-surface-container hover:bg-surface-container-high text-primary font-label-md font-semibold rounded-lg transition-colors flex items-center justify-center gap-1">
              <span class="material-symbols-outlined text-[16px]">mail</span>
              <span>Send Self-Service Update Link</span>
            </button>
          </div>

          <!-- Tax & Entity Information -->
          <div class="p-5 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50 flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="font-headline-sm text-[16px] font-bold text-on-surface">Tax & Entity Information</span>
              <button class="text-on-surface-variant hover:text-on-surface"><span class="material-symbols-outlined text-[18px]">edit</span></button>
            </div>
            <div class="space-y-1.5 text-[12px] text-secondary">
              <p><strong>Legal Entity Name:</strong> OmniFlow Logistics, Inc.</p>
              <p><strong>Registered Billing Address:</strong> 742 Market Street, Suite 1200, San Francisco, CA 94103, USA</p>
              <div class="flex justify-between items-center pt-1">
                <span>Tax ID / EIN: <code>US-EIN 94-3829104</code></span>
                ${Badge({ text: 'Avalara Verified', variant: 'success' })}
              </div>
              <div class="flex justify-between items-center pt-1">
                <span>Currency: <strong>USD ($)</strong></span>
                <span>Terms: <strong>Net 0 (Auto-Debit)</strong></span>
              </div>
            </div>
          </div>

          <!-- Internal Team & Sync Status -->
          <div class="p-5 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50 flex flex-col gap-3">
            <span class="font-headline-sm text-[16px] font-bold text-on-surface">Internal Team & Sync</span>
            <div class="space-y-2 text-[12px] text-secondary">
              <div class="flex justify-between"><span>Account Executive:</span><strong class="text-on-surface">Elena Vance</strong></div>
              <div class="flex justify-between"><span>Assigned CSM:</span><strong class="text-on-surface">Marcus Vance</strong></div>
              <div class="h-px bg-surface-container my-1"></div>
              <div class="flex justify-between items-center">
                <span>Payment Gateway</span>
                ${Badge({ text: 'Connected', variant: 'success' })}
              </div>
              <div class="flex justify-between items-center">
                <span>NetSuite ERP</span>
                <span class="font-caption-mono text-[11px] text-tertiary">Synced 2h ago</span>
              </div>
              <div class="flex justify-between items-center">
                <span>Salesforce CRM</span>
                <span class="font-caption-mono text-[11px] text-secondary">Won / Closed</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}
