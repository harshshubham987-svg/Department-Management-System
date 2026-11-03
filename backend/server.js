const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db'); // Import database configuration

// Initialize Express app
const app = express();

// Middleware Configuration
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Enable JSON request body parsing

// Root (/) Test API Endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Backend server is up and running successfully!",
        timestamp: new Date().toISOString()
    });
});

// Configure Port
const PORT = process.env.PORT || 5000;

// Start Server and Verify Database Connection
app.listen(PORT, async () => {
    console.log(`Server is running smoothly on port ${PORT}`);
    
    // Verify database connectivity on startup
    try {
        const res = await db.query('SELECT NOW()');
        console.log('Database connection verified at:', res.rows[0].now);
    } catch (err) {
        console.error('Database connection failed:', err.message);
    }
});