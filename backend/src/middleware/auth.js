const jwt = require('jsonwebtoken');
const pool = require('../db/index');
require('dotenv').config();

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        // Check subscription and trial status
        const result = await pool.query(
            'SELECT subscription_status, subscription_plan, trial_ends_at FROM organizations WHERE id = $1',
            [decoded.organizationId]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Organization not found.' });
        }

        const org = result.rows[0];
        const now = new Date();
        const trialEndsAt = new Date(org.trial_ends_at);
        const isActive = org.subscription_status === 'active' && org.subscription_plan === 'pro';
        const isTrialValid = trialEndsAt > now;

        // Attach billing info to request
        req.org = {
            subscriptionStatus: org.subscription_status,
            subscriptionPlan: org.subscription_plan,
            trialEndsAt: org.trial_ends_at,
            isActive,
            isTrialValid,
        };

        // Block access if trial expired and not subscribed
        if (!isActive && !isTrialValid) {
            // Allow billing routes through so they can pay
            if (req.path.startsWith('/api/billing')) {
                return next();
            }
            return res.status(403).json({
                error: 'Trial expired',
                code: 'TRIAL_EXPIRED',
                message: 'Your free trial has ended. Please subscribe to continue.'
            });
        }

        next();

    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
};

module.exports = authenticateToken;