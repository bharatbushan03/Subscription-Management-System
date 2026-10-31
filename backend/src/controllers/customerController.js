/**
 * Customer 360 & Lifecycle Controller
 */

const mockCustomers = [
  {
    id: 'CUST-4481',
    name: 'OmniFlow Logistics',
    initials: 'OF',
    tier: 'Enterprise Custom',
    status: 'At Risk',
    statusDetail: '64% · At Risk (Dunning Escalation)',
    industry: 'Freight & Supply Chain Tech',
    region: 'US-East-1',
    tenure: 'Customer Since: Oct 2022 (2y tenure)',
    netArr: 24500,
    ltv: '$68,600.00',
    activeSubscriptionsCount: 1,
    overdueSubscriptionsCount: 1,
    healthScore: 64,
    healthStatus: 'At-Risk: Gateway Code 2004',
    outstandingBalance: '$24,500.00',
    dueDate: 'Oct 24, 2024',
    plan: {
      id: 'sub_4481_ent',
      name: 'Enterprise Custom Plan',
      annualCost: '$24,500.00 / yr',
      seatsProvisioned: 38,
      seatsTotal: 50,
      apiUsageRequests: '4.2M',
      apiQuotaRequests: '10.0M',
      webhookPipelines: 20
    },
    stakeholders: [
      { name: 'Elena Rostova', role: 'VP of Engineering', email: 'finance@omniflow.com', type: 'PRIMARY BILLING', initials: 'ER' },
      { name: 'Viktor Kasparov', role: 'Chief Technology Officer', email: 'viktor@omniflow.com', type: 'TECH ADMIN', initials: 'VK' }
    ],
    paymentMethod: {
      brand: 'AMEX',
      last4: '1009',
      exp: '09/27',
      status: 'DECLINED',
      failureReason: 'Last failure: Oct 27, 2024 · Insufficient funds code 2004'
    },
    taxEntity: {
      legalName: 'OmniFlow Logistics, Inc.',
      address: '742 Market Street, Suite 1200, San Francisco, CA 94103, USA',
      taxId: 'US-EIN 94-3829104',
      taxStatus: 'Avalara Verified',
      currency: 'USD ($)',
      terms: 'Net 0 (Auto-Debit)'
    },
    csm: 'Marcus Vance',
    ae: 'Elena Vance'
  },
  {
    id: 'CUST-1049',
    name: 'HyperScale Technologies',
    initials: 'HT',
    tier: 'Enterprise Infinite',
    status: 'Healthy & Expanding',
    statusDetail: '+60 seats added last week',
    industry: 'Cloud Infrastructure',
    region: 'US-West-2',
    tenure: 'Customer Since: Jan 2023 (1.8y tenure)',
    netArr: 240000,
    ltv: '$240,000.00',
    activeSubscriptionsCount: 3,
    overdueSubscriptionsCount: 0,
    healthScore: 92,
    healthStatus: 'Healthy (+8 pts)',
    outstandingBalance: '$0.00',
    dueDate: 'Nov 22, 2024',
    csm: 'Elena Vance',
    ae: 'Marcus Vance'
  },
  {
    id: 'CUST-7712',
    name: 'Synthetix Health',
    initials: 'SH',
    tier: 'Enterprise Core',
    status: 'Seat Contraction',
    statusDetail: '-45% API volume drop',
    industry: 'HealthTech & Bio',
    region: 'EU-West-1',
    tenure: 'Customer Since: Mar 2023',
    netArr: 18000,
    ltv: '$42,300.00',
    activeSubscriptionsCount: 1,
    overdueSubscriptionsCount: 0,
    healthScore: 48,
    healthStatus: 'Downsell Risk (-6 pts)',
    outstandingBalance: '$0.00',
    dueDate: 'Dec 15, 2024',
    csm: 'Rachel Diaz',
    ae: 'Elena Vance'
  },
  {
    id: 'CUST-5120',
    name: 'DataPulse Analytics',
    initials: 'DP',
    tier: 'Enterprise Custom',
    status: 'Stagnant',
    statusDetail: 'VP Engineering Departure',
    industry: 'Data Platform',
    region: 'US-East-1',
    tenure: 'Customer Since: May 2023',
    netArr: 92000,
    ltv: '$92,000.00',
    activeSubscriptionsCount: 2,
    overdueSubscriptionsCount: 0,
    healthScore: 56,
    healthStatus: 'Stagnant (Avalara webhook errors)',
    outstandingBalance: '$0.00',
    dueDate: 'Nov 30, 2024',
    csm: 'Elena Vance',
    ae: 'Marcus Vance'
  }
];

const listCustomers = (req, res) => {
  const { search, tier } = req.query;
  let results = mockCustomers;
  if (search) {
    const s = search.toLowerCase();
    results = results.filter(c => c.name.toLowerCase().includes(s) || c.id.toLowerCase().includes(s));
  }
  if (tier) {
    results = results.filter(c => c.tier === tier);
  }
  res.json({ success: true, count: results.length, data: results });
};

const getCustomerById = (req, res) => {
  const customer = mockCustomers.find(c => c.id.toLowerCase() === req.params.id.toLowerCase());
  if (!customer) {
    // Return primary demo customer if not matched
    return res.json({ success: true, data: mockCustomers[0] });
  }
  res.json({ success: true, data: customer });
};

module.exports = {
  listCustomers,
  getCustomerById
};

