/**
 * Tax & General Ledgers / Payments & Dunning Page View
 */

import { MetricCard } from '../components/metrics/MetricCard.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';

export async function TaxLedgersPage() {
  const nexusJurisdictions = [
    { region: 'California (CDTFA)', type: 'Economic Sales', threshold: '$500,000 / Yr', current: '$440,290', pct: '88.0%', status: 'Warning: Near Limit', rate: '7.25% - 10.25%' },
    { region: 'New York (NYS DTF)', type: '$500k & 100 Tx', threshold: '$500,000 + 100 tx', current: '$612,400', pct: 'Exceeded', status: 'Registered & Remitting', rate: '8.875% NYC' },
    { region: 'European Union (OSS)', type: 'Pan-EU Hub', threshold: '€10,000 Pan-EU', current: '€184,300', pct: 'Active', status: 'Active OSS Registered', rate: '19% - 27%' },
    { region: 'United Kingdom (HMRC)', type: 'Making Tax Digital API', threshold: '£85,000 / Yr', current: '£79,900', pct: '94.0%', status: 'Auto-Remitted Qtly', rate: '20.00% Standard VAT' },
    { region: 'Canada (GST / HST)', type: 'Federal CRA Digital', threshold: 'CAD $30,000 / 12 mo', current: 'CAD $18,400', pct: '61.3%', status: 'Threshold Pending', rate: '5% - 15% Harmonized' }
  ];

  return `
    <div class="flex flex-col w-full pb-12">
      <!-- Section Header -->
      <section class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">Tax & General Ledgers</h1>
            ${Badge({ text: 'AvaTax Sync: 99.98% Match', variant: 'success', dot: true })}
            ${Badge({ text: 'ASC 606 / IFRS 15 Compliant', variant: 'info' })}
          </div>
          <p class="font-body-md text-on-surface-variant mt-1">
            Configure multi-jurisdiction sales tax automation, VAT/GST nexus thresholds, double-entry general ledger mappings, and GAAP revenue recognition schedules.
          </p>
        </div>

        <div class="flex items-center gap-2">
          ${Button({ label: 'Sync Tax Ledgers', icon: 'sync', variant: 'secondary' })}
          ${Button({ label: 'Export Audit Package', icon: 'file_download', variant: 'secondary' })}
          ${Button({ label: '+ Add Tax Nexus', icon: 'add_location', variant: 'primary' })}
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

      <!-- Economic Nexus Table -->
      <section class="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50 overflow-hidden mb-6">
        <div class="p-4 bg-surface-container-low flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[20px]">public</span>
            <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">Economic Nexus & Jurisdiction Monitoring</h2>
          </div>
          <span class="text-caption-mono text-[12px] text-secondary">Displaying 5 of 44 monitored taxing jurisdictions</span>
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
              ${nexusJurisdictions.map(n => `
                <tr class="hover:bg-surface-container-low/50 transition-colors">
                  <td class="py-3.5 px-4 font-semibold text-on-surface">${n.region}</td>
                  <td class="py-3.5 px-4 text-secondary text-[12px]">${n.type}</td>
                  <td class="py-3.5 px-4 font-caption-mono font-bold">${n.current}</td>
                  <td class="py-3.5 px-4">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-label-sm font-semibold ${
                      n.pct === 'Exceeded' || n.pct === 'Active'
                        ? 'bg-tertiary-container/10 text-tertiary'
                        : 'bg-error-container text-on-error-container'
                    }">
                      ${n.status}
                    </span>
                  </td>
                  <td class="py-3.5 px-4 text-right font-caption-mono text-secondary">${n.rate}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

