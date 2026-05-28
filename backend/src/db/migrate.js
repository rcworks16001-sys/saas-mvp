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
        `);
        console.log('Migration successful — properties table created');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit();
    }
};

migrate();