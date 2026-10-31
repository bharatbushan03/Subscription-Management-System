/**
 * Tax & General Ledgers Page View
 * High-fidelity implementation matching Brightloop Tax & GL specs
 */

import { MetricCard } from '../components/metrics/MetricCard.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';

export async function TaxLedgersPage() {
  const nexusData = [
    {
      jurisdiction: 'California (CDTFA)',
      flag: 'US',
      rule: 'Economic Sales',
      threshold: '$500,000 / Yr',
      current: '$440,290',
      pct: 88,
      status: 'Warning: Near Limit',
      statusType: 'danger',
      rate: '7.25% - 10.25% (Dest.)'
    },
    {
      jurisdiction: 'New York (NYS DTF)',
      flag: 'US',
      rule: '$500k & 100 Tx',
      threshold: '$500,000 + 100 tx',
      current: '$612,400',
      pct: 100,
      status: 'Registered & Remitting',
      statusType: 'success',
      rate: '8.875% (NYC Metro)'
    },
    {
      jurisdiction: 'European Union (OSS)',
      flag: 'EU',
      rule: 'Pan-EU Hub',
      threshold: '€10,000 Pan-EU',
      current: '€184,300',
      pct: 100,
      status: 'Active OSS Registered',
      statusType: 'success',
      rate: '19% - 27% Dynamic VAT'
    },
    {
      jurisdiction: 'United Kingdom (HMRC)',
      flag: 'UK',
      rule: 'Making Tax Digital API v2',
      threshold: '£85,000 / Yr',
      current: '£79,900',
      pct: 94,
      status: 'Auto-Remitted Qtly',
      statusType: 'danger',
      rate: '20.00% Standard VAT'
    },
    {
      jurisdiction: 'Canada (GST / HST & CA PST)',
      flag: 'CA',
      rule: 'Federal CRA Digital Economy',
      threshold: 'CAD $30,000 / 12 mo',
      current: 'CAD $18,400',
      pct: 61,
      status: 'Threshold Pending',
      statusType: 'info',
      rate: '5% - 15% Harmonized'
    }
  ];

  const glMatrix = [
    {
      event: 'Subscription Renewal Charge',
      trigger: 'Trigger: Invoice Paid Event',
      dr: '1100 - Cash / Stripe Clearing',
      cr: '2200 - Deferred SaaS Revenue',
      netsuiteId: 'MAP-NS-1048',
      status: 'Verified Sync'
    },
    {
      event: 'Metered Usage Recognition',
      trigger: 'Trigger: ASC 606 Daily Batch',
      dr: '2200 - Deferred SaaS Revenue',
      cr: '4010 - Software SaaS Revenue',
      netsuiteId: 'MAP-NS-1087',
      status: 'Verified Sync'
    },
    {
      event: 'Sales Tax Withheld / Charged',
      trigger: 'Trigger: AvaTax Committed Tax',
      dr: '1100 - Cash / Stripe Clearing',
      cr: '2150 - Sales Tax Payable (Avalara)',
      netsuiteId: 'MAP-NS-2150',
      status: 'Verified Sync'
    },
    {
      event: 'Payment Processing Fees',
      trigger: 'Trigger: Settlement Payout Batch',
      dr: '6100 - Merchant Processing Fees',
      cr: '1100 - Cash / Stripe Clearing',
      netsuiteId: 'MAP-NS-6100',
      status: 'Verified Sync'
    },
    {
      event: 'Bad Debt Write-off / Dunning',
      trigger: 'Trigger: Final Dunning Exhaustion',
      dr: '6500 - Bad Debt Expense',
      cr: '1200 - Accounts Receivable (AR)',
      netsuiteId: 'MAP-NS-6500',
      status: 'Verified Sync'
    }
  ];

  return `
    <div class="flex flex-col w-full pb-12 animate-fade-in">
      <!-- Section Header -->
      <section class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">Tax & General Ledgers</h1>
            ${Badge({ text: 'AvaTax Engine Synced · 99.98% Match', variant: 'success', dot: true })}
            <span class="px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-caption-mono text-caption-mono text-[11px] font-semibold">ASC 606 / IFRS 15 Compliant</span>
          </div>
          <p class="font-body-md text-on-surface-variant max-w-4xl mt-1">
            Configure multi-jurisdiction sales tax automation, VAT/GST nexus thresholds, double-entry general ledger mappings, and GAAP revenue recognition schedules.
          </p>
        </div>

        <div class="flex items-center gap-2 flex-wrap shrink-0">
          ${Button({ label: 'Sync Tax Ledgers', icon: 'sync', variant: 'secondary' })}
          ${Button({ label: 'Export Audit Package', icon: 'file_download', variant: 'secondary' })}
          ${Button({ label: '+ Add Tax Nexus / Mapping', icon: 'add_location_alt', variant: 'primary' })}
        </div>
      </section>

      <!-- KPI Grid -->
      <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        ${MetricCard({
          title: 'Tax Accrued & Remitted',
          value: '$128,450.00',
          delta: '+9.2% QoQ',
          deltaType: 'positive',
          footerText: '<span>44 Jurisdictions Active</span><span class="text-tertiary font-semibold">99.98% Auto-calc</span>'
        })}

        ${MetricCard({
          title: 'Active Nexus Thresholds',
          value: '18 States & Hubs',
          delta: '3 Near Limit',
          deltaType: 'negative',
          progress: 88,
          footerText: '<span class="text-error font-medium">California (88%) · UK VAT (94%)</span>'
        })}

        ${MetricCard({
          title: 'ASC 606 RevRec Sync',
          value: '$1.42M',
          subvalue: '/ $4.38M Def',
          badgeText: 'Straight-Line',
          footerText: '<span>Recognition Waterfall in sync with NetSuite GL</span>'
        })}

        ${MetricCard({
          title: 'GL Reconciliation',
          value: '100% Reconciled',
          delta: '0 Exceptions',
          deltaType: 'positive',
          icon: 'task_alt',
          footerText: '<span class="text-tertiary font-semibold">Zero unmapped ledger journal entries</span>'
        })}
      </section>

      <!-- Sub-Navigation Tabs -->
      <nav class="flex items-center gap-2 overflow-x-auto pb-4 mb-2">
        <button class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-on-primary font-label-md font-semibold shadow-sm shrink-0">
          <span>Tax Jurisdictions & Nexus (Active)</span>
        </button>
        <button class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-on-surface font-label-md font-semibold shadow-sm shrink-0">
          <span>General Ledger Account Chart</span>
        </button>
        <button class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-on-surface font-label-md font-semibold shadow-sm shrink-0">
          <span>Revenue Recognition (ASC 606)</span>
        </button>
        <button class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-on-surface font-label-md font-semibold shadow-sm shrink-0">
          <span>Exemption Certificates (Avalara)</span>
        </button>
        <button class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-on-surface font-label-md font-semibold shadow-sm shrink-0">
          <span>Audit & Tax Filings</span>
        </button>
      </nav>

      <!-- Main Split Layout -->
      <section class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Left Column: Nexus Table & GL Matrix (8 cols) -->
        <div class="lg:col-span-8 flex flex-col gap-6">
          <!-- Nexus Table -->
          <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50 overflow-hidden">
            <div class="p-4 bg-surface-container-low flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[20px]">public</span>
                <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">Economic Nexus & Jurisdiction Monitoring</h2>
              </div>
              <span class="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-caption-mono text-[10px] font-bold">80% Proactive Alert Threshold</span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-surface-container-low text-secondary font-label-sm uppercase tracking-wider text-[11px]">
                    <th class="py-3 px-4 font-semibold">Jurisdiction & Region</th>
                    <th class="py-3 px-4 font-semibold">Statutory Rule</th>
                    <th class="py-3 px-4 font-semibold">Current Metric</th>
                    <th class="py-3 px-4 font-semibold">Nexus Status</th>
                    <th class="py-3 px-4 font-semibold text-right">Tax Rate / Method</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-surface-container text-body-sm text-on-surface">
                  ${nexusData.map(n => `
                    <tr class="hover:bg-surface-container-low/50 transition-colors">
                      <td class="py-3.5 px-4">
                        <div class="flex flex-col">
                          <span class="font-semibold text-on-surface">${n.jurisdiction}</span>
                          <span class="text-caption-mono text-[11px] text-secondary">Region: ${n.flag}</span>
                        </div>
                      </td>
                      <td class="py-3.5 px-4 text-secondary text-[12px]">${n.rule}</td>
                      <td class="py-3.5 px-4">
                        <div class="flex flex-col">
                          <span class="font-bold font-caption-mono">${n.current}</span>
                          <span class="text-caption-mono text-[10px] text-secondary">of ${n.threshold}</span>
                        </div>
                      </td>
                      <td class="py-3.5 px-4">
                        ${Badge({ text: n.status, variant: n.statusType, dot: true })}
                      </td>
                      <td class="py-3.5 px-4 text-right font-caption-mono text-[12px] text-secondary">${n.rate}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            <div class="p-3 bg-surface-container-low/40 border-t border-surface-container/40 flex justify-between items-center text-[12px] text-secondary">
              <span>Displaying 5 of 44 monitored taxing jurisdictions</span>
              <a href="#" class="text-primary font-semibold hover:underline">View All 44 Nexus Calculations &rarr;</a>
            </div>
          </div>

          <!-- General Ledger (GL) Double-Entry Mapping Matrix -->
          <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50 overflow-hidden">
            <div class="p-4 bg-surface-container-low flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[20px]">account_balance</span>
                <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">General Ledger (GL) Double-Entry Mapping Matrix</h2>
              </div>
              <div class="flex items-center gap-2">
                <button class="px-2.5 py-1 rounded bg-surface-container-lowest text-secondary text-[12px] font-semibold shadow-sm">Dry Run Batch</button>
                <button class="px-2.5 py-1 rounded bg-primary text-on-primary text-[12px] font-semibold shadow-sm">+ Add GL Rule</button>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-surface-container-low text-secondary font-label-sm uppercase tracking-wider text-[11px]">
                    <th class="py-3 px-4 font-semibold">Billing Trigger Event</th>
                    <th class="py-3 px-4 font-semibold">Debit (DR) Ledger</th>
                    <th class="py-3 px-4 font-semibold">Credit (CR) Ledger</th>
                    <th class="py-3 px-4 font-semibold">NetSuite ID</th>
                    <th class="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-surface-container text-body-sm text-on-surface">
                  ${glMatrix.map(gl => `
                    <tr class="hover:bg-surface-container-low/50 transition-colors">
                      <td class="py-3 px-4">
                        <div class="flex flex-col">
                          <span class="font-semibold text-on-surface">${gl.event}</span>
                          <span class="text-caption-mono text-[10px] text-secondary">${gl.trigger}</span>
                        </div>
                      </td>
                      <td class="py-3 px-4 font-caption-mono text-[12px] text-primary">${gl.dr}</td>
                      <td class="py-3 px-4 font-caption-mono text-[12px] text-secondary">${gl.cr}</td>
                      <td class="py-3 px-4">
                        <span class="px-2 py-0.5 rounded bg-surface-container font-caption-mono text-[11px] text-secondary font-semibold">${gl.netsuiteId}</span>
                      </td>
                      <td class="py-3 px-4 text-right">
                        <button class="text-primary hover:underline font-semibold text-[12px]">Test Post</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right Column: AvaTax, RevRec Engine, Upcoming Filings (4 cols) -->
        <div class="lg:col-span-4 flex flex-col gap-6">
          <!-- AvaTax Enterprise Card -->
          <div class="p-5 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50 flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="font-headline-sm text-[16px] font-bold text-on-surface">AvaTax Enterprise</span>
              ${Badge({ text: 'Connected & Real-Time', variant: 'success' })}
            </div>
            <div class="space-y-2 text-[12px] text-secondary">
              <div class="flex justify-between"><span>Default Avalara Tax Code:</span><strong class="font-caption-mono text-on-surface">DC010200 (SaaS / API)</strong></div>
              <div class="flex justify-between"><span>Address Normalization:</span><strong class="text-tertiary">USPS CASS Active</strong></div>
              <div class="flex justify-between"><span>B2B Exemption Validation:</span><strong class="text-on-surface">CertCapture Sync 99.4%</strong></div>
            </div>
            <button class="w-full mt-2 py-2 px-3 bg-surface-container hover:bg-surface-container-high text-primary font-label-md font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">terminal</span>
              <span>Test Tax Calculation Sandbox</span>
            </button>
          </div>

          <!-- ASC 606 RevRec Engine -->
          <div class="p-5 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50 flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="font-headline-sm text-[16px] font-bold text-on-surface">ASC 606 RevRec Engine</span>
              <span class="px-2 py-0.2 rounded-full bg-primary/10 text-primary font-caption-mono text-[10px] font-bold">Daily Straight-Line</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-caption-mono text-[11px] text-secondary">Current Cycle Recognized:</span>
              <span class="font-headline-lg text-[24px] font-bold text-on-surface tabular-nums">$482,920.00</span>
              <span class="text-caption-mono text-[11px] text-secondary">Pending Rev Waterfall (12): $3,960,180.00</span>
            </div>
            <div class="w-full h-2 bg-surface-container rounded-full overflow-hidden my-1">
              <div class="h-full bg-primary rounded-full" style="width: 28%;"></div>
            </div>
            <div class="flex justify-between text-caption-mono text-[11px] text-secondary">
              <span>28% Earned</span>
              <span>72% Unearned / Deferred</span>
            </div>
            <a href="#" class="text-label-md text-primary font-semibold hover:underline pt-1">View Interactive Waterfall Schedule &rarr;</a>
          </div>

          <!-- Upcoming Tax Filings -->
          <div class="p-5 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50 flex flex-col gap-3">
            <span class="font-headline-sm text-[16px] font-bold text-on-surface">Upcoming Tax Filings</span>
            <div class="space-y-2.5 text-[12px]">
              <div class="p-2.5 rounded-lg bg-surface-container-low flex justify-between items-center">
                <div>
                  <span class="font-semibold text-on-surface block">US State Monthly Returns</span>
                  <span class="text-caption-mono text-[10px] text-secondary">CA, NY, TX, WA filings</span>
                </div>
                <div class="text-right">
                  <span class="font-caption-mono text-tertiary font-bold block">Nov 20, 2024</span>
                  <span class="text-[10px] text-secondary">AvaTax Managed</span>
                </div>
              </div>

              <div class="p-2.5 rounded-lg bg-surface-container-low flex justify-between items-center">
                <div>
                  <span class="font-semibold text-on-surface block">EU VAT OSS Q3 Return</span>
                  <span class="text-caption-mono text-[10px] text-secondary">Revenue Ireland Hub</span>
                </div>
                <div class="text-right">
                  <span class="font-caption-mono text-error font-bold block">Oct 31, 2024</span>
                  <span class="text-[10px] text-secondary">Pending Review</span>
                </div>
              </div>
            </div>

            <button class="w-full mt-1 py-2 px-3 bg-surface-container hover:bg-surface-container-high text-primary font-label-md font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">download</span>
              <span>Download GAAP Package (Auditor ZIP)</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  `;
}
