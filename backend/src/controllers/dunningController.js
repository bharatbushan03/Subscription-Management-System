/**
 * Payments & Smart Dunning Controller
 */

let dunningQueue = [
  {
    invoiceId: 'INV-2024-8819',
    customer: 'OmniFlow Logistics',
    customerId: 'CUST-4481',
    amount: '$24,500.00',
    attempt: 'Retry #2 Failed',
    nextRetry: 'Oct 30, 2024 (04:00Z)',
    error: '2004 - Insufficient Funds',
    status: 'critical'
  },
  {
    invoiceId: 'INV-2024-8830',
    customer: 'Apex Media Group',
    customerId: 'CUST-8821',
    amount: '$1,850.00',
    attempt: 'Retry #1 Scheduled',
    nextRetry: 'Oct 31, 2024 (11:00Z)',
    error: '1002 - Card Expired',
    status: 'warning'
  }
];

const getDunningQueue = (req, res) => {
  res.json({
    success: true,
    telemetry: {
      recoveredMtd: '$42,100.00',
      recoveryRate: '84.2%',
      accountUpdaterMatches: 38,
      optimalWindow: '04:00Z'
    },
    data: dunningQueue
  });
};

const triggerRetry = (req, res) => {
  const { invoiceId } = req.params;
  const item = dunningQueue.find(i => i.invoiceId === invoiceId);
  if (item) {
    item.attempt = 'Retry #3 Queued (Immediate)';
    item.status = 'warning';
  }
  res.json({
    success: true,
    message: `Immediate retry dispatched for invoice ${invoiceId}`,
    attemptNumber: 3,
    scheduledAt: new Date().toISOString()
  });
};

module.exports = {
  getDunningQueue,
  triggerRetry
};

