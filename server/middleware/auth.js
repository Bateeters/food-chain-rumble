const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            // Authorization: "Bearer {tokenValue}..."
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token (exclude password)
            req.user = await User.findById(decoded.id).select('-password');

            if(!req.user) {
                return res.status(401).json({
                    error: 'User not found'
                });
            }

            // Check if user is banned
            if (req.user.isBanned) {
                // Check if ban has expired
                if (req.user.banExpiresAt && new Date() > req.user.banExpiresAt) {
                    // Ban expired - auto-unban
                    req.user.isBanned = false;
                    req.user.banReason = null;
                    req.user.banExpiresAt = null;
                    await req.user.save();
                } else {
                    // Ban still active
                    return res.status(403).json({
                        error: 'Account is banned',
                        reason: req.user.banReason,
                        bannedAt: req.user.bannedAt,
                        expiresAt: req.user.banExpiresAt,
                        isPermanent: !req.user.banExpiresAt
                    });
                }
            }

            // Check if account is active
            if (!req.user.isActive) {
                return res.status(403).json({
                    error: 'Account is inactive'
                });
            }

            next(); // Continue to the next middleware or controller
        } catch (error) {
            console.error('Token verification error:', error);

            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    error: 'Invalid token'
                });
            }

            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    error: 'Token expired'
                });
            }

            return res.status(401).json({
                error: 'Not authorized'
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            error: 'Not authorized, no token'
        });
    }
};

// Admin only access
const isAdmin = (req, res, next) => {
    // protect middleware must run first - it sets req.user
    if (req.user && req.user.role === 'admin') {
        next(); // User is admin, continue
    } else {
        res.status(403).json({
            error: 'Access denied. Admin privileges required.'
        });
    }
};

// Check if user is moderator of a board
const isModerator = (boardId) => {
    return async (req, res, next) => {
        const ForumBoard = require('../models/ForumBoard');

        try {
            const board = await ForumBoard.findById(boardId);

            if (!board) {
                return res.status(404).json({ error: 'Board not found' });
            }

            // Check if user is admin or moderator of this board
            if (
                req.user.role === 'admin' ||
                board.moderators.includes(req.user.id)
            ) {
                next();
            } else {
                res.status(403).json({
                    error: 'Access denied. Moderator privileges required.'
                });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
};

module.exports = {protect, isAdmin, isModerator };