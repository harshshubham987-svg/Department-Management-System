const enrollmentService = require('../services/enrollmentService');
const pool = require('../config/db');

const enrollmentController = {
    // 1. Get all enrollments (Teacher / Admin)
    async getAllEnrollments(req, res) {
        try {
            if (req.user.role !== 'Teacher' && req.user.role !== 'Admin') {
                return res.status(403).json({ error: 'Access denied. Only teachers and admins can view all enrollments.' });
            }

            const query = `
                SELECT e.enrollment_id, e.student_id, e.course_id, e.status, e.enrollment_date,
                       e.grade, e.attendance_percentage,
                       u.full_name AS student_name, c.course_name, c.course_code
                FROM enrollments e
                JOIN users u ON e.student_id = u.user_id
                JOIN courses c ON e.course_id = c.course_id
                ORDER BY e.enrollment_id DESC;
            `;
            const result = await pool.query(query);
            return res.status(200).json({
                count: result.rows.length,
                enrollments: result.rows
            });
        } catch (err) {
            console.error('Error fetching all enrollments:', err.message);
            return res.status(500).json({ error: 'Internal server error while fetching enrollments.' });
        }
    },

    // 2. Student enrolls in a course (Role: Student + Capacity validation)
    async enrollCourse(req, res) {
        try {
            const { course_id } = req.body;
            const student_id = req.user.user_id;

            if (req.user.role !== 'Student') {
                return res.status(403).json({ error: 'Access denied. Only students can enroll in courses.' });
            }

            const parsedCourseId = Number(course_id);
            if (!Number.isInteger(parsedCourseId) || parsedCourseId <= 0) {
                return res.status(400).json({ error: 'Valid course_id is required.' });
            }

            const newEnrollment = await enrollmentService.enrollStudent({
                student_id,
                course_id: parsedCourseId
            });

            return res.status(201).json({
                message: 'Enrolled in course successfully',
                enrollment: newEnrollment
            });
        } catch (err) {
            console.error('Error enrolling in course:', err.message);
            if (err.statusCode) {
                return res.status(err.statusCode).json({ error: err.message });
            }
            if (err.code === '23505') {
                return res.status(409).json({ error: 'Student is already enrolled in this course.' });
            }
            return res.status(500).json({ error: 'Internal server error during enrollment.' });
        }
    },

    // 3. Get student enrollments (Student can only view their own; Admin can view any)
    async getStudentEnrollments(req, res) {
        try {
            const { student_id } = req.params;
            const parsedStudentId = Number(student_id);

            if (!Number.isInteger(parsedStudentId) || parsedStudentId <= 0) {
                return res.status(400).json({ error: 'Invalid student ID format.' });
            }

            if (req.user.role === 'Student' && req.user.user_id !== parsedStudentId) {
                return res.status(403).json({ error: 'Access denied. Students can only view their own enrollments.' });
            }

            const enrollments = await enrollmentService.getEnrollmentsByStudent(parsedStudentId);

            return res.status(200).json({
                count: enrollments.length,
                enrollments
            });
        } catch (err) {
            console.error('Error fetching student enrollments:', err.message);
            return res.status(500).json({ error: 'Internal server error while fetching enrollments.' });
        }
    },

    // 4. Update grade and attendance (Teacher ownership check + Input Validation)
    async updateGrade(req, res) {
        try {
            const { enrollment_id } = req.params;
            const { grade, attendance_percentage, status } = req.body;

            if (req.user.role !== 'Teacher') {
                return res.status(403).json({ error: 'Access denied. Only teachers can update grades.' });
            }

            const parsedEnrollmentId = Number(enrollment_id);
            if (!Number.isInteger(parsedEnrollmentId) || parsedEnrollmentId <= 0) {
                return res.status(400).json({ error: 'Invalid enrollment ID format.' });
            }

            const isAssignedTeacher = await enrollmentService.verifyTeacherCourse(parsedEnrollmentId, req.user.user_id);
            if (!isAssignedTeacher) {
                return res.status(403).json({ error: 'Access denied. You are not the instructor assigned to this course.' });
            }

            let parsedAttendance = undefined;
            if (attendance_percentage !== undefined) {
                parsedAttendance = Number(attendance_percentage);
                if (isNaN(parsedAttendance) || parsedAttendance < 0 || parsedAttendance > 100) {
                    return res.status(400).json({ error: 'Attendance percentage must be a number between 0 and 100.' });
                }
            }

            if (grade !== undefined && typeof grade !== 'string') {
                return res.status(400).json({ error: 'Grade must be a string.' });
            }
            if (status !== undefined && typeof status !== 'string') {
                return res.status(400).json({ error: 'Status must be a string.' });
            }

            const updatedEnrollment = await enrollmentService.updateGradeAndAttendance(parsedEnrollmentId, {
                grade: grade ? grade.trim() : undefined,
                attendance_percentage: parsedAttendance,
                status: status ? status.trim() : undefined
            });

            if (!updatedEnrollment) {
                return res.status(404).json({ error: 'Enrollment record not found.' });
            }

            return res.status(200).json({
                message: 'Grade and attendance updated successfully',
                enrollment: updatedEnrollment
            });
        } catch (err) {
            console.error('Error updating grade:', err.message);
            return res.status(500).json({ error: 'Internal server error while updating grade.' });
        }
    },

    // 5. Drop course / Delete enrollment (Student ownership check or Admin)
    async dropCourse(req, res) {
        try {
            const { enrollment_id } = req.params;
            const parsedEnrollmentId = Number(enrollment_id);

            if (!Number.isInteger(parsedEnrollmentId) || parsedEnrollmentId <= 0) {
                return res.status(400).json({ error: 'Invalid enrollment ID format.' });
            }

            const enrollment = await enrollmentService.getEnrollmentById(parsedEnrollmentId);
            if (!enrollment) {
                return res.status(404).json({ error: 'Enrollment record not found.' });
            }

            if (req.user.role === 'Student' && enrollment.student_id !== req.user.user_id) {
                return res.status(403).json({ error: 'Access denied. You can only drop your own courses.' });
            }
            if (req.user.role !== 'Student' && req.user.role !== 'Admin') {
                return res.status(403).json({ error: 'Access denied.' });
            }

            const deleted = await enrollmentService.deleteEnrollment(parsedEnrollmentId);
            if (!deleted) {
                return res.status(404).json({ error: 'Enrollment record not found.' });
            }

            return res.status(200).json({
                message: 'Course dropped successfully and seat count updated',
                enrollment_id: parsedEnrollmentId
            });
        } catch (err) {
            console.error('Error dropping course:', err.message);
            return res.status(500).json({ error: 'Internal server error while dropping course.' });
        }
    }
};

module.exports = enrollmentController;