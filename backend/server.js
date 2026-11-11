const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const pool = require('./config/db');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Import Middleware
const apiLogger = require('./middlewares/apiLogger');
const authMiddleware = require('./middlewares/authMiddleware');

const app = express();

// =========================================================================
// Exact Middleware & Route Order as per Security Specification
// =========================================================================

// 1. Helmet (Security Headers)
app.use(helmet());

// 2. CORS Configuration
const corsOptions = {
    origin: ['http://localhost:5173', process.env.DEPLOYED_FRONTEND_URL].filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
app.use(cors(corsOptions));

// 3. Rate Limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100,
    message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use(limiter);

// 4. express.json() (Body parser)
app.use(express.json());

// 5. apiLogger (Captures all subsequent requests/responses with masking)
app.use(apiLogger);

// 6. Authentication routes
app.use('/api/auth', authRoutes);

// 7. Department routes
app.use('/api/departments', departmentRoutes);

// 8. Course routes
app.use('/api/courses', courseRoutes);

// 9. Enrollment routes
app.use('/api/enrollments', enrollmentRoutes);

// 10. Admin routes (Includes api-logs and dashboard-stats)
app.use('/api/admin', adminRoutes);

// =========================================================================

// Test Protected Route
app.get('/api/test-protected', authMiddleware, (req, res) => {
    res.status(200).json({
        message: 'Access granted!',
        user: req.user
    });
});

// Base route
app.get('/', (req, res) => {
    res.json({ message: 'Backend server is up and running successfully!' });
});

// Import User Routes
const userRoutes = require('./routes/userRoutes');

// Mount User Routes (as per your middleware sequence)
app.use('/api/users', userRoutes);

const { startCleanupCron } = require('./services/cleanupService');

// Server start hone par cleanup cron trigger kar dein
startCleanupCron();

const PORT = process.env.PORT || 5000;

// Database Verification and Server Startup
const startServer = async () => {
    try {
        console.log('Attempting to connect to PostgreSQL database...');
        const dbRes = await pool.query('SELECT NOW()');
        console.log('Connected to the PostgreSQL database successfully at:', dbRes.rows[0].now);

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Database connection failed:', err.message);
        process.exit(1);
    }
};

startServer();