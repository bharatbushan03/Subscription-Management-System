/**
 * Webhooks & Developer API Page View
 * High-fidelity implementation for API Keys, Webhook pipelines & Developer tooling
 */

import { MetricCard } from '../components/metrics/MetricCard.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';

export async function WebhooksApiPage() {
  const endpoints = [
    {
      id: 'ep_prod_01',
      url: 'https://api.brightloop.io/webhooks/billing-events',
      events: ['invoice.paid', 'subscription.created', 'customer.updated'],
      status: 'active',
      successRate: '99.98%',
      lastTrigger: '2m ago'
    },
    {
      id: 'ep_prod_02',
      url: 'https://erp.internal.omniflow.com/netsuite/sync',
      events: ['invoice.payment_failed', 'customer.dunning_escalation'],
      status: 'active',
      successRate: '98.4%',
      lastTrigger: '14m ago'
    },
    {
      id: 'ep_staging_03',
      url: 'https://staging.brightloop.io/hooks/test-suite',
      events: ['* (All events)'],
      status: 'paused',
      successRate: '100%',
      lastTrigger: '2d ago'
    }
  ];

  return `
    <div class="flex flex-col w-full pb-12 animate-fade-in">
      <!-- Header -->
      <section class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">Webhooks & Developer APIs</h1>
            ${Badge({ text: 'REST API v1.4 Active', variant: 'info', dot: true })}
            <span class="px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-caption-mono text-caption-mono text-[11px] font-semibold">99.99% Uptime</span>
          </div>
          <p class="font-body-md text-on-surface-variant max-w-4xl mt-1">
            Manage live webhook endpoints, rotate HMAC-SHA256 signing secrets, provision scoped API tokens, and dispatch test payloads.
          </p>
        </div>

        <div class="flex items-center gap-2 flex-wrap shrink-0">
          ${Button({ label: 'Open API Reference (Swagger)', icon: 'menu_book', variant: 'secondary' })}
          ${Button({ label: '+ Add Webhook Endpoint', icon: 'add_link', variant: 'primary' })}
        </div>
      </section>

      <!-- KPI Grid -->
      <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        ${MetricCard({
          title: 'Total Monthly Ingestion',
          value: '4,285,100',
          subvalue: 'requests',
          delta: '+12.4% MoM',
          deltaType: 'positive',
          footerText: '<span>42% of 10M Enterprise Quota</span>'
        })}

        ${MetricCard({
          title: 'Average Latency',
          value: '42ms',
          delta: 'p99: 110ms',
          deltaType: 'positive',
          icon: 'speed',
          footerText: '<span>US-East-1 AWS Gateway</span>'
        })}

        ${MetricCard({
          title: 'Webhook Success Delivery',
          value: '99.98%',
          delta: '0 Failed Retries',
          deltaType: 'positive',
          badgeText: '20 Active Pipelines',
          footerText: '<span class="text-tertiary font-semibold">Auto Exponential Backoff</span>'
        })}

        ${MetricCard({
          title: 'Provisioned API Tokens',
          value: '8 Keys',
          badgeText: 'HMAC-SHA256',
          footerText: '<span>Last Rotated: 3h ago</span>'
        })}
      </section>

      <!-- Endpoints Table -->
      <section class="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50 overflow-hidden mb-6">
        <div class="p-4 bg-surface-container-low flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[20px]">webhook</span>
            <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">Registered Webhook Pipelines</h2>
          </div>
          <button class="px-2.5 py-1 rounded bg-primary text-on-primary text-[12px] font-semibold shadow-sm">+ Register URL</button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-container-low text-secondary font-label-sm uppercase tracking-wider text-[11px]">
                <th class="py-3 px-4 font-semibold">Endpoint ID & Target URL</th>
                <th class="py-3 px-4 font-semibold">Subscribed Events</th>
                <th class="py-3 px-4 font-semibold">Delivery Health</th>
                <th class="py-3 px-4 font-semibold">Last Delivery</th>
                <th class="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-container text-body-sm text-on-surface">
              ${endpoints.map(ep => `
                <tr class="hover:bg-surface-container-low/50 transition-colors">
                  <td class="py-3.5 px-4">
                    <div class="flex flex-col">
                      <span class="font-bold text-on-surface font-caption-mono">${ep.url}</span>
                      <span class="text-caption-mono text-[11px] text-secondary">${ep.id}</span>
                    </div>
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="flex flex-wrap gap-1">
                      ${ep.events.map(ev => `<span class="px-2 py-0.5 rounded bg-surface-container font-caption-mono text-[10px] text-secondary">${ev}</span>`).join('')}
                    </div>
                  </td>
                  <td class="py-3.5 px-4">
                    <span class="inline-flex items-center gap-1 font-caption-mono text-tertiary font-bold text-[12px]">
                      <span class="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
                      ${ep.successRate}
                    </span>
                  </td>
                  <td class="py-3.5 px-4 text-secondary text-[12px] font-caption-mono">${ep.lastTrigger}</td>
                  <td class="py-3.5 px-4 text-right">
                    <div class="inline-flex items-center gap-1">
                      <button class="px-2.5 py-1 text-primary hover:bg-surface-container rounded font-label-md text-[12px] font-semibold transition-colors">Send Test Ping</button>
                      <button class="p-1 text-secondary hover:text-on-surface rounded"><span class="material-symbols-outlined text-[18px]">more_vert</span></button>
                    </div>
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

// Interactive handlers for WebhooksApiPage
document.addEventListener('page:rendered', (e) => {
  if (e.detail.route !== 'webhooks-api') return;

  // Send Test Ping
  document.querySelectorAll('#page-content table button').forEach(btn => {
    if (btn.innerText.includes('Send Test Ping')) {
      btn.addEventListener('click', async () => {
        const { toast } = await import('../components/common/Toast.js');
        btn.textContent = 'Pinging...';
        setTimeout(() => {
          btn.textContent = 'Send Test Ping';
          toast.success('Test webhook event "billing.test_ping" delivered (HTTP 200 OK - 38ms).');
        }, 600);
      });
    }
  });

  // Register URL
  document.querySelectorAll('button').forEach(btn => {
    if (btn.innerText.includes('+ Register URL') || btn.innerText.includes('+ Register Endpoint')) {
      btn.addEventListener('click', async () => {
        const { promptDialog, toast } = await import('../components/common/Toast.js');
        const url = await promptDialog({
          title: 'Register Webhook Endpoint',
          message: 'Enter HTTPS endpoint destination for subscription and invoice events:',
          placeholder: 'https://api.yourdomain.com/webhooks'
        });
        if (url) {
          toast.success(`Webhook endpoint registered: ${url}`);
        }
      });
    }
  });
});

