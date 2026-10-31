/**
 * Products & Plans Catalog Page View
 * High-fidelity implementation for Plan Tiering, Add-ons & Coupons CPQ
 */

import { MetricCard } from '../components/metrics/MetricCard.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';

export async function ProductsPlansPage() {
  const plans = [
    {
      name: 'Starter Cloud',
      tier: 'Tier 1',
      priceAnnual: '$990',
      priceMonthly: '$1,190',
      desc: 'Core subscription billing, unified customer directory, standard invoices, and automated credit card processing.',
      badge: 'Self-Serve',
      badgeColor: 'neutral',
      seats: 'Up to 10 Seats',
      apiQuota: '100,000 req / mo',
      gateways: 'Stripe Credit Card',
      support: 'Standard Email SLA',
      activeCount: '320 Active Tenants'
    },
    {
      name: 'Growth Pro',
      tier: 'Tier 2',
      priceAnnual: '$3,450',
      priceMonthly: '$3,950',
      desc: 'Full automated CPQ, dunning cadence engine, Avalara multi-state sales tax calculations, and volume discounts.',
      badge: 'Most Popular',
      badgeColor: 'info',
      featured: true,
      seats: 'Up to 50 Seats & RBAC',
      apiQuota: '5,000,000 req / mo',
      gateways: 'Stripe + ACH / SEPA',
      support: 'Priority 24/7 SLA',
      activeCount: '680 Active Tenants (+14%)'
    },
    {
      name: 'Enterprise Infinite',
      tier: 'Tier 3',
      priceAnnual: '$24,500',
      priceMonthly: '$2,450',
      desc: 'Unlimited enterprise seats, multi-entity NetSuite ERP sync, dedicated webhook pipelines, Okta SCIM, and 99.99% SLA.',
      badge: 'Global Scale',
      badgeColor: 'success',
      seats: 'Unlimited Provisioning',
      apiQuota: 'Unlimited Metered Usage',
      gateways: 'Global Gateways + NetSuite GL',
      support: 'Dedicated CSM & Solutions Eng',
      activeCount: '420 Enterprise Accounts'
    }
  ];

  return `
    <div class="flex flex-col w-full pb-12 animate-fade-in">
      <!-- Header -->
      <section class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">Products, Plans & Pricing CPQ</h1>
            ${Badge({ text: 'Catalog Sync Active', variant: 'success', dot: true })}
            <span class="px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-caption-mono text-caption-mono text-[11px] font-semibold">3 Active Tiers</span>
          </div>
          <p class="font-body-md text-on-surface-variant max-w-4xl mt-1">
            Configure multi-currency plan packaging, seat entitlement allowances, usage rate cards, coupons, and automated promotional rules.
          </p>
        </div>

        <div class="flex items-center gap-2 flex-wrap shrink-0">
          ${Button({ label: 'Coupon & Discount Rules', icon: 'sell', variant: 'secondary' })}
          ${Button({ label: '+ Add New Plan Tier', icon: 'add_circle', variant: 'primary' })}
        </div>
      </section>

      <!-- KPI Grid -->
      <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        ${MetricCard({
          title: 'Total Active Subscribers',
          value: '1,420',
          delta: '+34 this month',
          deltaType: 'positive',
          footerText: '<span>Self-Serve: 320 · Pro: 680 · Ent: 420</span>'
        })}

        ${MetricCard({
          title: 'Average Revenue Per User (ARPU)',
          value: '$1,085.50',
          subvalue: '/ mo',
          delta: '+8.2% YoY',
          deltaType: 'positive',
          footerText: '<span>Annualized ACV: $13,026</span>'
        })}

        ${MetricCard({
          title: 'Add-on Expansion Revenue',
          value: '$34,800.00',
          delta: '28 Active Add-ons',
          deltaType: 'positive',
          icon: 'add_box',
          footerText: '<span class="text-tertiary font-semibold">+18.4% Net Expansion</span>'
        })}

        ${MetricCard({
          title: 'Active Promotion Codes',
          value: '8 Coupons',
          badgeText: 'Avalara Tax Exempt',
          footerText: '<span>Max Discount Cap: 20%</span>'
        })}
      </section>

      <!-- Plan Cards Grid -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        ${plans.map(p => `
          <div class="p-6 bg-surface-container-lowest rounded-xl shadow-sm border ${p.featured ? 'border-2 border-primary ring-4 ring-primary/10' : 'border-surface-container/60'} flex flex-col justify-between hover:shadow-md transition-all relative">
            ${p.featured ? `<span class="absolute -top-3 right-5 px-2.5 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-[10px] font-bold uppercase tracking-wider shadow-sm">Featured</span>` : ''}
            <div>
              <div class="flex justify-between items-start">
                <div>
                  <span class="font-label-sm uppercase tracking-wider text-secondary font-semibold">${p.tier}</span>
                  <h3 class="font-headline-sm text-[20px] font-bold text-on-surface mt-0.5">${p.name}</h3>
                </div>
                ${Badge({ text: p.badge, variant: p.badgeColor })}
              </div>

              <div class="flex items-baseline gap-1 mt-4 mb-3">
                <span class="font-headline-lg text-[32px] font-bold ${p.featured ? 'text-primary' : 'text-on-surface'} tabular-nums">${p.priceAnnual}</span>
                <span class="text-body-sm text-secondary font-medium">/ year</span>
              </div>
              <p class="font-body-sm text-on-surface-variant text-[13px] mb-4">${p.desc}</p>

              <div class="space-y-2 pt-3 border-t border-surface-container/40 text-[13px]">
                <div class="flex items-center gap-2 text-on-surface">
                  <span class="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
                  <span>${p.seats}</span>
                </div>
                <div class="flex items-center gap-2 text-on-surface">
                  <span class="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
                  <span>${p.apiQuota}</span>
                </div>
                <div class="flex items-center gap-2 text-on-surface">
                  <span class="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
                  <span>${p.gateways}</span>
                </div>
                <div class="flex items-center gap-2 text-on-surface">
                  <span class="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
                  <span>${p.support}</span>
                </div>
              </div>
            </div>

            <div class="mt-6 pt-4 border-t border-surface-container/40 flex items-center justify-between">
              <span class="text-caption-mono text-[12px] text-secondary">${p.activeCount}</span>
              <button class="px-3.5 py-1.5 rounded-lg ${p.featured ? 'bg-primary text-on-primary hover:bg-primary-container' : 'bg-surface-container text-primary hover:bg-surface-container-high'} font-label-md font-semibold transition-colors">Configure</button>
            </div>
          </div>
        `).join('')}
      </section>
    </div>
  `;
}

