/**
 * Invoices, Receipts & Global Collections Controller
 */

let mockInvoices = [
  {
    id: 'INV-2024-8819',
    hash: '9b2d-114c',
    customer: 'OmniFlow Logistics',
    customerId: 'CUST-4481',
    plan: 'Enterprise Custom (Annual)',
    date: 'Oct 24, 2024 – Oct 24, 2025',
    amount: 24500,
    amountFormatted: '$24,500.00',
    subtotal: '$22,685.19',
    tax: '$1,814.81',
    status: 'past_due',
    paymentMethod: 'AMEX •••• 1009',
    dueDate: 'Oct 24, 2024'
  },
  {
    id: 'INV-2024-8818',
    hash: 'f4e8-89aa',
    customer: 'HyperScale Technologies',
    customerId: 'CUST-1049',
    plan: 'Dedicated Cloud Shard x3 (Monthly)',
    date: 'Oct 22, 2024 – Nov 22, 2024',
    amount: 4000,
    amountFormatted: '$4,000.00',
    subtotal: '$3,703.70',
    tax: '$296.30',
    status: 'paid',
    paymentMethod: 'AMEX •••• 1009',
    dueDate: 'Oct 22, 2024'
  },
  {
    id: 'INV-2024-8817',
    hash: 'c701-44bb',
    customer: 'CloudScale Systems',
    customerId: 'CUST-9214',
    plan: 'Scale Enterprise + Extra API',
    date: 'Oct 20, 2024 – Oct 20, 2025',
    amount: 36250,
    amountFormatted: '$36,250.00',
    subtotal: '$33,564.81',
    tax: '$2,685.19',
    status: 'paid',
    paymentMethod: 'AMEX •••• 1009',
    dueDate: 'Oct 20, 2024'
  },
  {
    id: 'INV-2024-8816',
    hash: '110f-28ee',
    customer: 'Apex Media Group',
    customerId: 'CUST-8821',
    plan: 'Growth Pro Annual License',
    date: 'Oct 18, 2024 – Oct 18, 2025',
    amount: 11247.18,
    amountFormatted: '$11,247.18',
    subtotal: '$10,414.06',
    tax: '$833.12',
    status: 'paid',
    paymentMethod: 'AMEX •••• 1009',
    dueDate: 'Oct 18, 2024'
  },
  {
    id: 'INV-2024-8815',
    hash: '78aa-0041',
    customer: 'Vanguard AI Labs',
    customerId: 'CUST-3310',
    plan: 'Metered LLM Ingestion True-Up',
    date: 'Oct 15, 2024 – Nov 15, 2024',
    amount: 15799,
    amountFormatted: '$15,799.00',
    subtotal: 'Base: $799.00',
    tax: 'Usage: $15,000.00',
    status: 'pending',
    paymentMethod: 'Wire Transfer / ACH',
    dueDate: 'Nov 15, 2024'
  },
  {
    id: 'CR-2024-0104',
    hash: 'Credit Memo',
    customer: 'Synthetix Health',
    customerId: 'CUST-7712',
    plan: 'Prorated Seat Downgrade Adjustment',
    date: 'Oct 12, 2024',
    amount: -1200,
    amountFormatted: '-$1,200.00',
    subtotal: 'Applied to Ledger',
    tax: '$0.00',
    status: 'credit',
    paymentMethod: 'Account Balance',
    dueDate: 'N/A'
  }
];

const listInvoices = (req, res) => {
  const { status, customerId } = req.query;
  let results = mockInvoices;
  if (status && status !== 'all') {
    results = results.filter(inv => inv.status === status);
  }
  if (customerId) {
    results = results.filter(inv => inv.customerId === customerId);
  }
  res.json({
    success: true,
    count: results.length,
    totals: {
      collectedMtd: 482920,
      receivables: 48900,
      pastDue: 24500,
      netTaxWithheld: 38633.60
    },
    data: results
  });
};

const getInvoiceById = (req, res) => {
  const invoice = mockInvoices.find(inv => inv.id === req.params.id);
  if (!invoice) {
    return res.status(404).json({ success: false, message: 'Invoice not found' });
  }
  res.json({ success: true, data: invoice });
};

const createInvoice = (req, res) => {
  const newInvoice = {
    id: `INV-2024-${Math.floor(1000 + Math.random() * 9000)}`,
    hash: Math.random().toString(36).substring(2, 10),
    customer: req.body.customer || 'Enterprise Client',
    customerId: req.body.customerId || 'CUST-DEMO',
    plan: req.body.plan || 'Custom Plan',
    date: new Date().toLocaleDateString(),
    amount: req.body.amount || 1000,
    amountFormatted: `$${(req.body.amount || 1000).toLocaleString()}`,
    subtotal: `$${((req.body.amount || 1000) * 0.92).toFixed(2)}`,
    tax: `$${((req.body.amount || 1000) * 0.08).toFixed(2)}`,
    status: req.body.status || 'pending',
    paymentMethod: req.body.paymentMethod || 'Credit Card (Stripe)'
  };
  mockInvoices.unshift(newInvoice);
  res.status(201).json({ success: true, data: newInvoice });
};

module.exports = {
  listInvoices,
  getInvoiceById,
  createInvoice
};

