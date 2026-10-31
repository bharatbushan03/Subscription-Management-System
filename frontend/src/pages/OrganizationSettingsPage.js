/**
 * Organization Settings & Access Governance Page View
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
      isYou: true,
      auth: 'Okta SSO (SCIM)',
      lastActive: 'Just now (Current session)',
      mfa: 'Hardware Key (WebAuthn)',
      roleBadge: 'primary'
    },
    {
      initials: 'MV',
      name: 'Marcus Vance',
      email: 'marcus@brightloop.io',
      role: 'Billing Operations Lead',
      auth: 'Okta SSO',
      lastActive: '18m ago',
      mfa: 'Authenticator (TOTP)',
      roleBadge: 'secondary'
    },
    {
      initials: 'RD',
      name: 'Rachel Diaz',
      email: 'rachel.diaz@brightloop.io',
      role: 'Retention & Success',
      auth: 'Okta SSO',
      lastActive: '2h ago',
      mfa: 'Hardware Key',
      roleBadge: 'tertiary'
    },
    {
      initials: 'DC',
      name: 'David Chen',
      email: 'd.chen@brightloop.io',
      role: 'Finance & Tax Auditor',
      auth: 'Okta SSO',
      lastActive: 'Yesterday, 16:40',
      mfa: 'Authenticator App',
      roleBadge: 'neutral'
    },
    {
      initials: 'SJ',
      name: 'Sarah Jenkins',
      email: 's.jenkins@brightloop.io',
      role: 'Developer / API Integration',
      auth: 'Google SAML',
      lastActive: '3 days ago',
      mfa: 'Authenticator App',
      roleBadge: 'info'
    }
  ];

  return `
    <div class="flex flex-col w-full pb-12">
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
            ${Button({ label: 'Audit Log Export', icon: 'download', variant: 'secondary' })}
            ${Button({ label: '+ Invite Team Member', icon: 'person_add', variant: 'secondary' })}
            ${Button({ label: '+ Create Custom Role', icon: 'add_moderator', variant: 'primary' })}
          </div>
        </div>

        <!-- Sub Tabs -->
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
        </nav>
      </section>

      <!-- Top KPI Cards -->
      <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        ${MetricCard({
          title: 'Total Provisioned Seats',
          value: '48',
          subvalue: '/ 60 Seats',
          delta: '80% used',
          deltaType: 'neutral',
          icon: 'badge',
          progress: 80,
          footerText: '<span class="text-tertiary">+12 Available on Enterprise Tier</span><a href="#" class="text-primary font-semibold hover:underline">Manage Tier</a>'
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
          delta: 'Live Synced',
          deltaType: 'positive',
          icon: 'security',
          footerText: '<span class="text-secondary">Auto-deprovisioning Active</span><span class="px-1.5 py-0.2 rounded bg-surface-container text-secondary text-[10px]">JIT ON</span>'
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
        <!-- Team Members Table (8 cols) -->
        <div class="lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50 overflow-hidden">
          <div class="p-4 bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="relative flex-1 max-w-sm">
              <span class="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-on-surface-variant">search</span>
              <input
                class="w-full bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant font-body-sm text-[13px] rounded-lg pl-9 pr-3 py-2 border border-outline-variant/30 focus:outline-none"
                placeholder="Search members by name, email (⌘K)..."
                type="text"
              />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-caption-mono text-[12px] text-secondary">Showing 1 to 5 of 48 members</span>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-surface-container-low text-secondary font-label-sm uppercase tracking-wider text-[11px]">
                  <th class="py-3 px-4 font-semibold">User & Identity</th>
                  <th class="py-3 px-4 font-semibold">Assigned Role</th>
                  <th class="py-3 px-4 font-semibold">Auth Source</th>
                  <th class="py-3 px-4 font-semibold">Last Active</th>
                  <th class="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-surface-container text-body-sm text-on-surface">
                ${members.map(m => `
                  <tr class="hover:bg-surface-container-low/50 transition-colors">
                    <td class="py-3.5 px-4">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center shrink-0 text-label-md">
                          ${m.initials}
                        </div>
                        <div class="flex flex-col min-w-0">
                          <div class="flex items-center gap-1.5">
                            <span class="font-semibold text-on-surface">${m.name}</span>
                            ${m.isYou ? `<span class="px-1.5 py-0.2 rounded bg-primary/10 text-primary font-caption-mono text-[10px] font-bold">You</span>` : ''}
                          </div>
                          <span class="font-caption-mono text-[11px] text-on-surface-variant">${m.email}</span>
                        </div>
                      </div>
                    </td>
                    <td class="py-3.5 px-4">
                      <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface font-label-sm text-[11px] font-semibold">
                        ${m.role}
                      </span>
                    </td>
                    <td class="py-3.5 px-4 font-caption-mono text-secondary text-[12px]">
                      ${m.auth}
                    </td>
                    <td class="py-3.5 px-4 text-[12px] text-secondary">
                      ${m.lastActive}
                    </td>
                    <td class="py-3.5 px-4 text-right">
                      <button class="px-2.5 py-1 text-primary hover:bg-surface-container rounded font-label-md font-semibold transition-colors">Edit</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- RBAC Scope & SSO Status (4 cols) -->
        <div class="lg:col-span-4 flex flex-col gap-4">
          <div class="p-5 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/50 flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">Role Scope Preview</h2>
              <span class="material-symbols-outlined text-primary text-[20px]">policy</span>
            </div>
            <p class="font-caption-mono text-[12px] text-secondary">Real-time RBAC policy enforcement for: <strong>Billing Operations Lead</strong></p>
            <div class="space-y-2 pt-1">
              <div class="p-2.5 rounded-lg bg-surface-container-low flex justify-between items-center text-body-sm">
                <span>Billing & Revenue Ledgers</span>
                ${Badge({ text: 'FULL ACCESS', variant: 'success' })}
              </div>
              <div class="p-2.5 rounded-lg bg-surface-container-low flex justify-between items-center text-body-sm">
                <span>Subscriptions & Plans CPQ</span>
                ${Badge({ text: 'CREATE & EDIT', variant: 'info' })}
              </div>
              <div class="p-2.5 rounded-lg bg-surface-container-low flex justify-between items-center text-body-sm">
                <span>Organization Settings</span>
                ${Badge({ text: 'NO ACCESS', variant: 'danger' })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

