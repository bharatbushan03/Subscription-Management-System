const { SubscriptionStatus, BillingCycle } = require('../models/Subscription');

// Sample in-memory subscription repository
let mockSubscriptions = [
  {
    id: 'sub_001',
    customerId: 'cust_101',
    customerName: 'Acme Corp',
    planName: 'Enterprise Cloud',
    mrrAmount: 2500,
    status: SubscriptionStatus.ACTIVE,
    billingCycle: BillingCycle.MONTHLY,
    startDate: '2024-06-01',
    currentPeriodEnd: '2025-06-01'
  },
  {
    id: 'sub_002',
    customerId: 'cust_102',
    customerName: 'Starlight Media',
    planName: 'Pro Growth',
    mrrAmount: 850,
    status: SubscriptionStatus.ACTIVE,
    billingCycle: BillingCycle.MONTHLY,
    startDate: '2024-09-15',
    currentPeriodEnd: '2025-09-15'
  },
  {
    id: 'sub_003',
    customerId: 'cust_103',
    customerName: 'Nexus FinTech',
    planName: 'Enterprise Cloud',
    mrrAmount: 3200,
    status: SubscriptionStatus.PAST_DUE,
    billingCycle: BillingCycle.MONTHLY,
    startDate: '2024-08-01',
    currentPeriodEnd: '2025-08-01'
  }
];

const listSubscriptions = (req, res) => {
  const { status } = req.query;
  let results = mockSubscriptions;
  if (status) {
    results = results.filter(sub => sub.status === status);
  }
  res.json({ success: true, count: results.length, data: results });
};

const getSubscriptionById = (req, res) => {
  const sub = mockSubscriptions.find(s => s.id === req.params.id);
  if (!sub) {
    return res.status(404).json({ success: false, message: 'Subscription not found' });
  }
  res.json({ success: true, data: sub });
};

const createSubscription = (req, res) => {
  const newSub = {
    id: `sub_${Date.now()}`,
    ...req.body,
    status: req.body.status || SubscriptionStatus.ACTIVE,
    startDate: new Date().toISOString()
  };
  mockSubscriptions.push(newSub);
  res.status(201).json({ success: true, data: newSub });
};

module.exports = {
  listSubscriptions,
  getSubscriptionById,
  createSubscription
};

