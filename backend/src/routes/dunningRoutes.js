const express = require('express');
const router = express.Router();
const { getDunningQueue, triggerRetry } = require('../controllers/dunningController');

router.get('/queue', getDunningQueue);
router.post('/retry/:invoiceId', triggerRetry);

module.exports = router;

