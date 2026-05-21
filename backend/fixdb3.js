const pool = require('./src/db/index');

async function migrate() {
    try {
        // Follow-up sequences per org
        await pool.query(`
            CREATE TABLE IF NOT EXISTS followup_settings (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
                is_enabled BOOLEAN DEFAULT true,
                sequences JSONB DEFAULT '[
                    {"day": 1, "enabled": true, "message": "Hi {name}! Just checking in — are you still looking for a property in {area}? We have some great options available."},
                    {"day": 3, "enabled": true, "message": "Hi {name}! We have new listings matching your budget of {budget} in {area}. Would you like to know more?"},
                    {"day": 7, "enabled": true, "message": "Hi {name}! This is our final follow-up. We would love to help you find your perfect home. Reply anytime to reconnect with us."}
                ]',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('followup_settings table created');

        // Track which follow-ups have been sent per lead
        await pool.query(`
            CREATE TABLE IF NOT EXISTS followup_logs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
                lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
                day_number INTEGER NOT NULL,
                sent_at TIMESTAMP DEFAULT NOW(),
                message_sent TEXT,
                UNIQUE(lead_id, day_number)
            )
        `);
        console.log('followup_logs table created');

        console.log('Migration complete');
        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
}

migrate();