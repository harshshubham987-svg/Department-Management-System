const jwt = require('jsonwebtoken');
const authService = require('../services/authService'); // Fixed import (removed destructuring)

const generateAccessToken = (user) => {
    return jwt.sign(
        { user_id: user.user_id, role: user.role, email: user.email, type: 'access' },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        { user_id: user.user_id, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );
};

const authController = {
    async register(req, res) {
        try {
            const { full_name, email, password, role, phone, department_id } = req.body;

            if (!full_name || !email || !password || !role) {
                return res.status(400).json({ error: 'Missing required fields (full_name, email, password, role).' });
            }

            const newUser = await authService.registerUser({
                full_name, email, password, role, phone, department_id
            });

            return res.status(201).json({
                message: 'User registered successfully',
                user: newUser
            });
        } catch (err) {
            console.error('Registration error:', err.message);
            
            if (err.statusCode === 409 || err.message.includes('already registered')) {
                return res.status(409).json({ error: err.message });
            }

            if (
                err.message.includes('Invalid') || 
                err.message.includes('must be') || 
                err.message.includes('does not exist') || 
                err.message.includes('cannot be empty') ||
                err.message.includes('only permits')
            ) {
                return res.status(400).json({ error: err.message });
            }

            return res.status(500).json({ error: 'Internal server error during registration.' });
        }
    },

    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required.' });
            }

            const user = await authService.findUserByEmail(email);
            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password.' });
            }

            // Fixed: Using user.password_hash and authService.verifyPassword
            const isMatch = await authService.verifyPassword(password, user.password_hash);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid email or password.' });
            }

            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            const { password_hash: _, ...userWithoutPassword } = user;

            return res.status(200).json({
                message: 'Login successful',
                accessToken,
                refreshToken,
                user: userWithoutPassword
            });
        } catch (err) {
            console.error('Login error:', err.message);
            return res.status(500).json({ error: 'Internal server error during login.' });
        }
    },

    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(401).json({ error: 'Refresh token is required.' });
            }

            jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
                if (err) {
                    return res.status(403).json({ error: 'Invalid or expired refresh token.' });
                }

                if (decoded.type !== 'refresh') {
                    return res.status(403).json({ error: 'Invalid token type for refreshing.' });
                }

                try {
                    const user = await authService.findUserById(decoded.user_id);
                    if (!user) {
                        return res.status(403).json({ error: 'User belonging to token no longer exists.' });
                    }

                    const newAccessToken = generateAccessToken(user);
                    return res.status(200).json({ accessToken: newAccessToken });
                } catch (dbErr) {
                    console.error('Database error during refresh token verification:', dbErr);
                    return res.status(500).json({ error: 'Internal server error.' });
                }
            });
        } catch (err) {
            console.error('Refresh token error:', err.message);
            return res.status(500).json({ error: 'Internal server error.' });
        }
    }
};

module.exports = authController;