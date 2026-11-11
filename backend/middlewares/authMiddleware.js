const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. Missing or malformed token.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Strict check: Ensure only access tokens are accepted, reject refresh tokens if passed here
        if (decoded.type !== 'access') {
            return res.status(401).json({ error: 'Invalid token type. Access token required.' });
        }

        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired.' });
        }
        return res.status(401).json({ error: 'Invalid access token.' });
    }
};

module.exports = authMiddleware;