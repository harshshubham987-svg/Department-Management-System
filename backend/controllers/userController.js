const userService = require('../services/userService');
const pool = require('../config/db');

const userController = {
    // 1. Get All Users (Supports optional role filtering e.g., ?role=Teacher)
    async getAllUsers(req, res) {
        try {
            const loggedInUser = req.user;

            // Optional Security: Restrict non-admins from listing all users if required
            // (Admins can view all users, or teachers/students depending on your app rules)
            const { role } = req.query;
            let query = `
                SELECT u.user_id, u.full_name, u.email, u.role, u.phone, u.department_id, u.is_active,
                       d.dept_name AS department_name
                FROM users u
                LEFT JOIN departments d ON u.department_id = d.dept_id
            `;
            let values = [];

            if (role) {
                query += ` WHERE u.role = $1`;
                values.push(role);
            }

            query += ` ORDER BY u.user_id ASC;`;

            const result = await pool.query(query, values);

            return res.status(200).json({
                success: true,
                users: result.rows
            });
        } catch (err) {
            console.error('Error fetching users:', err.message);
            return res.status(500).json({ error: 'Internal server error while fetching users.' });
        }
    },

    // 2. Get User Profile by ID
    async getUserProfile(req, res) {
        try {
            const { user_id } = req.params;
            const parsedTargetUserId = Number(user_id);

            if (!Number.isInteger(parsedTargetUserId) || parsedTargetUserId <= 0) {
                return res.status(400).json({ error: 'Invalid user ID format.' });
            }

            const loggedInUser = req.user; // Populated by verifyToken middleware

            if (loggedInUser.role === 'Student' && loggedInUser.user_id !== parsedTargetUserId) {
                return res.status(403).json({ error: 'Access denied. Students can only view their own profile.' });
            }

            if (loggedInUser.role === 'Teacher' && loggedInUser.user_id !== parsedTargetUserId) {
                return res.status(403).json({ error: 'Access denied. Teachers can only view their own profile.' });
            }

            const query = `
                SELECT u.user_id, u.full_name, u.email, u.role, u.phone, u.department_id, u.is_active,
                       d.dept_name AS department_name
                FROM users u
                LEFT JOIN departments d ON u.department_id = d.dept_id
                WHERE u.user_id = $1;
            `;
            const result = await pool.query(query, [parsedTargetUserId]);
            const userProfile = result.rows[0];

            if (!userProfile) {
                return res.status(404).json({ error: 'User profile not found.' });
            }

            return res.status(200).json({
                user: userProfile
            });
        } catch (err) {
            console.error('Error fetching user profile:', err.message);
            return res.status(500).json({ error: 'Internal server error while fetching user profile.' });
        }
    }
};

module.exports = userController;