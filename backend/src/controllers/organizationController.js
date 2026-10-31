/**
 * Organization Governance, RBAC & SSO Controller
 */

let members = [
  { id: 'usr_1', initials: 'EV', name: 'Elena Vance', email: 'elena@brightloop.io', role: 'Super Administrator', isYou: true, auth: 'Okta SSO (SCIM)', lastActive: 'Just now', mfa: 'Hardware Key (WebAuthn)', status: 'active' },
  { id: 'usr_2', initials: 'MV', name: 'Marcus Vance', email: 'marcus@brightloop.io', role: 'Billing Operations Lead', isYou: false, auth: 'Okta SSO', lastActive: '18m ago', mfa: 'Authenticator (TOTP)', status: 'active' },
  { id: 'usr_3', initials: 'RD', name: 'Rachel Diaz', email: 'rachel.diaz@brightloop.io', role: 'Retention & Success', isYou: false, auth: 'Okta SSO', lastActive: '2h ago', mfa: 'Hardware Key', status: 'active' },
  { id: 'usr_4', initials: 'DC', name: 'David Chen', email: 'd.chen@brightloop.io', role: 'Finance & Tax Auditor', isYou: false, auth: 'Okta SSO', lastActive: 'Yesterday, 16:40', mfa: 'Authenticator App', status: 'active' },
  { id: 'usr_5', initials: 'SJ', name: 'Sarah Jenkins', email: 's.jenkins@brightloop.io', role: 'Developer / API Integration', isYou: false, auth: 'Google SAML', lastActive: '3 days ago', mfa: 'Authenticator App', status: 'active' },
  { id: 'usr_6', initials: 'AM', name: 'Alexandre Moreau', email: 'a.moreau@brightloop.io', role: 'Read-Only Executive', isYou: false, auth: 'Pending Accept', lastActive: 'Never', mfa: 'Enforced at Setup', status: 'pending' }
];

const auditLogs = [
  { id: 'evt_1', actor: 'Marcus Vance', action: 'approved refund #RF-902 ($250.00)', time: '22m ago', ip: '192.0.2.45 (US)' },
  { id: 'evt_2', actor: 'Elena Vance', action: 'rotated Production Webhook Secret', time: '3h ago', ip: 'Multi-Sig Confirmed' },
  { id: 'evt_3', actor: 'SCIM Sync Hook', action: 'User alex.k@brightloop.io deprovisioned', time: '1d ago', ip: 'Okta Directory Hook' }
];

const listMembers = (req, res) => {
  res.json({
    success: true,
    totalProvisioned: 48,
    maxSeats: 60,
    mfaEnforcedPercent: 100,
    securityHealthScore: 98,
    data: members
  });
};

const inviteMember = (req, res) => {
  const { name, email, role } = req.body;
  const newMember = {
    id: `usr_${Date.now()}`,
    initials: (name || 'New Member').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
    name: name || 'New Member',
    email: email || 'user@brightloop.io',
    role: role || 'Read-Only Executive',
    isYou: false,
    auth: 'Pending Accept',
    lastActive: 'Never',
    mfa: 'Enforced at Setup',
    status: 'pending'
  };
  members.push(newMember);
  res.status(201).json({ success: true, data: newMember });
};

const getAuditLogs = (req, res) => {
  res.json({
    success: true,
    count: auditLogs.length,
    data: auditLogs
  });
};

module.exports = {
  listMembers,
  inviteMember,
  getAuditLogs
};

