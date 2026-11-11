const pool = require('../config/db');

const adminController = {
    // 1. Get Dashboard Statistics (Decoupled from cleanup)
    async getDashboardStats(req, res) {
        try {
            const statsQuery = `
                SELECT 
                    (SELECT COUNT(*) FROM users) AS total_users,
                    (SELECT COUNT(*) FROM departments) AS total_departments,
                    (SELECT COUNT(*) FROM courses) AS total_courses,
                    (SELECT COUNT(*) FROM enrollments) AS total_enrollments,
                    (SELECT COUNT(*) FROM api_logs) AS total_api_requests,
                    (SELECT ROUND(COALESCE(AVG(response_time_ms), 0), 2) FROM api_logs) AS average_response_time_ms;
            `;

            const result = await pool.query(statsQuery);
            return res.status(200).json({
                success: true,
                statistics: result.rows[0]
            });
        } catch (err) {
            console.error('Error fetching admin dashboard stats:', err.message);
            return res.status(500).json({ error: 'Internal server error while fetching dashboard statistics.' });
        }
    },

    // 2. Get Lightweight Paginated API Logs with strict numeric validation
    async getApiLogs(req, res) {
        try {
            const isNumeric = (val) => /^\d+$/.test(val);

            let page = 1;
            let limit = 25;

            if (req.query.page !== undefined && isNumeric(String(req.query.page))) {
                page = parseInt(req.query.page, 10);
            }
            if (req.query.limit !== undefined && isNumeric(String(req.query.limit))) {
                limit = parseInt(req.query.limit, 10);
            }

            if (page < 1) page = 1;
            if (limit < 1) limit = 25;
            if (limit > 50) limit = 50;

            const offset = (page - 1) * limit;

            const logsQuery = `
                SELECT log_id, http_method, api_endpoint, user_id, status_code, response_time_ms, ip_address, timestamp
                FROM api_logs
                ORDER BY timestamp DESC
                LIMIT $1 OFFSET $2;
            `;

            const countQuery = `SELECT COUNT(*) FROM api_logs;`;

            const [logsRes, countRes] = await Promise.all([
                pool.query(logsQuery, [limit, offset]),
                pool.query(countQuery)
            ]);

            const totalLogs = parseInt(countRes.rows[0].count, 10);

            return res.status(200).json({
                success: true,
                pagination: {
                    total_logs: totalLogs,
                    current_page: page,
                    per_page: limit,
                    total_pages: Math.ceil(totalLogs / limit)
                },
                logs: logsRes.rows
            });
        } catch (err) {
            console.error('Error fetching API logs:', err.message);
            return res.status(500).json({ error: 'Internal server error while fetching API logs.' });
        }
    },

    // 3. Get Full Details of a Specific Log (Admin-Only & Validated ID)
    async getLogDetails(req, res) {
        try {
            if (req.user?.role !== 'Admin') {
                return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
            }

            const logId = parseInt(req.params.log_id, 10);
            if (isNaN(logId) || logId <= 0) {
                return res.status(400).json({ error: 'Invalid log ID. Must be a positive integer.' });
            }

            const query = `SELECT * FROM api_logs WHERE log_id = $1;`;
            const result = await pool.query(query, [logId]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Log entry not found.' });
            }

            return res.status(200).json({
                success: true,
                log: result.rows[0]
            });
        } catch (err) {
            console.error('Error fetching log details:', err.message);
            return res.status(500).json({ error: 'Internal server error while fetching log details.' });
        }
    }
};

module.exports = adminController;