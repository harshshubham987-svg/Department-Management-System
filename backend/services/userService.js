const pool = require('../config/db');

const userService = {
    async getUserById(userId) {
        const query = `
            SELECT 
                u.user_id, u.full_name, u.email, u.role, u.phone, u.is_active, u.created_at, u.updated_at,
                d.dept_id, d.dept_name, d.dept_code, d.head_of_department, d.location, d.contact_email
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.dept_id
            WHERE u.user_id = $1;
        `;
        const result = await pool.query(query, [userId]);
        return result.rows[0]; // password_hash is strictly excluded from selection
    }
};

module.exports = userService;