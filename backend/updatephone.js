const pool = require('./src/db/index');
require('dotenv').config();

// Update ALL organizations to use your real phone number
pool.query(
    "UPDATE organizations SET phone = '917294034023'"
).then((r) => {
    console.log('Updated rows:', r.rowCount);
    return pool.query("SELECT id, name, phone FROM organizations");
}).then((r) => {
    console.log('All organizations now:', r.rows);
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});