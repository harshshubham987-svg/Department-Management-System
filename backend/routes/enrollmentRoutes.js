const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const verifyToken = require('../middlewares/authMiddleware');

// All enrollment routes require authentication
router.use(verifyToken);

// GET /api/enrollments - Get all enrollments (Teacher / Admin)
router.get('/', enrollmentController.getAllEnrollments);

// POST /api/enrollments - Student enrolls in course
router.post('/', enrollmentController.enrollCourse);

// GET /api/enrollments/student/:student_id - Get student enrollments
router.get('/student/:student_id', enrollmentController.getStudentEnrollments);

// PUT /api/enrollments/:enrollment_id/grade - Update grade (Teacher only)
router.put('/:enrollment_id/grade', enrollmentController.updateGrade);

// DELETE /api/enrollments/:enrollment_id - Drop course (Student / Admin)
router.delete('/:enrollment_id', enrollmentController.dropCourse);


module.exports = router;