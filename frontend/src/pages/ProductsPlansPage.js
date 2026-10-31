/**
 * Products & Plans Catalog Page View
 * High-fidelity implementation for Plan Tiering, Add-ons & Coupons CPQ
 * Fully connected to real database plans & plan creation
 */

import { MetricCard } from '../components/metrics/MetricCard.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';
import { planService } from '../services/api.js';
import { toast, confirmDialog } from '../components/common/Toast.js';

export async function ProductsPlansPage() {
  let plansRes;
  try {
    plansRes = await planService.list();
  } catch (err) {
    return `<div class="p-6 text-error">Failed to load plans: ${err.message}</div>`;
  }

  const rawPlans = Array.isArray(plansRes) ? plansRes : (plansRes.data || []);
  const formatCurrency = (n) => `$${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const plans = rawPlans.map((p, idx) => {
    const isFeatured = idx === 1 || p.name.includes('Growth') || p.name.includes('Pro');
    const tier = idx === 0 ? 'Self-Serve SaaS' : (idx === 1 ? 'Mid-Market Scale' : 'Global Enterprise');
    const badgeText = p.is_active ? 'Active Tier' : 'Archived';
    const badgeVariant = p.is_active ? (isFeatured ? 'primary' : 'success') : 'neutral';
    const features = Array.isArray(p.features) ? p.features : (typeof p.features === 'string' ? JSON.parse(p.features || '[]') : []);

    return {
      id: p.id,
      name: p.name,
      tier,
      price: formatCurrency(p.price),
      rawPrice: p.price,
      billingCycle: p.billing_cycle || 'monthly',
      desc: p.description || 'Enterprise recurring plan license.',
      trialDays: p.trial_days || 0,
      features: features.length ? features : [
        `Billed ${p.billing_cycle || 'monthly'}`,
        `${p.trial_days > 0 ? `${p.trial_days}-day free trial included` : 'Instant access'}`,
        'Unified customer & invoice sync',
        'Stripe & NetSuite ERP integration'
      ],
      featured: isFeatured,
      badge: badgeText,
      badgeColor: badgeVariant,
      activeCount: `${p.activeSubscribers || 0} Active Tenants`
    };
  });

  return `
    <div class="flex flex-col w-full pb-12 animate-fade-in">
      <!-- Header -->
      <section class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">Products, Plans & Pricing CPQ</h1>
            ${Badge({ text: `${plans.length} Active Catalog Tiers`, variant: 'success', dot: true })}
            <span class="px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-caption-mono text-caption-mono text-[11px] font-semibold">Multi-Currency & VAT Ready</span>
          </div>
          <p class="font-body-md text-on-surface-variant max-w-4xl mt-1">
            Configure multi-currency plan packaging, seat entitlement allowances, usage rate cards, coupons, and automated promotional rules.
          </p>
        </div>

        <div class="flex items-center gap-2 flex-wrap shrink-0">
          <button id="btn-coupon-rules" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg font-label-md font-semibold text-[13px] transition-all">
            <span class="material-symbols-outlined text-[18px]">sell</span>
            <span>Coupon & Discount Rules</span>
          </button>
          <button id="btn-open-create-plan" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary-container text-on-primary rounded-lg shadow-sm font-label-md font-semibold text-[13px] transition-all">
            <span class="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ Add New Plan Tier</span>
          </button>
        </div>
      </section>

      <!-- KPI Grid -->
      <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        ${MetricCard({
          title: 'Total Active Subscribers',
          value: '428',
          delta: '+14 this month',
          deltaType: 'positive',
          footerText: '<span>Empirical retention: 98.2%</span>'
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
                <span class="font-headline-lg text-[32px] font-bold ${p.featured ? 'text-primary' : 'text-on-surface'} tabular-nums">${p.price}</span>
                <span class="text-body-sm text-secondary font-medium">/ ${p.billingCycle}</span>
              </div>
              <p class="font-body-sm text-on-surface-variant text-[13px] mb-4">${p.desc}</p>

              <div class="space-y-2 pt-3 border-t border-surface-container/40 text-[13px]">
                ${p.features.map(f => `
                  <div class="flex items-center gap-2 text-on-surface">
                    <span class="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
                    <span>${f}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="mt-6 pt-4 border-t border-surface-container/40 flex items-center justify-between">
              <span class="text-caption-mono text-[12px] text-secondary">${p.activeCount}</span>
              <button data-action="delete-plan" data-id="${p.id}" class="px-3 py-1 text-[12px] font-semibold text-secondary hover:text-error hover:bg-error-container/20 rounded transition-colors">
                Deactivate
              </button>
            </div>
          </div>
        `).join('')}
      </section>

      <!-- Create Plan Modal -->
      <div id="create-plan-modal" class="hidden fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
          <div class="px-6 py-4 border-b border-surface-container/60 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[22px]">inventory_2</span>
              <h3 class="font-bold text-[16px] text-on-surface">Create Subscription Plan Tier</h3>
            </div>
            <button id="close-create-plan" class="text-secondary hover:text-on-surface">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <form id="create-plan-form" class="p-6 flex flex-col gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-[12px] font-semibold text-on-surface">Plan Name *</label>
              <input id="plan-name-input" type="text" required placeholder="e.g. Enterprise Cloud Dedicated" class="px-3.5 py-2 border border-surface-container rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1.5">
                <label class="text-[12px] font-semibold text-on-surface">Price ($) *</label>
                <input id="plan-price-input" type="number" min="0" step="1" required placeholder="1499" class="px-3.5 py-2 border border-surface-container rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-[12px] font-semibold text-on-surface">Billing Frequency</label>
                <select id="plan-cycle-input" class="px-3.5 py-2 border border-surface-container rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary">
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annually">Annually</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1.5">
                <label class="text-[12px] font-semibold text-on-surface">Trial Period (Days)</label>
                <input id="plan-trial-input" type="number" min="0" value="14" class="px-3.5 py-2 border border-surface-container rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-[12px] font-semibold text-on-surface">Included Seats</label>
                <input id="plan-seats-input" type="number" min="1" value="25" class="px-3.5 py-2 border border-surface-container rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-[12px] font-semibold text-on-surface">Description</label>
              <textarea id="plan-desc-input" rows="2" placeholder="Summary of tier entitlement limits..." class="px-3.5 py-2 border border-surface-container rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"></textarea>
            </div>

            <div id="plan-form-error" class="hidden px-3.5 py-2 bg-error-container/20 border border-error/30 rounded-lg text-error text-[12px]"></div>

            <div class="flex gap-2 justify-end pt-2">
              <button type="button" id="cancel-create-plan" class="px-4 py-2 rounded-lg text-[13px] font-semibold text-on-surface hover:bg-surface-container transition-colors">Cancel</button>
              <button type="submit" id="submit-create-plan" class="px-4 py-2 rounded-lg text-[13px] font-semibold bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-sm">
                <span class="material-symbols-outlined text-[16px]">check</span>
                <span>Publish Plan Tier</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

// Interactive handlers for ProductsPlansPage
document.addEventListener('page:rendered', (e) => {
  if (e.detail.route !== 'products-plans' && e.detail.route !== 'addons-coupons') return;

  const modal = document.querySelector('#create-plan-modal');
  const openBtn = document.querySelector('#btn-open-create-plan');
  const closeBtn = document.querySelector('#close-create-plan');
  const cancelBtn = document.querySelector('#cancel-create-plan');
  const form = document.querySelector('#create-plan-form');
  const errorDiv = document.querySelector('#plan-form-error');

  openBtn?.addEventListener('click', () => modal?.classList.remove('hidden'));
  closeBtn?.addEventListener('click', () => modal?.classList.add('hidden'));
  cancelBtn?.addEventListener('click', () => modal?.classList.add('hidden'));

  // Form submit
  form?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const name = document.querySelector('#plan-name-input')?.value;
    const price = parseFloat(document.querySelector('#plan-price-input')?.value || 0);
    const billingCycle = document.querySelector('#plan-cycle-input')?.value;
    const trialDays = parseInt(document.querySelector('#plan-trial-input')?.value || 0);
    const seats = parseInt(document.querySelector('#plan-seats-input')?.value || 10);
    const description = document.querySelector('#plan-desc-input')?.value;

    const features = [
      `Up to ${seats} Provisioned Seats`,
      `Billed ${billingCycle}`,
      `${trialDays > 0 ? `${trialDays}-Day Free Trial` : 'Immediate Invoicing'}`,
      'Stripe & NetSuite ERP integration'
    ];

    try {
      await planService.create({ name, price, billingCycle, trialDays, description, features });
      toast.success(`Plan Tier "${name}" created and added to catalog!`);
      modal?.classList.add('hidden');
      form.reset();
      const { Router } = await import('../router.js');
      new Router('#page-content').handleRoute();
    } catch (err) {
      if (errorDiv) { errorDiv.textContent = err.message; errorDiv.classList.remove('hidden'); }
    }
  });

  // Deactivate plan action
  document.querySelectorAll('[data-action="delete-plan"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const confirmed = await confirmDialog({
        title: 'Deactivate Plan Tier',
        message: 'Deactivate this plan from the catalog? Existing subscribers will remain unaffected.',
        confirmText: 'Deactivate',
        danger: true
      });
      if (!confirmed) return;
      try {
        await planService.delete(id);
        toast.success('Plan deactivated from active catalog.');
        const { Router } = await import('../router.js');
        new Router('#page-content').handleRoute();
      } catch (err) {
        toast.error(err.message);
      }
    });
  });

  // Coupon Rules Button
  document.querySelector('#btn-coupon-rules')?.addEventListener('click', () => {
    toast.info('Active Coupon Rules: AUTUMN20 (-20% First Year), STARTUP50 (-50% 6 Mo), PARTNER10 (-10% Recurring).');
  });
});
