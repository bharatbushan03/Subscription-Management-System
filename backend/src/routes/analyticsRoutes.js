const express = require('express');
const router = express.Router();
const { getOverviewMetrics } = require('../controllers/analyticsController');

router.get('/overview', getOverviewMetrics);

module.exports = router;

