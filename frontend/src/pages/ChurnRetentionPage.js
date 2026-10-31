/**
 * Churn & Retention Telemetry Page View
 * High-fidelity implementation matching Brightloop Churn & ML telemetry specs
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
      trigger: 'Dunning Failure (Code 2004) · Zero logins in 12 days',
      csm: 'Marcus Vance',
      playbook: 'Exec Escalation & Rescue',
      action: 'Launch Rescue',
      actionColor: 'bg-error text-on-error hover:bg-error/90'
    },
    {
      name: 'Synthetix Health',
      org: 'ORG-12093 · CUST-7712',
      arr: '$18,000',
      plan: 'Enterprise Core',
      score: 48,
      deltaScore: '-6 pts / 14d',
      trigger: 'Seat contraction requested · -45% API volume drop',
      csm: 'Rachel Diaz',
      playbook: 'Downsell Mitigation',
      action: 'Review Contract',
      actionColor: 'bg-surface-container hover:bg-surface-container-high text-primary'
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
      playbook: 'Exec Re-alignment',
      action: 'Exec Check-in',
      actionColor: 'bg-surface-container hover:bg-surface-container-high text-primary'
    },
    {
      name: 'Nexus Dynamics',
      org: 'ORG-2190 · CUST-2190',
      arr: '$38,400',
      plan: 'Platform Pro',
      score: 41,
      deltaScore: '-24 pts / 30d',
      trigger: 'Payment card expired · Competitor evaluation detected',
      csm: 'Marcus Vance',
      playbook: 'Renewal Concession',
      action: 'Offer Concession',
      actionColor: 'bg-primary hover:bg-primary-container text-on-primary'
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
      playbook: 'Upsell Expansion',
      action: 'View Analytics',
      actionColor: 'bg-surface-container hover:bg-surface-container-high text-primary'
    }
  ];

  return `
    <div class="flex flex-col w-full pb-12 animate-fade-in">
      <!-- Section Header -->
      <section class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">Churn & Retention Telemetry</h1>
            ${Badge({ text: 'Predictive ML Risk Scoring Active', variant: 'info', dot: true })}
            <span class="px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-caption-mono text-caption-mono text-[11px] font-bold">6 High-Risk Accounts</span>
            <span class="text-caption-mono text-[11px] text-secondary">Cohort Decay v4.2 Synced (14m ago) · Model confidence: 94.6%</span>
          </div>
          <p class="font-body-md text-on-surface-variant max-w-4xl mt-1">
            Real-time weights from API ingestion, user engagement drop-offs, dunning engine state, and empirical cohort retention curves.
          </p>
        </div>

        <div class="flex items-center gap-2 flex-wrap shrink-0">
          <select class="bg-surface-container-lowest text-on-surface font-label-md text-[12px] px-3 py-2 rounded-lg border border-outline-variant/30 shadow-sm focus:outline-none">
            <option>Cohort: Enterprise ($50k+ ARR)</option>
            <option>Cohort: Mid-Market Scale</option>
            <option>Cohort: Self-Serve Starter</option>
          </select>
          <div class="flex items-center p-1 bg-surface-container-low rounded-lg text-label-sm font-semibold">
            <button class="px-2 py-1 rounded bg-surface-container-lowest shadow-sm text-primary font-bold">30D</button>
            <button class="px-2 py-1 rounded text-secondary hover:text-on-surface">90D</button>
            <button class="px-2 py-1 rounded text-secondary hover:text-on-surface">YTD</button>
            <button class="px-2 py-1 rounded text-secondary hover:text-on-surface">12M</button>
          </div>
          ${Button({ label: 'Export CSV', icon: 'download', variant: 'secondary' })}
          ${Button({ label: 'Trigger Playbook', icon: 'bolt', variant: 'primary' })}
        </div>
      </section>

      <!-- KPI Grid -->
      <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
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
          footerText: '<span>QoQ Run-Rate: &lt;1.2%</span><span class="text-secondary font-medium">Industry Benchmark</span>'
        })}

        ${MetricCard({
          title: 'Revenue At-Risk',
          value: '$184,500',
          badgeText: '6 Accts',
          progress: 35,
          footerText: '<span class="text-error font-medium">Active Flagged 4.1% of ARR</span>'
        })}

        ${MetricCard({
          title: 'Churn Split (Root)',
          value: '72% / 28%',
          delta: 'Voluntary / Involuntary',
          deltaType: 'neutral',
          footerText: '<span>Smart Dunning Recovers 22%</span>'
        })}

        ${MetricCard({
          title: 'Expected Halflife',
          value: '4.8 Years',
          badgeText: '8.2m Payback',
          footerText: '<span>ACV: $48.5k</span><span class="text-tertiary font-semibold">LTV: $232.8k</span>'
        })}
      </section>

      <!-- Two-Column Telemetry & Cohort Decay Split -->
      <section class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-6">
        <!-- Left: Predictive Churn Early Warning Telemetry (7 cols) -->
        <div class="lg:col-span-7 bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-surface-container/50 flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">Predictive Churn Early Warning Telemetry</h2>
              <span class="font-caption-mono text-secondary text-[12px]">Updated 3m ago · Real-time weights from API ingestion & dunning engine</span>
            </div>
            <span class="material-symbols-outlined text-primary text-[22px]">radar</span>
          </div>

          <!-- Enterprise Accounts Distribution Bar -->
          <div class="p-3.5 rounded-xl bg-surface-container-low flex flex-col gap-2">
            <div class="flex justify-between items-center text-body-sm text-[13px]">
              <span class="font-semibold text-on-surface">Enterprise Accounts Distribution (3,842 Total)</span>
              <span class="text-caption-mono text-error font-semibold text-[11px]">Threshold: 50 pts critical</span>
            </div>
            <div class="w-full h-3 rounded-full flex overflow-hidden">
              <div class="bg-tertiary h-full" style="width: 84%;" title="Healthy (>75): 84%"></div>
              <div class="bg-amber-400 h-full" style="width: 11%;" title="Warning (50-75): 11%"></div>
              <div class="bg-error h-full" style="width: 5%;" title="Critical (<50): 5%"></div>
            </div>
            <div class="flex justify-between text-caption-mono text-[11px] text-secondary">
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-tertiary"></span> Healthy (&gt;75): 84%</span>
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-amber-400"></span> Warning (50-75): 11%</span>
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-error"></span> Critical (&lt;50): 5%</span>
            </div>
          </div>

          <!-- Risk Drivers & ML Signal Attribution List -->
          <div class="space-y-3 pt-1">
            <div class="flex items-center justify-between">
              <span class="font-label-sm uppercase tracking-wider text-secondary font-semibold">Leading Risk Drivers & ML Signal Attribution</span>
              <button class="text-label-sm text-primary font-semibold hover:underline">Adjust Model Hyperparameters</button>
            </div>

            <div class="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1.5 border-l-4 border-error">
              <div class="flex items-center justify-between">
                <span class="font-label-md font-semibold text-on-surface">API & Seat Inactivity (&gt;40% drop over 14d)</span>
                <span class="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-caption-mono text-[10px] font-bold">WEIGHT: 38% · CRITICAL ALERT</span>
              </div>
              <div class="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div class="h-full bg-error rounded-full" style="width: 38%;"></div>
              </div>
              <div class="flex justify-between text-caption-mono text-[11px] text-secondary">
                <span>Detected on 4 enterprise accounts this week</span>
                <span>Corr with churn: 0.89</span>
              </div>
            </div>

            <div class="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1.5 border-l-4 border-primary">
              <div class="flex items-center justify-between">
                <span class="font-label-md font-semibold text-on-surface">Executive Champion Departure / Admin Change</span>
                <span class="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-caption-mono text-[10px] font-bold">WEIGHT: 24% · HIGH IMPACT</span>
              </div>
              <div class="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div class="h-full bg-primary rounded-full" style="width: 24%;"></div>
              </div>
              <div class="flex justify-between text-caption-mono text-[11px] text-secondary">
                <span>Synced via Clearbit & SSO Activity Tracker</span>
                <span>Corr with churn: 0.74</span>
              </div>
            </div>

            <div class="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1.5 border-l-4 border-tertiary">
              <div class="flex items-center justify-between">
                <span class="font-label-md font-semibold text-on-surface">Recurring Billing Failures & Dunning Exhaustion</span>
                <span class="px-2 py-0.5 rounded-full bg-tertiary-container/10 text-tertiary font-caption-mono text-[10px] font-bold">WEIGHT: 22% · AUTOMATED RECOVERY</span>
              </div>
              <div class="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div class="h-full bg-tertiary rounded-full" style="width: 22%;"></div>
              </div>
              <div class="flex justify-between text-caption-mono text-[11px] text-secondary">
                <span>Routing to Smart Payment Dunning Engine</span>
                <span>Recovery success: 87%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Cohort Decay & Root-Cause Attribution (5 cols) -->
        <div class="lg:col-span-5 flex flex-col gap-4">
          <!-- Cohort Decay Curves -->
          <div class="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-surface-container/50 flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">SaaS Cohort Decay Curves</h2>
              <div class="flex items-center gap-1 p-0.5 bg-surface-container-low rounded text-[11px] font-semibold">
                <button class="px-2 py-0.5 rounded bg-surface-container-lowest text-primary shadow-sm">Logo %</button>
                <button class="px-2 py-0.5 text-secondary">NRR %</button>
              </div>
            </div>
            <p class="font-caption-mono text-secondary text-[12px]">Empirical retention curve across 24 lifecycle months</p>
            
            <!-- Visual CSS Representation of Retention Curve -->
            <div class="h-28 bg-surface-container-low/50 rounded-lg p-3 flex flex-col justify-between border border-surface-container/40">
              <div class="flex justify-between text-caption-mono text-[10px] text-secondary">
                <span>100%</span>
                <span>Month 6 (96%)</span>
                <span>Month 12 (93.4%)</span>
                <span>Month 24 (92.4%)</span>
              </div>
              <div class="w-full h-1 bg-surface-container rounded relative my-auto">
                <div class="absolute left-0 top-0 bottom-0 bg-primary rounded" style="width: 100%;"></div>
                <div class="w-2.5 h-2.5 rounded-full bg-primary absolute -top-[3px] left-[92%] ring-2 ring-white"></div>
              </div>
              <div class="flex justify-between items-center text-caption-mono text-[11px]">
                <span class="text-tertiary font-bold">Curve flattening at 92.4%</span>
                <span class="text-secondary">Q3 2024 Cohort</span>
              </div>
            </div>
          </div>

          <!-- Root-Cause Attribution Panel -->
          <div class="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-surface-container/50 flex flex-col gap-3">
            <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">Root-Cause Churn Attribution</h2>
            <p class="font-caption-mono text-secondary text-[12px]">Exited ARR breakdown ($182.5k total annualized loss)</p>
            <div class="space-y-2 pt-1 text-body-sm text-[13px]">
              <div class="flex justify-between items-center">
                <span class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-error"></span> Competitive Displacement</span>
                <span class="font-bold font-caption-mono">34% ($62,050 ARR)</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-secondary"></span> Budget Reallocation / Downsizing</span>
                <span class="font-bold font-caption-mono">28% ($51,100 ARR)</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-primary"></span> Involuntary / Dunning Failure</span>
                <span class="font-bold font-caption-mono">22% ($40,150 ARR)</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-outline"></span> Feature Gap & ERP Integration</span>
                <span class="font-bold font-caption-mono">16% ($29,200 ARR)</span>
              </div>
            </div>
            <div class="pt-2 border-t border-surface-container/40 flex justify-between text-caption-mono text-[11px]">
              <a href="#payments-dunning" class="text-primary font-semibold hover:underline">&lt;=&gt; Recoverable via Dunning: $40,150</a>
              <span class="text-secondary">Inspect Failures &rarr;</span>
            </div>
          </div>
        </div>
      </section>

      <!-- High-Priority At-Risk Accounts Table -->
      <section class="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50 overflow-hidden">
        <div class="p-4 bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-error text-[20px]">warning</span>
            <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">High-Priority At-Risk Accounts & Intervention Ledger</h2>
          </div>
          <span class="text-caption-mono text-[12px] text-secondary">Accounts flagged with ML Health Score &lt; 60/100 or immediate dunning failure risk</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-container-low text-secondary font-label-sm uppercase tracking-wider text-[11px]">
                <th class="py-3 px-4 font-semibold">Account & Org</th>
                <th class="py-3 px-4 font-semibold">ARR & Plan</th>
                <th class="py-3 px-4 font-semibold">Health Score</th>
                <th class="py-3 px-4 font-semibold">Primary Risk Trigger</th>
                <th class="py-3 px-4 font-semibold">Assigned CSM</th>
                <th class="py-3 px-4 font-semibold">Automated Playbook</th>
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
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-caption-mono text-[11px] font-bold ${
                      acct.score >= 70 ? 'bg-tertiary-container/10 text-tertiary' : 'bg-error-container text-on-error-container'
                    }">
                      ${acct.score} / 100 (${acct.deltaScore})
                    </span>
                  </td>
                  <td class="py-3.5 px-4 text-secondary text-[12px]">
                    ${acct.trigger}
                  </td>
                  <td class="py-3.5 px-4 text-secondary text-[12px] font-medium">
                    ${acct.csm}
                  </td>
                  <td class="py-3.5 px-4">
                    <span class="inline-flex items-center gap-1 font-caption-mono text-[11px] text-primary">
                      <span class="material-symbols-outlined text-[14px]">auto_fix_high</span>
                      ${acct.playbook}
                    </span>
                  </td>
                  <td class="py-3.5 px-4 text-right">
                    <button class="px-3 py-1 rounded font-label-md font-semibold transition-all ${acct.actionColor} text-[12px] shadow-sm">
                      ${acct.action}
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div class="p-3 bg-surface-container-low/40 border-t border-surface-container/40 flex justify-between items-center text-[12px] text-secondary">
          <span>Showing 5 of 6 flagged enterprise accounts</span>
          <span class="font-bold text-error">$184,500 Total ARR Exposure</span>
        </div>
      </section>
    </div>
  `;
}

// Interactive handlers for ChurnRetentionPage
document.addEventListener('page:rendered', (e) => {
  if (e.detail.route !== 'churn-retention') return;

  // Interventions in table
  document.querySelectorAll('#page-content table button').forEach(btn => {
    btn.addEventListener('click', async () => {
      const actionName = btn.innerText.trim();
      const accountName = btn.closest('tr')?.querySelector('span.font-semibold')?.innerText || 'Account';
      const { toast } = await import('../components/common/Toast.js');
      toast.info(`Playbook "${actionName}" dispatched for ${accountName}. Assigned CSM alerted.`);
    });
  });
});
