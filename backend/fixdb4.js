const pool = require('./src/db/index');

async function migrate() {
    try {
        await pool.query(`
            ALTER TABLE leads 
            ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS score_label VARCHAR(20) DEFAULT 'cold'
        `);
        console.log('Score columns added');
        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
}

migrate();