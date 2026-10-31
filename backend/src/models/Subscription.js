/**
 * Subscription Data Model & State Machine Schema
 * Aligned with Odoo 19 module states and Enterprise SaaS Lifecycle standards
 */

const SubscriptionStatus = {
  DRAFT: 'draft',
  QUOTATION: 'quotation',
  CONFIRMED: 'confirmed',
  TRIALING: 'trialing',
  ACTIVE: 'active',
  PAUSED: 'paused',
  PAST_DUE: 'past_due',
  CLOSED: 'closed',
  CANCELED: 'canceled'
};

const BillingCycle = {
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  ANNUALLY: 'annually'
};

class Subscription {
  constructor({
    id,
    subscriptionNumber,
    customerId,
    customerName,
    planId,
    planName,
    mrrAmount,
    status = SubscriptionStatus.ACTIVE,
    billingCycle = BillingCycle.ANNUALLY,
    startDate,
    expiryDate,
    nextInvoiceDate,
    cancelAtPeriodEnd = false,
    canceledAt = null,
    cancellationReason = null,
    pausedAt = null,
    pauseReason = null,
    previousSubscriptionId = null,
    renewalCount = 0,
    seatsProvisioned = 10,
    seatsTotal = 10,
    apiQuotaRequests = 100000,
    addons = [],
    history = []
  }) {
    this.id = id || `sub_${Date.now()}`;
    this.subscriptionNumber = subscriptionNumber || `SUB-${Math.floor(1000 + Math.random() * 9000)}`;
    this.customerId = customerId;
    this.customerName = customerName;
    this.planId = planId;
    this.planName = planName;
    this.mrrAmount = mrrAmount || 0;
    this.status = status;
    this.billingCycle = billingCycle;
    this.startDate = startDate || new Date().toISOString().split('T')[0];
    this.expiryDate = expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    this.nextInvoiceDate = nextInvoiceDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    this.cancelAtPeriodEnd = cancelAtPeriodEnd;
    this.canceledAt = canceledAt;
    this.cancellationReason = cancellationReason;
    this.pausedAt = pausedAt;
    this.pauseReason = pauseReason;
    this.previousSubscriptionId = previousSubscriptionId;
    this.renewalCount = renewalCount;
    this.seatsProvisioned = seatsProvisioned;
    this.seatsTotal = seatsTotal;
    this.apiQuotaRequests = apiQuotaRequests;
    this.addons = addons;
    this.history = history.length ? history : [
      {
        event: 'Subscription Created',
        state: this.status,
        timestamp: new Date().toISOString(),
        actor: 'Elena Vance'
      }
    ];
  }

  logTransition(event, newState, actor = 'System', note = '') {
    const oldState = this.status;
    this.status = newState;
    this.history.push({
      event,
      fromState: oldState,
      toState: newState,
      timestamp: new Date().toISOString(),
      actor,
      note
    });
  }
}

module.exports = {
  Subscription,
  SubscriptionStatus,
  BillingCycle
};
