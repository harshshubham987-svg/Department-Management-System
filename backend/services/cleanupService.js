const pool = require('../config/db');

// Mutex flag to prevent overlapping cleanup tasks
let isCleanupRunning = false;

// Scheduled background log retention job (runs every 10 minutes independently)
const enforceLogRetention = async () => {
    if (isCleanupRunning) return;
    isCleanupRunning = true;

    try {
        // Loop through multiple batches if backlog is large (max 5 batches per run)
        for (let i = 0; i < 5; i++) {
            const checkQuery = `SELECT COUNT(*) FROM api_logs;`;
            const countRes = await pool.query(checkQuery);
            const totalLogs = parseInt(countRes.rows[0].count, 10);

            if (totalLogs <= 5000) break;

            const deleteQuery = `
                DELETE FROM api_logs 
                WHERE log_id IN (
                    SELECT log_id FROM api_logs 
                    ORDER BY timestamp ASC, log_id ASC 
                    LIMIT 500
                );
            `;
            await pool.query(deleteQuery);
        }
    } catch (err) {
        console.error('Background Log Retention Error:', err.message);
    } finally {
        isCleanupRunning = false;
    }
};

// Start scheduled execution (every 10 minutes)
const startCleanupCron = () => {
    setInterval(enforceLogRetention, 10 * 60 * 1000);
};

module.exports = { enforceLogRetention, startCleanupCron };