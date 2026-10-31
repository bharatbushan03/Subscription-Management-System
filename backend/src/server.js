const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

// API Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Brightloop Subscription & Billing API',
    timestamp: new Date().toISOString()
  });
});

// Route imports
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Mount routes
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/analytics', analyticsRoutes);

app.listen(PORT, () => {
  console.log(`Brightloop Billing API server running on port ${PORT}`);
});

