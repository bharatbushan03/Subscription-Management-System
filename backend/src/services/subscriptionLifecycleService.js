/**
 * Enterprise Subscription Lifecycle State Machine & Service
 * Orchestrates subscription state transitions, prorations, renewals, and dunning triggers
 */

const { Subscription, SubscriptionStatus, BillingCycle } = require('../models/Subscription');

class SubscriptionLifecycleService {
  /**
   * Transition from DRAFT / CONFIRMED / QUOTATION to ACTIVE
   */
  activate(subscription, actor = 'Operations') {
    const validStates = [SubscriptionStatus.DRAFT, SubscriptionStatus.QUOTATION, SubscriptionStatus.CONFIRMED, SubscriptionStatus.PAUSED];
    if (!validStates.includes(subscription.status)) {
      throw new Error(`Cannot activate subscription from state '${subscription.status}'.`);
    }

    subscription.logTransition(
      'Subscription Activated',
      SubscriptionStatus.ACTIVE,
      actor,
      'Recurring schedule initialized. Billing and entitlement quotas active.'
    );
    return subscription;
  }

  /**
   * Transition from ACTIVE to PAUSED
   * Temporarily halts recurring billing while preserving subscription configuration
   */
  pause(subscription, reason = 'Customer request', actor = 'CSM') {
    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new Error(`Only active subscriptions can be paused. Current state: '${subscription.status}'.`);
    }

    subscription.pausedAt = new Date().toISOString();
    subscription.pauseReason = reason;
    subscription.logTransition(
      'Subscription Paused',
      SubscriptionStatus.PAUSED,
      actor,
      `Recurring invoicing suspended. Reason: ${reason}`
    );
    return subscription;
  }

  /**
   * Transition from PAUSED to ACTIVE
   * Resumes recurring billing and re-aligns next invoice date
   */
  resume(subscription, actor = 'CSM') {
    if (subscription.status !== SubscriptionStatus.PAUSED) {
      throw new Error(`Only paused subscriptions can be resumed. Current state: '${subscription.status}'.`);
    }

    subscription.pausedAt = null;
    subscription.pauseReason = null;
    subscription.logTransition(
      'Subscription Resumed',
      SubscriptionStatus.ACTIVE,
      actor,
      'Billing schedule re-aligned and metering active.'
    );
    return subscription;
  }

  /**
   * Create a renewed term cycle
   * Aligned with Odoo action_renew and SaaS automatic renewal
   */
  renew(subscription, actor = 'Automated Cron') {
    const validStates = [SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE, SubscriptionStatus.CLOSED];
    if (!validStates.includes(subscription.status)) {
      throw new Error(`Subscription in state '${subscription.status}' is not eligible for renewal.`);
    }

    // Calculate new period dates
    const oldExpiry = new Date(subscription.expiryDate || Date.now());
    const newStartDate = oldExpiry.toISOString().split('T')[0];
    const newExpiry = new Date(oldExpiry.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const renewedSub = new Subscription({
      subscriptionNumber: `SUB-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: subscription.customerId,
      customerName: subscription.customerName,
      planId: subscription.planId,
      planName: subscription.planName,
      mrrAmount: subscription.mrrAmount,
      status: SubscriptionStatus.ACTIVE,
      billingCycle: subscription.billingCycle,
      startDate: newStartDate,
      expiryDate: newExpiry,
      nextInvoiceDate: newStartDate,
      previousSubscriptionId: subscription.id,
      renewalCount: (subscription.renewalCount || 0) + 1,
      seatsProvisioned: subscription.seatsProvisioned,
      seatsTotal: subscription.seatsTotal,
      apiQuotaRequests: subscription.apiQuotaRequests
    });

    subscription.logTransition(
      'Subscription Renewed',
      SubscriptionStatus.ACTIVE,
      actor,
      `Renewed into new term cycle: ${renewedSub.subscriptionNumber}`
    );

    return { oldSubscription: subscription, renewedSubscription: renewedSub };
  }

  /**
   * Upgrade or Downgrade Plan with Proration Calculation
   */
  upgrade(subscription, { newPlanId, newPlanName, newMrrAmount, newSeats, newApiQuota }, actor = 'Account Exec') {
    const oldPlan = subscription.planName;
    const oldMrr = subscription.mrrAmount;

    // Proration estimation: delta difference applied immediately
    const deltaMrr = newMrrAmount - oldMrr;
    const isUpgrade = deltaMrr >= 0;

    subscription.planId = newPlanId;
    subscription.planName = newPlanName;
    subscription.mrrAmount = newMrrAmount;
    if (newSeats) subscription.seatsTotal = newSeats;
    if (newApiQuota) subscription.apiQuotaRequests = newApiQuota;

    subscription.logTransition(
      isUpgrade ? 'Plan Upgraded' : 'Plan Downgraded',
      subscription.status,
      actor,
      `Changed from ${oldPlan} ($${oldMrr}/mo) to ${newPlanName} ($${newMrrAmount}/mo). MRR Delta: $${deltaMrr}`
    );

    return {
      subscription,
      proration: {
        isUpgrade,
        deltaMrr,
        chargeAmount: Math.max(0, deltaMrr),
        creditAmount: Math.max(0, -deltaMrr)
      }
    };
  }

  /**
   * Transition to PAST_DUE (Triggered when renewal payment fails)
   */
  markPastDue(subscription, errorCode = '2004 (Insufficient Funds)', actor = 'Payment Gateway') {
    subscription.logTransition(
      'Payment Renewal Failed',
      SubscriptionStatus.PAST_DUE,
      actor,
      `Gateway failure: decline_code ${errorCode}. Enrolled in Smart Dunning Cadence.`
    );
    return subscription;
  }

  /**
   * Transition to CANCELED / CLOSED
   */
  cancel(subscription, { reason = 'Customer request', cancelAtPeriodEnd = false }, actor = 'CSM') {
    if (cancelAtPeriodEnd) {
      subscription.cancelAtPeriodEnd = true;
      subscription.cancellationReason = reason;
      subscription.logTransition(
        'Cancellation Scheduled',
        subscription.status,
        actor,
        `Scheduled to terminate at period end (${subscription.expiryDate}). Reason: ${reason}`
      );
      return subscription;
    }

    subscription.canceledAt = new Date().toISOString();
    subscription.cancellationReason = reason;
    subscription.logTransition(
      'Subscription Canceled',
      SubscriptionStatus.CANCELED,
      actor,
      `Immediate termination. Entitlements revoked. Reason: ${reason}`
    );
    return subscription;
  }
}

module.exports = new SubscriptionLifecycleService();

