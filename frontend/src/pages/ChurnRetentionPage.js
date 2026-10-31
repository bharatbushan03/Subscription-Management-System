/**
 * Churn & Retention Telemetry Page View
 */

import { MetricCard } from '../components/metrics/MetricCard.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';

export async function ChurnRetentionPage() {
  const atRiskAccounts = [
    {
      name: 'OmniFlow Logistics',
      org: 'ORG-12093 · CUST-4481',
      arr: '$24,500',
      plan: 'Scale Annual',
      score: 32,
      deltaScore: '-18 pts / 7d',
      trigger: 'Dunning Failure (Code 2004) · Zero logins 12d',
      csm: 'Marcus Vance',
      action: 'Launch Rescue'
    },
    {
      name: 'Synthetix Health',
      org: 'ORG-12093 · CUST-7712',
      arr: '$18,000',
      plan: 'Enterprise Core',
      score: 48,
      deltaScore: '-6 pts / 14d',
      trigger: 'Seat contraction requested · -45% API volume',
      csm: 'Rachel Diaz',
      action: 'Review Contract'
    },
    {
      name: 'DataPulse Analytics',
      org: 'ORG-3109 · CUST-5120',
      arr: '$92,000',
      plan: 'Enterprise Custom',
      score: 56,
      deltaScore: 'Stagnant',
      trigger: 'VP Engineering Departure · Avalara tax webhook errors',
      csm: 'Elena Vance',
      action: 'Exec Check-in'
    },
    {
      name: 'HyperScale Technologies',
      org: 'ORG-88215 · CUST-1049',
      arr: '$240,000',
      plan: 'Enterprise Infinite',
      score: 92,
      deltaScore: '+8 pts',
      trigger: 'Renewed & Expanding · +60 seats added last week',
      csm: 'Elena Vance',
      action: 'Upsell Expansion'
    }
  ];

  return `
    <div class="flex flex-col w-full pb-12">
      <!-- Section Header -->
      <section class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">Churn & Retention Telemetry</h1>
            ${Badge({ text: 'Predictive ML Risk Scoring Active', variant: 'info', dot: true })}
            <span class="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-caption-mono text-caption-mono text-[11px] font-bold">6 High-Risk Accounts</span>
          </div>
          <p class="font-body-md text-on-surface-variant mt-1">
            Empirical cohort decay curves, ML risk signal attributions, and real-time automated intervention playbooks.
          </p>
        </div>

        <div class="flex items-center gap-2">
          ${Button({ label: 'Export Risk CSV', icon: 'download', variant: 'secondary' })}
          ${Button({ label: 'Trigger Playbook', icon: 'bolt', variant: 'primary' })}
        </div>
      </section>

      <!-- KPI Grid -->
      <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        ${MetricCard({
          title: 'Net Logo Retention',
          value: '95.8%',
          delta: '+1.4%',
          deltaType: 'positive',
          badgeText: 'Tier 1',
          footerText: '<span>3,680 / 3,842 logos</span><span class="text-tertiary font-semibold">&gt;92% Benchmark</span>'
        })}

        ${MetricCard({
          title: 'Gross Logo Churn',
          value: '0.82%',
          subvalue: '/ mo',
          delta: '-0.15%',
          deltaType: 'positive',
          badgeText: 'Top 25%',
          footerText: '<span>QoQ Run-Rate: 2.4%</span><span class="text-secondary">&lt;1.2% Industry</span>'
        })}

        ${MetricCard({
          title: 'Revenue At-Risk',
          value: '$184,500',
          delta: '6 Accts Flagged',
          deltaType: 'negative',
          progress: 35,
          footerText: '<span class="text-error font-medium">Active Flagged 4.1% of cohort ARR</span>'
        })}

        ${MetricCard({
          title: 'Expected Half-life',
          value: '4.8 Years',
          badgeText: '8.2m Payback',
          footerText: '<span>ACV: $48.5k</span><span class="text-tertiary font-semibold">LTV: $232.8k</span>'
        })}
      </section>

      <!-- Early Warning & Cohort Decay Split -->
      <section class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-6">
        <!-- Early Warning Attribution (7 cols) -->
        <div class="lg:col-span-7 bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-surface-container/50 flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">Predictive Churn Early Warning Telemetry</h2>
              <p class="font-caption-mono text-secondary text-[12px]">Real-time weights from API ingestion, user engagement drop-offs, and dunning engine state</p>
            </div>
            <span class="material-symbols-outlined text-primary text-[22px]">radar</span>
          </div>

          <div class="space-y-3 pt-2">
            <div class="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1.5">
              <div class="flex items-center justify-between">
                <span class="font-label-md font-semibold text-on-surface">API & Seat Inactivity (&gt;40% drop over 14d)</span>
                <span class="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-caption-mono text-[10px] font-bold">WEIGHT: 38% · CRITICAL</span>
              </div>
              <div class="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div class="h-full bg-error rounded-full" style="width: 38%;"></div>
              </div>
              <span class="text-caption-mono text-[11px] text-secondary">Detected on 4 enterprise accounts this week · Corr with churn: 0.89</span>
            </div>

            <div class="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1.5">
              <div class="flex items-center justify-between">
                <span class="font-label-md font-semibold text-on-surface">Executive Champion Departure / Admin Change</span>
                <span class="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-caption-mono text-[10px] font-bold">WEIGHT: 24% · HIGH IMPACT</span>
              </div>
              <div class="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div class="h-full bg-primary rounded-full" style="width: 24%;"></div>
              </div>
              <span class="text-caption-mono text-[11px] text-secondary">Synced via Clearbit & SSO Activity Tracker</span>
            </div>

            <div class="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1.5">
              <div class="flex items-center justify-between">
                <span class="font-label-md font-semibold text-on-surface">Recurring Billing Failures & Dunning Exhaustion</span>
                <span class="px-2 py-0.5 rounded-full bg-tertiary-container/10 text-tertiary font-caption-mono text-[10px] font-bold">WEIGHT: 22% · RECOVERING</span>
              </div>
              <div class="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div class="h-full bg-tertiary rounded-full" style="width: 22%;"></div>
              </div>
              <span class="text-caption-mono text-[11px] text-secondary">Routing to Smart Payment Dunning Engine · Success: 87%</span>
            </div>
          </div>
        </div>

        <!-- Cohort Decay & Root-Cause (5 cols) -->
        <div class="lg:col-span-5 flex flex-col gap-4">
          <div class="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-surface-container/50 flex flex-col gap-3">
            <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">Root-Cause Churn Attribution</h2>
            <p class="font-caption-mono text-secondary text-[12px]">Exited ARR breakdown ($182.5k total annualized loss)</p>
            <div class="space-y-2 pt-1 text-body-sm">
              <div class="flex justify-between items-center">
                <span class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-error"></span> Competitive Displacement</span>
                <span class="font-bold font-caption-mono">34% ($62,050)</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-secondary"></span> Budget Downsizing</span>
                <span class="font-bold font-caption-mono">28% ($51,100)</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-primary"></span> Involuntary Dunning Failure</span>
                <span class="font-bold font-caption-mono">22% ($40,150)</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-outline"></span> Feature Gap & Integration</span>
                <span class="font-bold font-caption-mono">16% ($29,200)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- High Priority At-Risk Accounts Table -->
      <section class="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50 overflow-hidden">
        <div class="p-4 bg-surface-container-low flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-error text-[20px]">warning</span>
            <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">High-Priority At-Risk Accounts & Intervention Ledger</h2>
          </div>
          <span class="text-caption-mono text-[12px] text-secondary">Accounts flagged with ML Health Score &lt; 60/100</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-container-low text-secondary font-label-sm uppercase tracking-wider text-[11px]">
                <th class="py-3 px-4 font-semibold">Account & Org</th>
                <th class="py-3 px-4 font-semibold">ARR & Plan</th>
                <th class="py-3 px-4 font-semibold">Health Score</th>
                <th class="py-3 px-4 font-semibold">Primary Risk Trigger</th>
                <th class="py-3 px-4 font-semibold">CSM</th>
                <th class="py-3 px-4 font-semibold text-right">Intervention</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-container text-body-sm text-on-surface">
              ${atRiskAccounts.map(acct => `
                <tr class="hover:bg-surface-container-low/50 transition-colors">
                  <td class="py-3.5 px-4">
                    <div class="flex flex-col">
                      <span class="font-semibold text-on-surface">${acct.name}</span>
                      <span class="font-caption-mono text-[11px] text-secondary">${acct.org}</span>
                    </div>
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="flex flex-col">
                      <span class="font-bold tabular-nums">${acct.arr}</span>
                      <span class="font-caption-mono text-[11px] text-secondary">${acct.plan}</span>
                    </div>
                  </td>
                  <td class="py-3.5 px-4">
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-caption-mono text-[11px] font-bold ${
                      acct.score >= 70 ? 'bg-tertiary-container/10 text-tertiary' : 'bg-error-container text-on-error-container'
                    }">
                      ${acct.score} / 100 (${acct.deltaScore})
                    </span>
                  </td>
                  <td class="py-3.5 px-4 text-secondary text-[12px]">
                    ${acct.trigger}
                  </td>
                  <td class="py-3.5 px-4 text-secondary text-[12px]">
                    ${acct.csm}
                  </td>
                  <td class="py-3.5 px-4 text-right">
                    <button class="px-2.5 py-1 text-primary hover:bg-surface-container rounded font-label-md font-semibold transition-colors">
                      ${acct.action}
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

