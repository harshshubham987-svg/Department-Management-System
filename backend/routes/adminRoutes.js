const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const verifyToken = require('../middlewares/authMiddleware');

// Middleware to check Admin role
const verifyAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'Admin') {
        return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    next();
};

// All admin routes require authentication and Admin role
router.use(verifyToken, verifyAdmin);

// GET /api/admin/api-logs - Get all API request logs (Mapped to getApiLogs)
router.get('/api-logs', adminController.getApiLogs);

// GET /api/admin/api-logs/:log_id - Get specific log entry detail (Mapped to getLogDetails)
router.get('/api-logs/:log_id', adminController.getLogDetails);

// GET /api/admin/dashboard-stats - Get system statistics and stats
router.get('/dashboard-stats', adminController.getDashboardStats);

module.exports = router;