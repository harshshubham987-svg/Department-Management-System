const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middlewares/authMiddleware');

// All user management routes require JWT authentication
router.use(verifyToken);

// GET /api/users - Get all users (supports ?role=Teacher query filter)
router.get('/', userController.getAllUsers);

// GET /api/users/:user_id - Get user profile with ownership checks
router.get('/:user_id', userController.getUserProfile);

module.exports = router;