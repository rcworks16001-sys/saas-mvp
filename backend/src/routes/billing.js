const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getBillingStatus } = require('../controllers/billingController');
const authenticateToken = require('../middleware/auth');

// Lightweight auth — only verify JWT, skip trial check
const authOnly = (req, res, next) => {
    const jwt = require('jsonwebtoken');
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied.' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        return res.status(403).json({ error: 'Invalid token.' });
    }
};

router.get('/status', authOnly, getBillingStatus);
router.post('/order', authOnly, createOrder);
router.post('/verify', authOnly, verifyPayment);

module.exports = router;