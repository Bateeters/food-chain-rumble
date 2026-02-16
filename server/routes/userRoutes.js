const express = require('express');
const router = express.Router();

// Import controller functions
const {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getUserStats,
    updatePassword
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
route.patch('/:id', protect, updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user account (own account or admins)
// @access  Private
route.delete('/:id', protect, deleteUser);

// @route   GET /api/users/:id/stats
// @desc    Get user statistics (all game modes)
// @access  Public
router.get('/:id/stats', getUserStats);

// @route   POST /api/users/:id/password
// @desc    Change password (own account only)
// @access  Private
router.post('/:id/password', protect, updatePassword);

module.exports = router;