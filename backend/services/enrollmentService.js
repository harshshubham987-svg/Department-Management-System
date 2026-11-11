const db = require('../config/db');
const pool = db.pool;

const enrollmentService = {
    // 1. Enroll student with capacity check and increment count
    async enrollStudent({ student_id, course_id }) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Check course capacity and existence
            const courseRes = await client.query(
                'SELECT course_id, max_capacity, enrolled_students FROM courses WHERE course_id = $1 FOR UPDATE;',
                [course_id]
            );

            if (courseRes.rows.length === 0) {
                const err = new Error('Course does not exist.');
                err.statusCode = 404;
                throw err;
            }

            const course = courseRes.rows[0];
            if (course.enrolled_students >= course.max_capacity) {
                const err = new Error('Course has reached its maximum capacity.');
                err.statusCode = 400;
                throw err;
            }

            // Insert enrollment
            const insertQuery = `
                INSERT INTO enrollments (student_id, course_id, status)
                VALUES ($1, $2, 'Enrolled')
                RETURNING enrollment_id, student_id, course_id, enrollment_date, grade, attendance_percentage, status;
            `;
            const enrollmentRes = await client.query(insertQuery, [student_id, course_id]);

            // Increment enrolled_students count in courses table
            await client.query(
                'UPDATE courses SET enrolled_students = enrolled_students + 1 WHERE course_id = $1;',
                [course_id]
            );

            await client.query('COMMIT');
            return enrollmentRes.rows[0];
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    },

    // 2. Get enrollments by student ID
    async getEnrollmentsByStudent(studentId) {
        const query = `
            SELECT 
                e.enrollment_id, e.enrollment_date, e.grade, e.attendance_percentage, e.status,
                c.course_id, c.course_name, c.course_code, c.credits, c.semester
            FROM enrollments e
            JOIN courses c ON e.course_id = c.course_id
            WHERE e.student_id = $1;
        `;
        const result = await pool.query(query, [studentId]);
        return result.rows;
    },

    // 3. Verify if a course belongs to a specific teacher
    async verifyTeacherCourse(enrollmentId, teacherId) {
        const query = `
            SELECT e.enrollment_id 
            FROM enrollments e
            JOIN courses c ON e.course_id = c.course_id
            WHERE e.enrollment_id = $1 AND c.instructor_id = $2;
        `;
        const result = await pool.query(query, [enrollmentId, teacherId]);
        return result.rows.length > 0;
    },

    // 4. Update grade and attendance
    async updateGradeAndAttendance(enrollmentId, { grade, attendance_percentage, status }) {
        const query = `
            UPDATE enrollments 
            SET grade = COALESCE($1, grade), 
                attendance_percentage = COALESCE($2, attendance_percentage), 
                status = COALESCE($3, status)
            WHERE enrollment_id = $4
            RETURNING enrollment_id, student_id, course_id, enrollment_date, grade, attendance_percentage, status;
        `;
        const values = [grade, attendance_percentage, status, enrollmentId];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    // 5. Drop course / delete enrollment and decrement course count
    async deleteEnrollment(enrollmentId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Fetch course_id before deletion
            const getEnrollment = await client.query(
                'SELECT course_id, student_id FROM enrollments WHERE enrollment_id = $1;',
                [enrollmentId]
            );

            if (getEnrollment.rows.length === 0) {
                await client.query('ROLLBACK');
                return null;
            }

            const { course_id, student_id } = getEnrollment.rows[0];

            // Delete enrollment
            await client.query('DELETE FROM enrollments WHERE enrollment_id = $1;', [enrollmentId]);

            // Decrement enrolled_students count
            await client.query(
                'UPDATE courses SET enrolled_students = GREATEST(0, enrolled_students - 1) WHERE course_id = $1;',
                [course_id]
            );

            await client.query('COMMIT');
            return { enrollment_id, student_id, course_id };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    },

    // 6. Get enrollment by ID for ownership checks
    async getEnrollmentById(enrollmentId) {
        const result = await pool.query('SELECT * FROM enrollments WHERE enrollment_id = $1;', [enrollmentId]);
        return result.rows[0];
    }
};

module.exports = enrollmentService;