const express = require('express');
const router = express.Router();
const {
  listSubscriptions,
  getSubscriptionById,
  createSubscription
} = require('../controllers/subscriptionController');

router.get('/', listSubscriptions);
router.get('/:id', getSubscriptionById);
router.post('/', createSubscription);

module.exports = router;

