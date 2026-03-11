const express = require('express');
const router = express.Router();

// Import controller functions
const {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getUserStats,
    updatePassword,
    banUser,
    unbanUser,
    getBanInfo,
    requestEmailChange,
    verifyEmailChange
} = require('../controllers/userController');

// Import middleware
const { protect, isAdmin } = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get  all users (admin only - for user management)
// @access  Private/Admin
router.get('/', protect, isAdmin, getAllUsers);

// @route   GET /api/users/:id
// @desc    Get user profile by ID (public profiles)
// @access  Public
router.get('/:id', getUserById);

// @route   PATCH /api/users/:id
// @desc    Update user profile (own profile only)
// @access  Private
router.patch('/:id', protect, updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user account (own account or admins)
// @access  Private
router.delete('/:id', protect, deleteUser);

// @route   GET /api/users/:id/stats
// @desc    Get user statistics (all game modes)
// @access  Public
router.get('/:id/stats', getUserStats);

// @route   POST /api/users/:id/password
// @desc    Change password (own account only)
// @access  Private
router.post('/:id/password', protect, updatePassword);

// @route   POST /api/users/:id/ban
// @desc    Ban a user account (admin/moderator only)
// @access  Private/Admin
router.post('/:id/ban', protect, isAdmin, banUser);

// @route   POST /api/users/:id/unban
// @desc    Unban a user account (admin/moderator only)
// @access  Private/Admin
router.post('/:id/unban', protect, isAdmin, unbanUser);

// @route   GET /api/users/:id/ban-info
// @desc    Get ban info for a user (public - so users can see why they're banned)
// @access  Public
router.get('/:id/ban-info', getBanInfo);

// @route   POST /api/users/:id/email/request-change
// @desc    Request email change (sends verification email)
// @access  Private (own account only)
router.post('/:id/email/request-change', protect, requestEmailChange);

// @route   POST /api/users/:id/email/verify-change
// @desc    Verify requested email change with sent token
// @access  Public (but requires token)
router.post('/:id/email/verify-change', verifyEmailChange);

module.exports = router;