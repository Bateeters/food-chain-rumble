const express = require('express');
const router = express.Router();

// Import controller functions
const {
    register,
    login,
    logout,
    getCurrentUser,
    refreshToken,
    verifyEmail
} = require('../controllers/authController');

// Import middleware
const { protect } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user and return token
// @access  Public
router.post('/login', login);

// @route   POST /api/auth/logout
// @desc    Logout user (clear token)
// @access  Private
router.post('/logout', protect, logout);

// @route   GET /api/auth/me
// @desc    Get currently logged in user
// @access  Private
router.get('/me', protect, getCurrentUser);

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public (but requires refresh token)
router.post('/refresh', refreshToken);

// @route   GET /api/auth/verify-email/:token
// @desc    Verify user email address
// @access  Public
router.get('/verify-email/:token', verifyEmail);

module.exports = router;