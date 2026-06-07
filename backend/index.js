const express = require('express');
const cors = require('cors');
const settingsRoutes = require('./src/routes/settings');
require('dotenv').config();

const db = require('./src/db/index');
const authRoutes = require('./src/routes/auth');
const leadsRoutes = require('./src/routes/leads');
const webhookRoutes = require('./src/routes/webhook');
const billingRoutes = require('./src/routes/billing');
const followupRoutes = require('./src/routes/followup');
const contactRoutes = require('./src/routes/contact');
const inventoryRoutes = require('./src/routes/inventory');

const app = express();

app.use(cors());

// Razorpay webhook must read the RAW request body to verify its signature,
// so it is mounted BEFORE express.json() (which would consume the body).
// No JWT auth here by design — it's protected by signature verification.
const { razorpayWebhook } = require('./src/controllers/billingController');
app.post('/api/billing/webhook', express.raw({ type: '*/*' }), razorpayWebhook);

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/webhook', webhookRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/followup', followupRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/inventory', inventoryRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'SaaS MVP Backend is running' });
});

const PORT = process.env.PORT || 5000;
// ── Follow-up cron job — runs every hour ──
const { processFollowups } = require('./src/controllers/followupController');
setInterval(async () => {
    await processFollowups();
}, 60 * 60 * 1000); // every hour

// Run once on startup too
processFollowups();

// ── Subscription expiry cron — runs every hour ──
// Enforces monthly billing: flips lapsed paid subscriptions to 'expired'.
const { expireLapsedSubscriptions } = require('./src/controllers/billingController');
setInterval(async () => {
    await expireLapsedSubscriptions();
}, 60 * 60 * 1000); // every hour

// Run once on startup too
expireLapsedSubscriptions();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});