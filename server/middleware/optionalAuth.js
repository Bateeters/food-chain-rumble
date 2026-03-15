const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Optional authentication - sets req.user if token exists, but doesn't block if not
const optionalAuth = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            try {
                // Verify token
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                
                // Get user from token
                req.user = await User.findById(decoded.id).select('-password');
                
            } catch (err) {
                // Token invalid but continue anyway
                console.log('Optional auth - Invalid token, continuing without auth');
            }
        } else {
            console.log('Optional auth - No token provided, continuing without auth');
        }

        next();
    } catch (error) {
        console.error('Optional auth error:', error);
        next(); // Continue even if error
    }
};

module.exports = { optionalAuth };