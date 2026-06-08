const Razorpay = require('razorpay');
const pool = require('../db/index');
const crypto = require('crypto');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

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
             reminder_sent_at = NULL,
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
            'SELECT subscription_plan, subscription_status, trial_ends_at, subscription_ends_at FROM organizations WHERE id = $1',
            [req.user.organizationId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        const org = result.rows[0];
        const now = new Date();

        // Read trial_ends_at from the DB as the single source of truth — the
        // SAME column the auth middleware uses. Do NOT recompute from
        // created_at + 14, or the two will disagree after any manual edit.
        const trialEndsAt = org.trial_ends_at ? new Date(org.trial_ends_at) : null;

        // "Subscribed" means an active PAID plan — mirrors the middleware's
        // isActive check (status === 'active' AND plan === 'pro'). Note: new
        // orgs default to status 'active' + plan 'trial', so checking status
        // alone (the old bug) mislabelled every trial org.
        const isSubscribed = org.subscription_status === 'active' && org.subscription_plan === 'pro';

        const daysRemaining = trialEndsAt
            ? Math.ceil((trialEndsAt - now) / (1000 * 60 * 60 * 24))
            : 0;
        const isTrialActive = !isSubscribed && trialEndsAt !== null && daysRemaining > 0;

        res.json({
            plan: org.subscription_plan,
            status: org.subscription_status,
            isTrialActive,
            trialDaysRemaining: isTrialActive ? daysRemaining : 0,
            trialEndsAt: trialEndsAt ? trialEndsAt.toISOString() : null,
            subscriptionEndsAt: org.subscription_ends_at ? new Date(org.subscription_ends_at).toISOString() : null,
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

        // Failed payment: nothing to undo — it never activated anyone.
        // Logged for diagnostics only; no DB change.
        if (event.event === 'payment.failed') {
            const payment = event.payload?.payment?.entity;
            console.warn(`Webhook: payment failed — id ${payment?.id}, order ${payment?.order_id}, reason: ${payment?.error_description || 'unknown'}`);
        }

        // Refund: mark our payment row refunded, and revoke access on a FULL
        // refund. Both refund.created and refund.processed are handled; the ops
        // are idempotent, so receiving both for one refund is harmless.
        if (event.event === 'refund.created' || event.event === 'refund.processed') {
            const refund = event.payload?.refund?.entity;
            if (refund?.payment_id) {
                // Find the original payment we stored on capture (P3).
                const payRow = await pool.query(
                    'SELECT organization_id, amount FROM payments WHERE razorpay_payment_id = $1 LIMIT 1',
                    [refund.payment_id]
                );

                if (payRow.rows.length > 0) {
                    const { organization_id, amount } = payRow.rows[0];

                    await pool.query(
                        `UPDATE payments SET status = 'refunded' WHERE razorpay_payment_id = $1`,
                        [refund.payment_id]
                    );

                    // Full refund → revoke access. Partial refund → keep access
                    // (rare on a flat plan, but correct to distinguish).
                    if (refund.amount >= amount) {
                        await pool.query(
                            `UPDATE organizations
                             SET subscription_status = 'expired',
                                 subscription_ends_at = NULL,
                                 updated_at = NOW()
                             WHERE id = $1`,
                            [organization_id]
                        );
                        console.log(`Webhook: full refund on payment ${refund.payment_id} — org ${organization_id} access revoked`);
                    } else {
                        console.log(`Webhook: partial refund on payment ${refund.payment_id} (${refund.amount}/${amount} paise) — payment marked refunded, access kept`);
                    }
                } else {
                    console.error(`Webhook: refund for unknown payment ${refund.payment_id} — no matching row`);
                }
            }
        }

        // 200 for handled and ignored events so Razorpay stops retrying.
        res.status(200).json({ received: true });

    } catch (error) {
        console.error('Webhook handler error:', error);
        // 500 → Razorpay will retry later.
        res.status(500).json({ error: 'Webhook processing failed' });
    }
};

// ── Expire lapsed subscriptions (cron) ──
// This is what actually ENFORCES monthly billing. Without it, a one-time
// payment grants permanent access (the original revenue leak). Guards make it
// surgical — it ONLY touches genuinely-lapsed PAID orgs:
//   - subscription_status = 'active'  → don't re-touch already-expired orgs
//   - subscription_plan = 'pro'       → never touch trial orgs
//   - subscription_ends_at IS NOT NULL→ never touch never-paid orgs (incl. the
//                                        manually-activated test org, which has
//                                        NULL here)
//   - subscription_ends_at < NOW()    → only when the paid month is actually up
const expireLapsedSubscriptions = async () => {
    try {
        const result = await pool.query(
            `UPDATE organizations
              SET subscription_status = 'expired'
             WHERE subscription_status = 'active'
               AND subscription_plan = 'pro'
               AND subscription_ends_at IS NOT NULL
               AND subscription_ends_at < NOW()
             RETURNING id`
        );

        if (result.rowCount > 0) {
            console.log(`Subscription expiry cron: ${result.rowCount} org(s) expired — ${result.rows.map(r => r.id).join(', ')}`);
        }
    } catch (error) {
        console.error('Subscription expiry cron error:', error);
    }
};

// ── Renewal reminder cron — runs every hour ──
// Fires once per subscription cycle for paid orgs expiring within 3 days.
// reminder_sent_at guards against re-firing hourly — it is cleared when a new
// payment is recorded (see activateAndRecordPayment). Guards:
//   - subscription_status = 'active' AND plan = 'pro'  → paid orgs only
//   - subscription_ends_at BETWEEN NOW() AND NOW() + 3 days → window
//   - reminder_sent_at IS NULL                           → not yet sent this cycle
const sendRenewalReminders = async () => {
    try {
        const result = await pool.query(
            `SELECT id, email, name, subscription_ends_at
             FROM organizations
             WHERE subscription_status = 'active'
               AND subscription_plan = 'pro'
               AND subscription_ends_at IS NOT NULL
               AND subscription_ends_at BETWEEN NOW() AND NOW() + INTERVAL '3 days'
               AND reminder_sent_at IS NULL`
        );

        if (result.rowCount === 0) return;

        for (const org of result.rows) {
            const endsAt = new Date(org.subscription_ends_at);
            const daysLeft = Math.ceil((endsAt - new Date()) / (1000 * 60 * 60 * 24));

            try {
                await resend.emails.send({
                    from: 'Ourivo <noreply@ourivo.com>',
                    to: org.email,
                    subject: `Your Ourivo subscription expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #e5e7eb;">
                            <h2 style="color: #000000; margin: 0 0 8px 0; font-size: 22px;">Renew your subscription</h2>
                            <p style="color: #444444; margin: 0 0 24px 0; font-size: 15px;">
                                Hi ${org.name || 'there'}, your Ourivo subscription expires on
                                <strong>${endsAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                                — that's ${daysLeft} day${daysLeft === 1 ? '' : 's'} away.
                            </p>
                            <p style="color: #444444; margin: 0 0 24px 0; font-size: 15px;">
                                Renew now to keep your WhatsApp chatbot running and avoid missing leads.
                            </p>
                            <a href="https://ourivo.com/billing"
                               style="display: inline-block; background: #000000; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
                                Renew for ₹1,999 →
                            </a>
                            <p style="color: #979797; margin: 32px 0 0 0; font-size: 13px;">
                                If you have already renewed, ignore this email — your access is safe.
                            </p>
                        </div>
                    `,
                });

                // Stamp reminder_sent_at only after email confirmed sent
                await pool.query(
                    `UPDATE organizations SET reminder_sent_at = NOW() WHERE id = $1`,
                    [org.id]
                );

                console.log(`Renewal reminder sent to org ${org.id} (${org.email}), expires ${endsAt.toISOString()}`);
            } catch (emailErr) {
                // Don't stamp reminder_sent_at on failure — cron will retry next hour
                console.error(`Renewal reminder failed for org ${org.id}:`, emailErr.message);
            }
        }
    } catch (error) {
        console.error('Renewal reminder cron error:', error);
    }
};

module.exports = { createOrder, verifyPayment, getBillingStatus, razorpayWebhook, expireLapsedSubscriptions, sendRenewalReminders };