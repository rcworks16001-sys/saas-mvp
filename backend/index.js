const express = require('express');
const cors = require('cors');
const settingsRoutes = require('./src/routes/settings');
require('dotenv').config();

const db = require('./src/db/index');
const authRoutes = require('./src/routes/auth');
const leadsRoutes = require('./src/routes/leads');
const webhookRoutes = require('./src/routes/webhook');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/webhook', webhookRoutes);
app.use('/api/settings', settingsRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'SaaS MVP Backend is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});