/**
 * Subscription Data Model Schema
 */
const SubscriptionStatus = {
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  CANCELED: 'canceled',
  TRIALING: 'trialing',
  PAUSED: 'paused'
};

const BillingCycle = {
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  ANNUALLY: 'annually'
};

class Subscription {
  constructor({
    id,
    customerId,
    customerName,
    planId,
    planName,
    mrrAmount,
    status = SubscriptionStatus.ACTIVE,
    billingCycle = BillingCycle.MONTHLY,
    startDate,
    currentPeriodEnd,
    cancelAtPeriodEnd = false,
    addons = []
  }) {
    this.id = id;
    this.customerId = customerId;
    this.customerName = customerName;
    this.planId = planId;
    this.planName = planName;
    this.mrrAmount = mrrAmount;
    this.status = status;
    this.billingCycle = billingCycle;
    this.startDate = startDate || new Date();
    this.currentPeriodEnd = currentPeriodEnd;
    this.cancelAtPeriodEnd = cancelAtPeriodEnd;
    this.addons = addons;
  }
}

module.exports = {
  Subscription,
  SubscriptionStatus,
  BillingCycle
};

