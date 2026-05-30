const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

pool.query(`UPDATE chatbot_configs SET questions = '[{"id":1,"key":"name","question":"May I know your name?"},{"id":2,"key":"rent_or_buy","question":"Are you looking to buy or rent?"},{"id":3,"key":"bhk","question":"How many BHK are you looking for?"},{"id":4,"key":"area","question":"Which locality are you looking in?"},{"id":5,"key":"budget","question":"What is your budget?"}]'`)
    .then(() => { console.log('Done'); pool.end(); })
    .catch(e => { console.error(e); pool.end(); });