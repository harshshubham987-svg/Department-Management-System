const pool = require('../config/db');

// 1. Advanced Recursive Sensitive Data Masking (Pattern/Substring Matching)
const sanitizeData = (data) => {
    if (!data || typeof data !== 'object') return data;
    
    // Substrings to match sensitive keys dynamically
    const sensitivePatterns = ['password', 'token', 'secret', 'auth', 'key', 'credential', 'hash'];
    
    if (Array.isArray(data)) {
        return data.map(item => sanitizeData(item));
    }

    const sanitized = {};
    for (const key of Object.keys(data)) {
        const lowerKey = key.toLowerCase();
        const isSensitive = sensitivePatterns.some(pattern => lowerKey.includes(pattern));

        if (isSensitive) {
            sanitized[key] = '[REDACTED]';
        } else if (typeof data[key] === 'object' && data[key] !== null) {
            sanitized[key] = sanitizeData(data[key]);
        } else {
            sanitized[key] = data[key];
        }
    }
    return sanitized;
};

// 2. Safe Payload Bounding & Size Limiting (Prevents memory bloat)
const limitPayload = (payload, maxLength = 1000) => {
    if (payload === undefined || payload === null) return null;
    try {
        // If it's a raw string or buffer
        if (typeof payload === 'string') {
            if (payload.length <= maxLength) {
                try { return JSON.parse(payload); } catch (e) { return payload; }
            }
            return {
                truncated: true,
                original_length: payload.length,
                preview: payload.substring(0, maxLength) + '...'
            };
        }

        // If it's a native object/array, stringify safely to check size
        const stringified = JSON.stringify(payload);
        if (stringified.length <= maxLength) {
            return payload; // Return native object directly for JSONB column
        }

        return {
            truncated: true,
            original_length: stringified.length,
            preview: stringified.substring(0, maxLength) + '...'
        };
    } catch (err) {
        return { error: 'Payload serialization failed' };
    }
};

const apiLogger = (req, res, next) => {
    const startTime = process.hrtime();

    let responseBody = null;
    let responseCaptured = false;

    const originalJson = res.json;
    const originalSend = res.send;

    // Intercept res.json() to capture native object before serialization
    res.json = function (body) {
        if (!responseCaptured) {
            responseCaptured = true;
            responseBody = body;
        }
        return originalJson.apply(this, arguments);
    };

    // Intercept res.send() to catch string/buffer responses safely
    res.send = function (body) {
        if (!responseCaptured) {
            responseCaptured = true;
            responseBody = body;
        }
        return originalSend.apply(this, arguments);
    };

    res.on('finish', async () => {
        try {
            const diff = process.hrtime(startTime);
            const responseTimeMs = Math.round(diff[0] * 1e3 + diff[1] * 1e-6);

            const method = req.method;
            const endpoint = req.originalUrl || req.url;
            const statusCode = res.statusCode;

            // Extract User ID (if authenticated via auth middleware) and Client IP
            const userId = req.user?.user_id || null;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null;

            // Sanitize & limit request and response bodies
            const sanitizedReqBody = sanitizeData(req.body);
            const limitedReqBody = limitPayload(sanitizedReqBody, 1000);

            const sanitizedResBody = sanitizeData(responseBody);
            const limitedResBody = limitPayload(sanitizedResBody, 1000);

            const query = `
                INSERT INTO api_logs (http_method, api_endpoint, user_id, request_body, response_body, status_code, response_time_ms, ip_address, timestamp)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            `;
            
            // Note: node-postgres (pg) natively handles JavaScript objects/arrays for JSONB columns when passed directly.
            const values = [
                method,
                endpoint,
                userId,
                limitedReqBody,
                limitedResBody,
                statusCode,
                responseTimeMs,
                ipAddress
            ];

            // Non-blocking background insertion with error isolation
            pool.query(query, values).catch(err => {
                console.error('Non-critical API Logger DB Error:', err.message);
            });
        } catch (err) {
            console.error('API Logger Execution Error:', err.message);
        }
    });

    next();
};

module.exports = apiLogger;