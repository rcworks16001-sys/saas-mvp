const pool = require('./src/db/index');

async function migrate() {
    try {
        await pool.query(`
            ALTER TABLE organizations
                ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;

            CREATE UNIQUE INDEX IF NOT EXISTS uniq_orgs_clerk_user_id
                ON organizations(clerk_user_id);
        `);
        console.log('Success: clerk_user_id column + unique index added to organizations');
        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
}

migrate();