const pool = require('./src/db/index');

async function migrate() {
    try {
        // Add new fields to organizations
        await pool.query(`
            ALTER TABLE organizations 
            ADD COLUMN IF NOT EXISTS description TEXT,
            ADD COLUMN IF NOT EXISTS working_hours VARCHAR(255) DEFAULT '9 AM - 6 PM',
            ADD COLUMN IF NOT EXISTS service_locations TEXT,
            ADD COLUMN IF NOT EXISTS website VARCHAR(255),
            ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true
        `);
        console.log('Organizations table updated');

        // Add ai_rules to chatbot_configs
        await pool.query(`
            ALTER TABLE chatbot_configs
            ADD COLUMN IF NOT EXISTS ai_rules TEXT,
            ADD COLUMN IF NOT EXISTS tone VARCHAR(50) DEFAULT 'professional'
        `);
        console.log('Chatbot configs table updated');

        console.log('Migration complete');
        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
}

migrate();