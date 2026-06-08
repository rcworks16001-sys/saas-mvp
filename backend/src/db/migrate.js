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

            -- P1: when the current paid month ends. NULL = never paid (trial or expired).
            ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;

            -- P3: payment history in our own DB (not just Razorpay's dashboard).
            -- amount is stored in PAISE (Razorpay's unit): 199900 = Rs 1,999.
            CREATE TABLE IF NOT EXISTS payments (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
                razorpay_order_id TEXT NOT NULL,
                razorpay_payment_id TEXT NOT NULL,
                amount INTEGER NOT NULL,
                currency TEXT NOT NULL DEFAULT 'INR',
                status TEXT NOT NULL DEFAULT 'captured',
                created_at TIMESTAMPTZ DEFAULT NOW()
            );

           CREATE INDEX IF NOT EXISTS idx_payments_org_id ON payments(organization_id);

            -- Strict idempotency: one Razorpay payment can only ever produce one row.
            CREATE UNIQUE INDEX IF NOT EXISTS uniq_payments_razorpay_payment_id
                ON payments(razorpay_payment_id);

            -- Renewal reminder: tracks when we last sent the 3-day warning so the
            -- hourly cron doesn't re-fire it every hour.
            ALTER TABLE organizations ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;
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