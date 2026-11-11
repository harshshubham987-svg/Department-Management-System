const pool = require('../config/db');

const departmentService = {
    async getAllDepartments() {
        const query = `
            SELECT 
                d.dept_id,
                d.dept_name,
                d.dept_code,
                d.head_of_department,
                d.location,
                d.contact_email,
                d.created_at,
                (SELECT COUNT(*) FROM users u WHERE u.department_id = d.dept_id AND u.role = 'Teacher') AS total_staff,
                (SELECT COUNT(*) FROM users u WHERE u.department_id = d.dept_id AND u.role = 'Student') AS total_students
            FROM departments d
            ORDER BY d.dept_id ASC;
        `;
        const result = await pool.query(query);
        return result.rows;
    },

    async getDepartmentById(deptId) {
        const query = `
            SELECT 
                d.dept_id,
                d.dept_name,
                d.dept_code,
                d.head_of_department,
                d.location,
                d.contact_email,
                d.created_at,
                (SELECT COUNT(*) FROM users u WHERE u.department_id = d.dept_id AND u.role = 'Teacher') AS total_staff,
                (SELECT COUNT(*) FROM users u WHERE u.department_id = d.dept_id AND u.role = 'Student') AS total_students
            FROM departments d
            WHERE d.dept_id = $1;
        `;
        const result = await pool.query(query, [deptId]);
        return result.rows[0];
    },

    async createDepartment({ dept_name, dept_code, head_of_department, location, contact_email }) {
        const query = `
            INSERT INTO departments (dept_name, dept_code, head_of_department, location, contact_email)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING dept_id, dept_name, dept_code, head_of_department, location, contact_email, created_at;
        `;
        const values = [
            dept_name, 
            dept_code, 
            head_of_department || null, 
            location || null, 
            contact_email || null
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    async updateDepartment(deptId, { dept_name, dept_code, head_of_department, location, contact_email }) {
        const query = `
            UPDATE departments 
            SET dept_name = $1, dept_code = $2, head_of_department = $3, location = $4, contact_email = $5 
            WHERE dept_id = $6 
            RETURNING dept_id, dept_name, dept_code, head_of_department, location, contact_email, created_at;
        `;
        const values = [
            dept_name, 
            dept_code, 
            head_of_department || null, 
            location || null, 
            contact_email || null, 
            deptId
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    }
};

module.exports = departmentService;