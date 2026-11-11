const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Public / Authenticated fetch routes
router.get('/', departmentController.getAllDepartments);
router.get('/:dept_id', departmentController.getDepartmentById);

// Admin-only create and update routes
router.post('/', authMiddleware, roleMiddleware(['Admin']), departmentController.createDepartment);
router.put('/:dept_id', authMiddleware, roleMiddleware(['Admin']), departmentController.updateDepartment);

module.exports = router;