/**
 * Subscription Controller with Complete Lifecycle Operations
 */

const { Subscription, SubscriptionStatus, BillingCycle } = require('../models/Subscription');
const lifecycleService = require('../services/subscriptionLifecycleService');

// Seed subscriptions matching Brightloop SaaS & Odoo entities
let mockSubscriptions = [
  new Subscription({
    id: 'sub_4481_ent',
    subscriptionNumber: 'SUB-2024-4481',
    customerId: 'CUST-4481',
    customerName: 'OmniFlow Logistics',
    planId: 'plan_ent_infinite',
    planName: 'Enterprise Custom',
    mrrAmount: 2041.66,
    status: SubscriptionStatus.PAST_DUE,
    billingCycle: BillingCycle.ANNUALLY,
    startDate: '2022-10-24',
    expiryDate: '2025-10-24',
    nextInvoiceDate: '2024-10-24',
    seatsProvisioned: 38,
    seatsTotal: 50,
    apiQuotaRequests: 10000000,
    history: [
      { event: 'Subscription Created', toState: 'draft', timestamp: '2022-10-24T08:00:00Z', actor: 'Elena Vance' },
      { event: 'Quotation Accepted', toState: 'confirmed', timestamp: '2022-10-24T09:30:00Z', actor: 'OmniFlow Logistics' },
      { event: 'Subscription Activated', toState: 'active', timestamp: '2022-10-24T10:00:00Z', actor: 'Billing Gateway' },
      { event: 'Seat Expansion Add-on (+10 Seats)', toState: 'active', timestamp: '2024-09-15T14:45:00Z', actor: 'Marcus Vance', note: 'Prorated charge $2,400.00' },
      { event: 'Payment Renewal Failed', toState: 'past_due', timestamp: '2024-10-27T04:12:00Z', actor: 'Stripe Webhook', note: 'Decline code 2004. Smart Dunning Retry #2 Failed.' }
    ]
  }),
  new Subscription({
    id: 'sub_1049_scale',
    subscriptionNumber: 'SUB-2024-1049',
    customerId: 'CUST-1049',
    customerName: 'HyperScale Technologies',
    planId: 'plan_growth_pro',
    planName: 'Dedicated Cloud Shard x3',
    mrrAmount: 4000,
    status: SubscriptionStatus.ACTIVE,
    billingCycle: BillingCycle.MONTHLY,
    startDate: '2024-01-15',
    expiryDate: '2025-01-15',
    nextInvoiceDate: '2024-11-22',
    seatsProvisioned: 60,
    seatsTotal: 60,
    apiQuotaRequests: 5000000,
    history: [
      { event: 'Subscription Activated', toState: 'active', timestamp: '2024-01-15T12:00:00Z', actor: 'Marcus Vance' },
      { event: 'Automatic Renewal Confirmed', toState: 'active', timestamp: '2024-10-22T00:00:00Z', actor: 'Billing Engine' }
    ]
  }),
  new Subscription({
    id: 'sub_9214_scale',
    subscriptionNumber: 'SUB-2024-9214',
    customerId: 'CUST-9214',
    customerName: 'CloudScale Systems',
    planId: 'plan_growth_pro',
    planName: 'Scale Enterprise + Extra API',
    mrrAmount: 3020.83,
    status: SubscriptionStatus.ACTIVE,
    billingCycle: BillingCycle.ANNUALLY,
    startDate: '2023-10-20',
    expiryDate: '2025-10-20',
    nextInvoiceDate: '2024-10-20',
    seatsProvisioned: 45,
    seatsTotal: 50,
    apiQuotaRequests: 10000000
  }),
  new Subscription({
    id: 'sub_7712_paused',
    subscriptionNumber: 'SUB-2024-7712',
    customerId: 'CUST-7712',
    customerName: 'Synthetix Health',
    planId: 'plan_starter',
    planName: 'Enterprise Core',
    mrrAmount: 1500,
    status: SubscriptionStatus.PAUSED,
    billingCycle: BillingCycle.MONTHLY,
    startDate: '2023-03-12',
    expiryDate: '2024-12-31',
    nextInvoiceDate: '2024-12-01',
    pausedAt: '2024-10-15T10:00:00Z',
    pauseReason: 'Customer requested pause during API migration'
  })
];

const listSubscriptions = (req, res) => {
  const { status, customerId } = req.query;
  let results = mockSubscriptions;
  if (status) {
    results = results.filter(sub => sub.status.toLowerCase() === status.toLowerCase());
  }
  if (customerId) {
    results = results.filter(sub => sub.customerId.toLowerCase() === customerId.toLowerCase());
  }
  res.json({
    success: true,
    count: results.length,
    data: results
  });
};

const getSubscriptionById = (req, res) => {
  const sub = mockSubscriptions.find(s => s.id === req.params.id || s.subscriptionNumber === req.params.id);
  if (!sub) {
    return res.status(404).json({ success: false, message: 'Subscription not found' });
  }
  res.json({ success: true, data: sub });
};

const createSubscription = (req, res) => {
  const newSub = new Subscription({
    ...req.body,
    status: req.body.status || SubscriptionStatus.ACTIVE
  });
  mockSubscriptions.unshift(newSub);
  res.status(201).json({ success: true, data: newSub });
};

// Lifecycle transition endpoints
const activateSubscription = (req, res) => {
  const sub = mockSubscriptions.find(s => s.id === req.params.id);
  if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

  try {
    const updated = lifecycleService.activate(sub, req.body.actor || 'Elena Vance');
    res.json({ success: true, message: 'Subscription activated successfully', data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const pauseSubscription = (req, res) => {
  const sub = mockSubscriptions.find(s => s.id === req.params.id);
  if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

  try {
    const updated = lifecycleService.pause(sub, req.body.reason || 'Requested by customer', req.body.actor || 'Marcus Vance');
    res.json({ success: true, message: 'Subscription paused successfully', data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const resumeSubscription = (req, res) => {
  const sub = mockSubscriptions.find(s => s.id === req.params.id);
  if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

  try {
    const updated = lifecycleService.resume(sub, req.body.actor || 'Marcus Vance');
    res.json({ success: true, message: 'Subscription resumed successfully', data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const renewSubscription = (req, res) => {
  const sub = mockSubscriptions.find(s => s.id === req.params.id);
  if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

  try {
    const { oldSubscription, renewedSubscription } = lifecycleService.renew(sub, req.body.actor || 'Elena Vance');
    mockSubscriptions.unshift(renewedSubscription);
    res.json({
      success: true,
      message: `Subscription successfully renewed into ${renewedSubscription.subscriptionNumber}`,
      data: { oldSubscription, renewedSubscription }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const upgradeSubscription = (req, res) => {
  const sub = mockSubscriptions.find(s => s.id === req.params.id);
  if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

  try {
    const result = lifecycleService.upgrade(sub, req.body, req.body.actor || 'Elena Vance');
    res.json({
      success: true,
      message: `Plan change executed. Proration evaluated.`,
      data: result
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const cancelSubscription = (req, res) => {
  const sub = mockSubscriptions.find(s => s.id === req.params.id);
  if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

  try {
    const updated = lifecycleService.cancel(sub, {
      reason: req.body.reason || 'Voluntary cancellation',
      cancelAtPeriodEnd: req.body.cancelAtPeriodEnd || false
    }, req.body.actor || 'CSM Team');
    res.json({ success: true, message: 'Subscription cancellation processed', data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const getLifecycleTimeline = (req, res) => {
  const sub = mockSubscriptions.find(s => s.id === req.params.id);
  if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

  res.json({
    success: true,
    subscriptionId: sub.id,
    currentState: sub.status,
    timeline: sub.history
  });
};

module.exports = {
  listSubscriptions,
  getSubscriptionById,
  createSubscription,
  activateSubscription,
  pauseSubscription,
  resumeSubscription,
  renewSubscription,
  upgradeSubscription,
  cancelSubscription,
  getLifecycleTimeline
};
