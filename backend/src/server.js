const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

// API Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Brightloop Subscription & Billing API Gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Route imports
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const customerRoutes = require('./routes/customerRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const taxRoutes = require('./routes/taxRoutes');
const dunningRoutes = require('./routes/dunningRoutes');
const organizationRoutes = require('./routes/organizationRoutes');

// Mount routes
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/tax', taxRoutes);
app.use('/api/dunning', dunningRoutes);
app.use('/api/organization', organizationRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Brightloop Billing API server running on port ${PORT}`);
});
