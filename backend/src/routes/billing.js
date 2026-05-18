const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getBillingStatus } = require('../controllers/billingController');
const authenticateToken = require('../middleware/auth');

router.get('/status', authenticateToken, getBillingStatus);
router.post('/create-order', authenticateToken, createOrder);
router.post('/verify-payment', authenticateToken, verifyPayment);

module.exports = router;