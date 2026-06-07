const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getBillingStatus } = require('../controllers/billingController');
const { authOnly } = require('../middleware/auth');

router.get('/status', authOnly, getBillingStatus);
router.post('/order', authOnly, createOrder);
router.post('/verify', authOnly, verifyPayment);

module.exports = router;