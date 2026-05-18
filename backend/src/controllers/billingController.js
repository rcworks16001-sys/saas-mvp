const Razorpay = require('razorpay');
const pool = require('../db/index');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── Create order ──
const createOrder = async (req, res) => {
    try {
        const options = {
            amount: 199900, // Rs 1,999 in paise
            currency: 'INR',
            receipt: `receipt_${req.user.organizationId}_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
        });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create payment order' });
    }
};

// ── Verify payment ──
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // Verify signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ error: 'Invalid payment signature' });
        }

        // Payment verified — update subscription
        const now = new Date();
        const nextMonth = new Date(now.setMonth(now.getMonth() + 1));

        await pool.query(
            `UPDATE organizations 
             SET subscription_status = 'active', 
                 subscription_plan = 'pro',
                 updated_at = NOW()
             WHERE id = $1`,
            [req.user.organizationId]
        );

        console.log(`Payment verified for org: ${req.user.organizationId}`);

        res.json({ success: true, message: 'Payment verified successfully' });

    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({ error: 'Payment verification failed' });
    }
};

// ── Get billing status ──
const getBillingStatus = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT subscription_plan, subscription_status, created_at FROM organizations WHERE id = $1',
            [req.user.organizationId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        const org = result.rows[0];

        // Calculate trial days remaining
        const createdAt = new Date(org.created_at);
        const trialEndsAt = new Date(createdAt.setDate(createdAt.getDate() + 14));
        const now = new Date();
        const daysRemaining = Math.ceil((trialEndsAt - now) / (1000 * 60 * 60 * 24));
        const isTrialActive = daysRemaining > 0 && org.subscription_status !== 'active';

        res.json({
            plan: org.subscription_plan,
            status: org.subscription_status,
            isTrialActive,
            trialDaysRemaining: isTrialActive ? daysRemaining : 0,
            trialEndsAt: trialEndsAt.toISOString(),
        });

    } catch (error) {
        console.error('Get billing status error:', error);
        res.status(500).json({ error: 'Failed to get billing status' });
    }
};

module.exports = { createOrder, verifyPayment, getBillingStatus };