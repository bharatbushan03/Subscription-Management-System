const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/subscriptionController');

// Standard collection & item endpoints
router.get('/', listSubscriptions);
router.post('/', createSubscription);
router.get('/:id', getSubscriptionById);
router.get('/:id/lifecycle', getLifecycleTimeline);

// Lifecycle state transitions
router.post('/:id/activate', activateSubscription);
router.post('/:id/pause', pauseSubscription);
router.post('/:id/resume', resumeSubscription);
router.post('/:id/renew', renewSubscription);
router.post('/:id/upgrade', upgradeSubscription);
router.post('/:id/cancel', cancelSubscription);

module.exports = router;
