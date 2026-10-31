const express = require('express');
const router = express.Router();
const { listCustomers, getCustomerById } = require('../controllers/customerController');

router.get('/', listCustomers);
router.get('/:id', getCustomerById);

module.exports = router;

