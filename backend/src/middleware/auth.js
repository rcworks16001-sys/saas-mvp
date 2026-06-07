const pool = require('../db/index');
const { verifyToken, createClerkClient } = require('@clerk/backend');
require('dotenv').config();

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const DEFAULT_QUESTIONS = JSON.stringify([
    { id: 1, question: 'May I know your name?', key: 'name' },
    { id: 2, question: 'What is your budget?', key: 'budget' },
    { id: 3, question: 'Which area are you looking in?', key: 'area' },
    { id: 4, question: 'How many BHK do you need?', key: 'bhk' }
]);

// Find the organization for a Clerk user.
// First login: create it (14-day trial) — or link an existing org that shares
// the same email (this is how old accounts migrate to Clerk automatically).
async function resolveOrg(clerkUserId) {
    // Fast path: already linked.
    let r = await pool.query(
        'SELECT id, subscription_status, subscription_plan, trial_ends_at FROM organizations WHERE clerk_user_id = $1',
        [clerkUserId]
    );
    if (r.rows.length) return r.rows[0];

    // Need the user's email/name from Clerk to provision or link.
    const clerkUser = await clerkClient.users.getUser(clerkUserId);
    const email =
        clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ||
        clerkUser.emailAddresses[0]?.emailAddress;
    const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || email;

    // Existing org with this email but no Clerk link → link it (account migration).
    const byEmail = await pool.query('SELECT id FROM organizations WHERE email = $1', [email]);
    if (byEmail.rows.length) {
        const linked = await pool.query(
            `UPDATE organizations SET clerk_user_id = $1
             WHERE id = $2 AND clerk_user_id IS NULL
             RETURNING id, subscription_status, subscription_plan, trial_ends_at`,
            [clerkUserId, byEmail.rows[0].id]
        );
        if (linked.rows.length) return linked.rows[0];
        throw new Error('EMAIL_ALREADY_LINKED');
    }

    // Brand-new user → create org (14-day trial) + default chatbot config.
    try {
        const created = await pool.query(
            `INSERT INTO organizations (name, email, phone, subscription_status, subscription_plan, trial_ends_at, clerk_user_id)
             VALUES ($1, $2, NULL, 'trial', 'trial', NOW() + INTERVAL '14 days', $3)
             RETURNING id, subscription_status, subscription_plan, trial_ends_at`,
            [name, email, clerkUserId]
        );
        await pool.query(
            `INSERT INTO chatbot_configs (organization_id, greeting_message, questions)
             VALUES ($1, $2, $3)`,
            [created.rows[0].id, 'Hello! I am an AI assistant. How can I help you today?', DEFAULT_QUESTIONS]
        );
        return created.rows[0];
    } catch (e) {
        // Two first-requests raced — the other one created it. Re-read.
        if (e.code === '23505') {
            const again = await pool.query(
                'SELECT id, subscription_status, subscription_plan, trial_ends_at FROM organizations WHERE clerk_user_id = $1',
                [clerkUserId]
            );
            if (again.rows.length) return again.rows[0];
        }
        throw e;
    }
}

// Verify the Clerk session token and attach the user's org to the request.
async function attachClerkUser(req) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        const err = new Error('NO_TOKEN');
        err.status = 401;
        throw err;
    }
    const claims = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
    const org = await resolveOrg(claims.sub);
    req.user = { userId: claims.sub, organizationId: org.id };
    req.org = {
        subscriptionStatus: org.subscription_status,
        subscriptionPlan: org.subscription_plan,
        trialEndsAt: org.trial_ends_at,
        isActive: org.subscription_status === 'active' && org.subscription_plan === 'pro',
        isTrialValid: org.trial_ends_at ? new Date(org.trial_ends_at) > new Date() : false,
    };
    return req.org;
}

// Full auth: verify token + block if trial expired and not subscribed.
const authenticateToken = async (req, res, next) => {
    try {
        const orgState = await attachClerkUser(req);
        if (!orgState.isActive && !orgState.isTrialValid) {
            if (req.path.startsWith('/api/billing')) return next();
            return res.status(403).json({
                error: 'Trial expired',
                code: 'TRIAL_EXPIRED',
                message: 'Your free trial has ended. Please subscribe to continue.',
            });
        }
        next();
    } catch (error) {
        if (error.message === 'NO_TOKEN') {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }
        console.error('Auth error:', error);
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
};

// Lightweight auth: verify token only, skip the trial check
// (so expired users can still reach billing to pay).
const authOnly = async (req, res, next) => {
    try {
        await attachClerkUser(req);
        next();
    } catch (error) {
        if (error.message === 'NO_TOKEN') {
            return res.status(401).json({ error: 'Access denied.' });
        }
        console.error('Auth error:', error);
        return res.status(403).json({ error: 'Invalid token.' });
    }
};

module.exports = authenticateToken;
module.exports.authOnly = authOnly;