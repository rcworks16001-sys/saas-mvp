const pool = require('./src/db');
(async () => {
    try {
        await pool.query('CREATE EXTENSION IF NOT EXISTS pg_trgm');
        console.log('✅ pg_trgm enabled');
    } catch (e) {
        console.error('❌ Failed:', e.message);
    } finally {
        process.exit();
    }
})();