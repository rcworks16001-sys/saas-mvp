require('dotenv').config();
const pool = require('./index');

const toBedroomsInt = (val) => {
    if (val === null || val === undefined) return null;
    const m = val.toString().match(/(\d+)/);
    return m ? parseInt(m[1], 10) : null;
};
const toPriceLakhs = (val) => {
    if (val === null || val === undefined) return null;
    const str = val.toString().toLowerCase().replace(/,/g, '').trim();
    const crore = str.match(/(\d+\.?\d*)\s*(cr|crore|c)/);
    const lakh = str.match(/(\d+\.?\d*)\s*(l|lakh|lakhs|lac)/);
    const plain = str.match(/(\d+\.?\d*)/);
    if (crore) return parseFloat(crore[1]) * 100;
    if (lakh) return parseFloat(lakh[1]);
    if (plain) { const v = parseFloat(plain[1]); return v > 1000 ? v / 100000 : v; }
    return null;
};

const run = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(`
            ALTER TABLE properties ADD COLUMN IF NOT EXISTS bedrooms_int INTEGER;
            ALTER TABLE properties ADD COLUMN IF NOT EXISTS price_num NUMERIC;
        `);
        const { rows } = await client.query('SELECT id, bedrooms, price FROM properties');
        for (const r of rows) {
            await client.query(
                'UPDATE properties SET bedrooms_int = $1, price_num = $2 WHERE id = $3',
                [toBedroomsInt(r.bedrooms), toPriceLakhs(r.price), r.id]
            );
        }
        await client.query(`
            ALTER TABLE properties DROP COLUMN bedrooms;
            ALTER TABLE properties DROP COLUMN price;
            ALTER TABLE properties RENAME COLUMN bedrooms_int TO bedrooms;
            ALTER TABLE properties RENAME COLUMN price_num TO price;
        `);
        await client.query('COMMIT');
        console.log(`Converted ${rows.length} properties — bedrooms now INTEGER, price now NUMERIC (lakhs)`);
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Conversion failed, rolled back — no changes made:', e);
    } finally {
        client.release();
        process.exit();
    }
};

run();