const pool = require('../config/db');

const courseService = {
    async getAllCourses() {
        const query = `
            SELECT 
                c.course_id, c.course_name, c.course_code, c.credits, c.semester, c.max_capacity, c.enrolled_students, c.created_at,
                d.dept_id, d.dept_name, d.dept_code,
                u.user_id AS instructor_id, u.full_name AS instructor_name, u.email AS instructor_email
            FROM courses c
            LEFT JOIN departments d ON c.dept_id = d.dept_id
            LEFT JOIN users u ON c.instructor_id = u.user_id
            ORDER BY c.course_id ASC;
        `;
        const result = await pool.query(query);
        return result.rows;
    },

    async getCourseByCode(code) {
        const result = await pool.query('SELECT * FROM courses WHERE course_code = $1;', [code]);
        return result.rows[0];
    },

    async getDepartmentById(deptId) {
        const result = await pool.query('SELECT * FROM departments WHERE dept_id = $1;', [deptId]);
        return result.rows[0];
    },

    async getUserById(userId) {
        const result = await pool.query('SELECT user_id, full_name, email, role FROM users WHERE user_id = $1;', [userId]);
        return result.rows[0];
    },

    async createCourse({ course_name, course_code, dept_id, instructor_id, credits, semester, max_capacity }) {
        const query = `
            INSERT INTO courses (course_name, course_code, dept_id, instructor_id, credits, semester, max_capacity, enrolled_students)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 0)
            RETURNING course_id, course_name, course_code, dept_id, instructor_id, credits, semester, max_capacity, enrolled_students, created_at;
        `;
        const values = [
            course_name, 
            course_code, 
            dept_id, 
            instructor_id, 
            credits || 3, 
            semester || 'Fall', 
            max_capacity || 50
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    async updateCourse(courseId, { course_name, course_code, credits, semester, max_capacity }) {
        const query = `
            UPDATE courses 
            SET course_name = COALESCE($1, course_name), 
                course_code = COALESCE($2, course_code), 
                credits = COALESCE($3, credits), 
                semester = COALESCE($4, semester), 
                max_capacity = COALESCE($5, max_capacity)
            WHERE course_id = $6
            RETURNING course_id, course_name, course_code, dept_id, instructor_id, credits, semester, max_capacity, enrolled_students, created_at;
        `;
        const values = [course_name, course_code, credits, semester, max_capacity, courseId];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    async deleteCourse(courseId) {
        const query = `
            DELETE FROM courses 
            WHERE course_id = $1 
            RETURNING course_id, course_name, course_code;
        `;
        const result = await pool.query(query, [courseId]);
        return result.rows[0];
    }
};

module.exports = courseService;