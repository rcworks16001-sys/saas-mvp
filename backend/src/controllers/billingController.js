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
            notes: { organizationId: req.user.organizationId },
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

// ── Shared activation path ──
// ONE place that handles "a payment succeeded": both the browser callback
// (verifyPayment) and the Razorpay webhook (razorpayWebhook) call this, so
// the two can never disagree on what happens to the subscription or the
// payment record. Idempotent: absolute window + ON CONFLICT, safe to run
// twice for the same payment.
const activateAndRecordPayment = async (organizationId, orderId, paymentId) => {
    // Absolute (now + 1 month), NOT additive — a duplicate call resets to the
    // same window instead of stacking extra months.
    const subscriptionEndsAt = new Date();
    subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 1);

    await pool.query(
        `UPDATE organizations 
         SET subscription_status = 'active', 
             subscription_plan = 'pro',
             subscription_ends_at = $2,
             updated_at = NOW()
         WHERE id = $1`,
        [organizationId, subscriptionEndsAt]
    );

    // Bookkeeping — must never break activation, so it has its own try/catch.
    try {
        let amount = 199900;   // paise — fixed plan price, used as fallback
        let currency = 'INR';
        let status = 'captured';

        // Pull authoritative values from Razorpay when reachable.
        try {
            const payment = await razorpay.payments.fetch(paymentId);
            if (payment) {
                amount = payment.amount ?? amount;
                currency = payment.currency ?? currency;
                status = payment.status ?? status;
            }
        } catch (fetchErr) {
            console.error('Razorpay payment fetch failed, using fallback values:', fetchErr.message);
        }

        await pool.query(
            `INSERT INTO payments
                (organization_id, razorpay_order_id, razorpay_payment_id, amount, currency, status)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (razorpay_payment_id) DO NOTHING`,
            [organizationId, orderId, paymentId, amount, currency, status]
        );
    } catch (recordErr) {
        console.error('Failed to record payment row (subscription still activated):', recordErr.message);
    }

    return subscriptionEndsAt;
};

// ── Verify payment (browser callback) ──
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // Verify signature: HMAC of "order_id|payment_id" with the KEY secret.
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ error: 'Invalid payment signature' });
        }

        const subscriptionEndsAt = await activateAndRecordPayment(
            req.user.organizationId,
            razorpay_order_id,
            razorpay_payment_id
        );

        console.log(`Payment verified (callback) for org: ${req.user.organizationId}, active until ${subscriptionEndsAt.toISOString()}`);

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

// ── Razorpay webhook (server-to-server, no browser involved) ──
// This is the reliable source of truth: Razorpay calls us directly when a
// payment is captured, even if the customer closed the tab. Signature scheme
// here is DIFFERENT from the browser callback — it's HMAC of the RAW request
// body using the WEBHOOK secret (not the key secret).
const razorpayWebhook = async (req, res) => {
    try {
        const signature = req.headers['x-razorpay-signature'];
        const expected = crypto
            .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
            .update(req.body) // req.body is a raw Buffer here (see index.js mount)
            .digest('hex');

        if (!signature || expected !== signature) {
            console.error('Webhook signature mismatch — rejecting');
            return res.status(400).json({ error: 'Invalid webhook signature' });
        }

        const event = JSON.parse(req.body.toString());

        if (event.event === 'payment.captured') {
            const payment = event.payload?.payment?.entity;
            if (!payment) {
                console.error('Webhook payment.captured missing payment entity');
                return res.status(200).json({ received: true });
            }

            // Resolve the org: prefer payment notes, fall back to order notes.
            let organizationId = payment.notes?.organizationId;
            if (!organizationId && payment.order_id) {
                try {
                    const order = await razorpay.orders.fetch(payment.order_id);
                    organizationId = order?.notes?.organizationId;
                } catch (orderErr) {
                    console.error('Webhook order fetch failed:', orderErr.message);
                }
            }

            if (!organizationId) {
                // Can't map payment to an org — return 500 so Razorpay retries.
                console.error(`Webhook: could not resolve organizationId for payment ${payment.id}`);
                return res.status(500).json({ error: 'Could not resolve organization' });
            }

            await activateAndRecordPayment(organizationId, payment.order_id, payment.id);
            console.log(`Webhook activated org ${organizationId} for payment ${payment.id}`);
        }

        // 200 for handled and ignored events so Razorpay stops retrying.
        res.status(200).json({ received: true });

    } catch (error) {
        console.error('Webhook handler error:', error);
        // 500 → Razorpay will retry later.
        res.status(500).json({ error: 'Webhook processing failed' });
    }
};

module.exports = { createOrder, verifyPayment, getBillingStatus, razorpayWebhook };