require('dotenv').config();
const pool = require('./index');

const migrate = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS properties (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
                title TEXT,
                location TEXT,
                price TEXT,
                bedrooms TEXT,
                area_sqft TEXT,
                furnishing TEXT,
                status TEXT DEFAULT 'available',
                images TEXT[] DEFAULT '{}',
                raw_message TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );

            CREATE INDEX IF NOT EXISTS idx_properties_org_id ON properties(organization_id);

            ALTER TABLE organizations ADD COLUMN IF NOT EXISTS whatsapp_phone_number_id TEXT;
            CREATE INDEX IF NOT EXISTS idx_orgs_wa_phone_id ON organizations(whatsapp_phone_number_id);
        `);

        // Backfill: every existing org currently shares the sandbox number.
        // Without this, the new routing query matches no rows and ALL messages get dropped.
        const backfill = await pool.query(
            `UPDATE organizations
             SET whatsapp_phone_number_id = $1
             WHERE whatsapp_phone_number_id IS NULL`,
            [process.env.WHATSAPP_PHONE_NUMBER_ID]
        );

        console.log(`Migration successful — column added, ${backfill.rowCount} org(s) backfilled to ${process.env.WHATSAPP_PHONE_NUMBER_ID}`);
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit();
    }
};

migrate();