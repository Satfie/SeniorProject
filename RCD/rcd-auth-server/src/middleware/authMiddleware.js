// filepath: /rcd-auth-server/rcd-auth-server/src/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware = (req, res, next) => {
    const headerToken = req.headers['authorization']?.split(' ')[1];
    const token = headerToken || req.query?.token;
    if (!token) {
        console.warn('[auth] Missing token');
        return res.status(401).json({ message: 'No token provided, authorization denied.' });
    }

    const secret = process.env.JWT_SECRET || 'change_this_secret_in_env';
    jwt.verify(token, secret, async (err, decoded) => {
        if (err) {
            console.warn('[auth] JWT verify failed:', err.message);
            return res.status(401).json({ message: 'Token is not valid.' });
        }

        try {
            const user = await User.findById(decoded.id);
            if (!user) {
                console.warn('[auth] User not found id=', decoded.id);
                return res.status(404).json({ message: 'User not found.' });
            }
            req.user = user;
            next();
        } catch (error) {
            console.error('[auth] Server error fetching user:', error);
            return res.status(500).json({ message: 'Server error.' });
        }
    });
};

module.exports = authMiddleware;