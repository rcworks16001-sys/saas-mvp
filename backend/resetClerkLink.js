const pool = require('./src/db/index');

// The email you are signing in with while testing:
const EMAIL = 'rishabhchandra418@gmail.com';

async function run() {
    try {
        const r = await pool.query(
            `UPDATE organizations
             SET clerk_user_id = NULL,
                 subscription_status = 'trial',
                 subscription_plan = 'trial',
                 trial_ends_at = NOW() + INTERVAL '14 days'
             WHERE email = $1
             RETURNING id, email, trial_ends_at`,
            [EMAIL]
        );
        console.log(`Reset ${r.rowCount} org(s):`, r.rows);
        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}
run();