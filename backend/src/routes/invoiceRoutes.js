const express = require('express');
const router = express.Router();
const { listInvoices, getInvoiceById, createInvoice } = require('../controllers/invoiceController');

router.get('/', listInvoices);
router.get('/:id', getInvoiceById);
router.post('/', createInvoice);

module.exports = router;

