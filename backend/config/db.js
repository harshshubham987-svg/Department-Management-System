const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 10, // Maximum connections limit karein
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

module.exports = pool;

// Test the connection and handle success/error events
pool.on('connect', () => {
    console.log('Connected to the PostgreSQL database successfully!');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
    process.exit(-1);
});

// Export query method for use across the application
module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
};
