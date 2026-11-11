const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Public / Authenticated fetch all courses route
router.get('/', courseController.getAllCourses);

// Admin-only create course route
router.post('/', authMiddleware, roleMiddleware(['Admin']), courseController.createCourse);

// Update course by ID (Admin or Teacher)
router.put('/:id', authMiddleware, roleMiddleware(['Admin', 'Teacher']), courseController.updateCourse);

// Delete course by ID (Admin only)
router.delete('/:id', authMiddleware, roleMiddleware(['Admin']), courseController.deleteCourse);

module.exports = router;