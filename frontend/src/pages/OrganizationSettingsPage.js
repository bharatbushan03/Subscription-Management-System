/**
 * Organization Settings & Access Governance Page View
 * High-fidelity implementation matching Brightloop Organization & RBAC specs
 */

import { MetricCard } from '../components/metrics/MetricCard.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';

export async function OrganizationSettingsPage() {
  const members = [
    {
      initials: 'EV',
      name: 'Elena Vance',
      email: 'elena@brightloop.io',
      role: 'Super Administrator',
      roleBadgeClass: 'bg-primary-container text-on-primary font-semibold',
      isYou: true,
      auth: 'Okta SSO (SCIM)',
      lastActive: 'Just now (Current session)',
      mfa: 'Hardware Key (WebAuthn)',
      status: 'active'
    },
    {
      initials: 'MV',
      name: 'Marcus Vance',
      email: 'marcus@brightloop.io',
      role: 'Billing Operations Lead',
      roleBadgeClass: 'bg-secondary-container text-on-secondary-container font-semibold',
      auth: 'Okta SSO',
      lastActive: '18m ago',
      mfa: 'Authenticator (TOTP)',
      status: 'active'
    },
    {
      initials: 'RD',
      name: 'Rachel Diaz',
      email: 'rachel.diaz@brightloop.io',
      role: 'Retention & Success',
      roleBadgeClass: 'bg-tertiary-container/10 text-tertiary font-semibold',
      auth: 'Okta SSO',
      lastActive: '2h ago',
      mfa: 'Hardware Key',
      status: 'active'
    },
    {
      initials: 'DC',
      name: 'David Chen',
      email: 'd.chen@brightloop.io',
      role: 'Finance & Tax Auditor',
      roleBadgeClass: 'bg-surface-container text-on-surface font-semibold',
      auth: 'Okta SSO',
      lastActive: 'Yesterday, 16:40',
      mfa: 'Authenticator App',
      status: 'active'
    },
    {
      initials: 'SJ',
      name: 'Sarah Jenkins',
      email: 's.jenkins@brightloop.io',
      role: 'Developer / API Integration',
      roleBadgeClass: 'bg-primary-fixed text-on-primary-fixed font-semibold',
      auth: 'Google SAML',
      lastActive: '3 days ago',
      mfa: 'Authenticator App',
      status: 'active'
    },
    {
      initials: 'AM',
      name: 'Alexandre Moreau',
      email: 'a.moreau@brightloop.io',
      role: 'Read-Only Executive',
      roleBadgeClass: 'bg-surface-container text-secondary font-semibold',
      auth: 'Pending Accept',
      lastActive: 'Never',
      mfa: 'Enforced at Setup',
      status: 'pending'
    }
  ];

  return `
    <div class="flex flex-col w-full pb-12 animate-fade-in">
      <!-- Section Header -->
      <section class="flex flex-col gap-4 pb-6">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div class="flex flex-wrap items-center gap-2 pb-1">
              ${Badge({ text: 'SSO Active · Okta OIDC Enforced', variant: 'success', dot: true })}
              ${Badge({ text: 'SOC2 Type II Compliant', variant: 'info', icon: 'verified_user' })}
              <span class="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-caption-mono text-caption-mono text-[11px]">
                Multi-Tenant Realm: ORG-BL-8492
              </span>
            </div>
            <h1 class="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">Organization Settings & Access Governance</h1>
            <p class="font-body-md text-on-surface-variant max-w-4xl mt-0.5">
              Manage multi-tenant organization profiles, SSO/SAML 2.0 federation, granular role-based access control (RBAC), and security audit compliance.
            </p>
          </div>

          <div class="flex items-center gap-2 flex-wrap shrink-0">
            ${Button({ label: 'Audit Log Export (SIEM/CSV)', icon: 'download', variant: 'secondary' })}
            ${Button({ label: '+ Invite Team Member', icon: 'person_add', variant: 'secondary' })}
            ${Button({ label: '+ Create Custom Role', icon: 'add_moderator', variant: 'primary' })}
          </div>
        </div>

        <!-- Sub-Navigation Tabs -->
        <nav class="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-on-primary font-label-md font-semibold shadow-sm shrink-0">
            <span class="material-symbols-outlined text-[17px]">group</span>
            <span>Team Members & Access</span>
          </button>
          <button class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-on-surface font-label-md font-semibold shadow-sm shrink-0">
            <span class="material-symbols-outlined text-[17px]">shield_person</span>
            <span>Roles & Granular Permissions</span>
            <span class="px-1.5 py-0.2 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold">5 Custom</span>
          </button>
          <button class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-on-surface font-label-md font-semibold shadow-sm shrink-0">
            <span class="material-symbols-outlined text-[17px]">vpn_key</span>
            <span>SSO & Identity Federation</span>
          </button>
          <button class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-on-surface font-label-md font-semibold shadow-sm shrink-0">
            <span class="material-symbols-outlined text-[17px]">policy</span>
            <span>Authentication & Security Policies</span>
          </button>
          <button class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-on-surface font-label-md font-semibold shadow-sm shrink-0">
            <span class="material-symbols-outlined text-[17px]">account_balance</span>
            <span>Legal Entity & Billing Info</span>
          </button>
        </nav>
      </section>

      <!-- KPI Grid -->
      <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        ${MetricCard({
          title: 'Total Provisioned Seats',
          value: '48',
          subvalue: '/ 60 Seats',
          delta: '80% used',
          deltaType: 'neutral',
          icon: 'badge',
          progress: 80,
          footerText: '<span class="text-tertiary font-semibold">+12 Available on Enterprise Tier</span><a href="#" class="text-primary font-semibold hover:underline">Manage Tier</a>'
        })}

        ${MetricCard({
          title: 'Security Health Score',
          value: '98',
          subvalue: '/ 100',
          delta: '+2.4%',
          deltaType: 'positive',
          badgeText: 'SOC2 Ready',
          footerText: '<span class="text-tertiary">MFA Enforced: 100% (48/48)</span><span class="text-secondary">0 Stale Sessions</span>'
        })}

        ${MetricCard({
          title: 'Active Identity Provider',
          value: 'Okta SCIM 2.0',
          delta: 'Live Synced (4m ago)',
          deltaType: 'positive',
          icon: 'security',
          footerText: '<span class="text-secondary">Auto-deprovisioning Active</span><span class="px-1.5 py-0.2 rounded bg-surface-container-high text-secondary text-[10px] font-semibold">JIT ON</span>'
        })}

        ${MetricCard({
          title: 'Privileged Roles',
          value: '4 Super Admins',
          subvalue: '12 Ops · 32 Auditors',
          delta: 'Zero-Trust V2',
          deltaType: 'positive',
          icon: 'admin_panel_settings',
          footerText: '<span class="text-tertiary font-semibold">Strict Separation: Passed</span>'
        })}
      </section>

      <!-- Main Two-Column Layout -->
      <section class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Left: Team Members Table (8 cols) -->
        <div class="lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50 overflow-hidden">
          <!-- Search & Filters -->
          <div class="p-4 bg-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div class="relative flex-1 max-w-sm">
              <span class="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-on-surface-variant">search</span>
              <input
                class="w-full bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant font-body-sm text-[13px] rounded-lg pl-9 pr-3 py-2 border border-outline-variant/30 focus:outline-none shadow-sm"
                placeholder="Search members by name, email, or role (⌘K)..."
                type="text"
              />
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <select class="bg-surface-container-lowest text-on-surface font-label-md text-[12px] px-2.5 py-2 rounded-lg border border-outline-variant/30 shadow-sm focus:outline-none">
                <option>All Roles (48)</option>
                <option>Super Administrator (4)</option>
                <option>Billing Operations Lead (12)</option>
                <option>Customer Retention (14)</option>
                <option>Finance & Tax Auditor (10)</option>
                <option>Developer / API (8)</option>
              </select>
              <select class="bg-surface-container-lowest text-on-surface font-label-md text-[12px] px-2.5 py-2 rounded-lg border border-outline-variant/30 shadow-sm focus:outline-none">
                <option>Status: Active (46)</option>
                <option>Status: Invited (2)</option>
                <option>Status: Suspended (0)</option>
              </select>
              <div class="flex items-center gap-1.5 px-2.5 py-1.5 bg-surface-container-lowest rounded-lg border border-outline-variant/30 text-tertiary font-label-md text-[12px] font-semibold shadow-sm">
                <span class="material-symbols-outlined text-[16px]">lock</span>
                <span>2FA Enforced</span>
              </div>
            </div>
          </div>

          <!-- Members Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-surface-container-low text-secondary font-label-sm uppercase tracking-wider text-[11px]">
                  <th class="py-3 px-4 font-semibold">User & Identity</th>
                  <th class="py-3 px-4 font-semibold">Assigned Role</th>
                  <th class="py-3 px-4 font-semibold">Auth Source</th>
                  <th class="py-3 px-4 font-semibold">Last Active</th>
                  <th class="py-3 px-4 font-semibold">MFA Method</th>
                  <th class="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-surface-container text-body-sm text-on-surface">
                ${members.map(m => `
                  <tr class="hover:bg-surface-container-low/50 transition-colors ${m.status === 'pending' ? 'bg-surface-container-low/30' : ''}">
                    <td class="py-3.5 px-4">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full ${m.status === 'pending' ? 'bg-surface-container text-secondary' : 'bg-primary text-on-primary'} font-bold flex items-center justify-center shrink-0 text-label-md">
                          ${m.initials}
                        </div>
                        <div class="flex flex-col min-w-0">
                          <div class="flex items-center gap-1.5">
                            <span class="font-semibold text-on-surface">${m.name}</span>
                            ${m.isYou ? `<span class="px-1.5 py-0.2 rounded bg-primary/10 text-primary font-caption-mono text-[10px] font-bold">You</span>` : ''}
                            ${m.status === 'pending' ? `<span class="px-1.5 py-0.2 rounded bg-error-container text-on-error-container font-caption-mono text-[10px] font-semibold">Invite Pending</span>` : ''}
                          </div>
                          <span class="font-caption-mono text-[11px] text-on-surface-variant">${m.email}</span>
                        </div>
                      </div>
                    </td>
                    <td class="py-3.5 px-4">
                      <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm text-[11px] ${m.roleBadgeClass}">
                        ${m.role}
                      </span>
                    </td>
                    <td class="py-3.5 px-4">
                      <div class="flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full ${m.status === 'pending' ? 'bg-secondary' : 'bg-primary'}"></span>
                        <span class="font-caption-mono text-[12px] text-secondary">${m.auth}</span>
                      </div>
                    </td>
                    <td class="py-3.5 px-4 text-[12px] ${m.lastActive.includes('Just now') ? 'text-tertiary font-semibold' : 'text-secondary'}">
                      ${m.lastActive}
                    </td>
                    <td class="py-3.5 px-4">
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-secondary font-caption-mono text-[11px]">
                        ${m.mfa}
                      </span>
                    </td>
                    <td class="py-3.5 px-4 text-right">
                      ${m.status === 'pending'
                        ? `<div class="inline-flex items-center gap-1">
                             <button class="px-2 py-1 text-primary hover:bg-surface-container rounded font-label-md text-[12px] font-semibold">Resend</button>
                             <button class="px-2 py-1 text-error hover:bg-error-container/40 rounded font-label-md text-[12px] font-semibold">Revoke</button>
                           </div>`
                        : `<button class="px-2.5 py-1 text-primary hover:bg-surface-container rounded font-label-md text-[12px] font-semibold">Edit Role</button>`
                      }
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="p-4 bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-body-sm text-secondary">
            <span>Showing <strong>1 to 6</strong> of <strong>48</strong> members</span>
            <div class="inline-flex items-center gap-1">
              <button class="px-2 py-1 rounded bg-surface-container-lowest text-secondary shadow-sm">&lt;</button>
              <button class="px-2.5 py-1 rounded bg-primary text-on-primary font-bold shadow-sm">1</button>
              <button class="px-2.5 py-1 rounded bg-surface-container-lowest text-on-surface shadow-sm">2</button>
              <button class="px-2.5 py-1 rounded bg-surface-container-lowest text-on-surface shadow-sm">3</button>
              <span class="px-1">...</span>
              <button class="px-2.5 py-1 rounded bg-surface-container-lowest text-on-surface shadow-sm">5</button>
              <button class="px-2 py-1 rounded bg-surface-container-lowest text-secondary shadow-sm">&gt;</button>
            </div>
          </div>
        </div>

        <!-- Right: RBAC Scopes, SSO, Audit Feed (4 cols) -->
        <div class="lg:col-span-4 flex flex-col gap-6">
          <!-- Role Scope Preview -->
          <div class="p-5 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50 flex flex-col gap-3.5">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">Role Scope Preview</h2>
                <span class="font-caption-mono text-secondary text-[12px]">Real-time RBAC policy enforcement</span>
              </div>
              <span class="material-symbols-outlined text-primary text-[22px]">policy</span>
            </div>

            <select class="w-full bg-surface-container-low text-on-surface font-label-md text-[12px] font-semibold py-2 px-3 rounded-lg border border-outline-variant/30 focus:outline-none">
              <option selected>Role: Billing Operations Lead</option>
              <option>Role: Super Administrator</option>
              <option>Role: Customer Retention Specialist</option>
              <option>Role: Finance & Tax Auditor</option>
              <option>Role: Developer / API Integration</option>
            </select>

            <div class="space-y-2 pt-1 text-[12px]">
              <div class="p-2.5 rounded-lg bg-surface-container-low flex justify-between items-center">
                <div>
                  <span class="font-semibold text-on-surface block">Billing & Revenue Ledgers</span>
                  <span class="text-caption-mono text-[10px] text-secondary">Write, Void Invoices, Issue Refunds &lt;$10k</span>
                </div>
                ${Badge({ text: 'FULL ACCESS', variant: 'success' })}
              </div>

              <div class="p-2.5 rounded-lg bg-surface-container-low flex justify-between items-center">
                <div>
                  <span class="font-semibold text-on-surface block">Subscriptions & Plans CPQ</span>
                  <span class="text-caption-mono text-[10px] text-secondary">Modify recurring schedules</span>
                </div>
                ${Badge({ text: 'CREATE & EDIT', variant: 'info' })}
              </div>

              <div class="p-2.5 rounded-lg bg-surface-container-low flex justify-between items-center">
                <div>
                  <span class="font-semibold text-on-surface block">API Keys & Webhooks</span>
                  <span class="text-caption-mono text-[10px] text-secondary">Read-only, secrets hidden</span>
                </div>
                ${Badge({ text: 'READ-ONLY', variant: 'neutral' })}
              </div>

              <div class="p-2.5 rounded-lg bg-surface-container-low flex justify-between items-center">
                <div>
                  <span class="font-semibold text-on-surface block">Organization Settings</span>
                  <span class="text-caption-mono text-[10px] text-secondary">Restricted to Super Admin</span>
                </div>
                ${Badge({ text: 'NO ACCESS', variant: 'danger' })}
              </div>
            </div>

            <button class="w-full py-2 bg-surface-container hover:bg-surface-container-high text-primary font-label-md font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">tune</span>
              <span>Customize Scopes & Policies</span>
            </button>
          </div>

          <!-- Enterprise SSO & Security -->
          <div class="p-5 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50 flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="font-headline-sm text-[16px] font-bold text-on-surface">Enterprise SSO & Security</span>
              <span class="material-symbols-outlined text-tertiary text-[20px]">lock_clock</span>
            </div>
            <div class="space-y-2 text-[12px] text-secondary">
              <div class="flex justify-between items-center">
                <span>Single Sign-On (SAML / OIDC):</span>
                ${Badge({ text: 'Enforced & Active', variant: 'success' })}
              </div>
              <div class="flex justify-between items-center">
                <span>Just-In-Time (JIT) Provisioning:</span>
                <span class="font-semibold text-on-surface">Enabled (Auditor)</span>
              </div>
              <div class="flex justify-between items-center">
                <span>Session Inactivity Timeout:</span>
                <span class="font-semibold text-on-surface">15 Minutes</span>
              </div>
              <div class="flex justify-between items-center">
                <span>IP Address Allowlisting:</span>
                ${Badge({ text: 'Enforcing', variant: 'success' })}
              </div>
            </div>
            <a href="#" class="text-label-md text-primary font-semibold hover:underline pt-1 flex items-center gap-1">
              <span>Configure Identity Provider Settings &rarr;</span>
            </a>
          </div>

          <!-- Live Governance Audit Feed -->
          <div class="p-5 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50 flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="font-headline-sm text-[16px] font-bold text-on-surface">Live Governance Audit Feed</span>
              <span class="material-symbols-outlined text-secondary text-[20px]">history</span>
            </div>
            <div class="space-y-2.5 text-[12px]">
              <div class="flex items-start gap-2">
                <span class="material-symbols-outlined text-[16px] text-primary mt-0.5">currency_exchange</span>
                <div>
                  <p class="text-on-surface"><strong>Marcus Vance</strong> approved refund #RF-902 ($250.00)</p>
                  <span class="text-caption-mono text-[10px] text-secondary">22m ago · IP 192.0.2.45 (US)</span>
                </div>
              </div>
              <div class="flex items-start gap-2">
                <span class="material-symbols-outlined text-[16px] text-tertiary mt-0.5">key</span>
                <div>
                  <p class="text-on-surface"><strong>Elena Vance</strong> rotated Production Webhook Secret</p>
                  <span class="text-caption-mono text-[10px] text-secondary">3h ago · Multi-Sig Confirmed</span>
                </div>
              </div>
              <div class="flex items-start gap-2">
                <span class="material-symbols-outlined text-[16px] text-error mt-0.5">person_remove</span>
                <div>
                  <p class="text-on-surface"><strong>SCIM Sync:</strong> User alex.k@brightloop.io deprovisioned</p>
                  <span class="text-caption-mono text-[10px] text-secondary">1d ago · Okta Directory Hook</span>
                </div>
              </div>
            </div>
            <a href="#" class="text-label-md text-primary font-semibold hover:underline pt-1">
              <span>View All 1,420 Audit Records &rarr;</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  `;
}
