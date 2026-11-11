const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const authService = {
    // 1. Register User Service (Handles password hashing)
    async registerUser({ full_name, email, password, role, phone, department_id }) {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const query = `
            INSERT INTO users (full_name, email, password_hash, role, phone, department_id, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, TRUE)
            RETURNING user_id, full_name, email, role, phone, department_id, created_at, updated_at, is_active;
        `;
        const values = [full_name, email, password_hash, role, phone || null, department_id || null];
        
        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (err) {
            if (err.code === '23505') { // PostgreSQL unique violation error for duplicate email
                const error = new Error('Email is already registered.');
                error.statusCode = 409;
                throw error;
            }
            throw err;
        }
    },

    // 2. Find User by Email (Fetches password_hash for login comparison)
    async findUserByEmail(email) {
        const query = `
            SELECT user_id, full_name, email, password_hash, role, phone, department_id, is_active 
            FROM users 
            WHERE email = $1;
        `;
        const result = await pool.query(query, [email]);
        return result.rows[0];
    },

    // 3. Find User by ID (Excludes password_hash for profile safety)
    async findUserById(userId) {
        const query = `
            SELECT user_id, full_name, email, role, phone, department_id, created_at, updated_at, is_active 
            FROM users 
            WHERE user_id = $1;
        `;
        const result = await pool.query(query, [userId]);
        return result.rows[0];
    },

    // 4. Verify Password Helper
    async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
};

module.exports = authService;