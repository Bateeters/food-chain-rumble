const express = require('express');
const router = express.Router();

// Import controller functions
const {
    getAllCharacters,
    getCharacterById,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    getCharacterStats,
    getCharacterLeaderboard
} = require('../controllers/characterController');

// Import middleware
const { protect, isAdmin } = require('../middleware/auth');

// @route   GET /api/characters
// @desc    Get all characters (with optional filters)
// @access  Public
router.get('/', getAllCharacters);

// @route   GET /api/characters/:id
// @desc    Get character details by ID
// @access  Public
router.get('/:id', getCharacterById);

// @route   POST /api/characters
// @desc    Create a new character (admin only)
// @access  Private/Admin
router.post('/:id', protect, isAdmin, createCharacter);

// @route   PATCH /api/characters/:id
// @desc    Update character (admin only)
// @access  Private/Admin
router.patch('/:id', protect, isAdmin, updateCharacter);

// @route   DELETE /api/characters/:id
// @desc    Delete character (admin only)
// @access  Private/Admin
router.delete('/:id', protect, isAdmin, deleteCharacter);

// @route   GET /api/character/:id/stats
// @desc    Get global stats for a character
// @access  Public
router.get('/:id/stats', getCharacterStats);

// @route   GET /api/characters/:id/leaderboard
// @desc    Get top players for a specific character
// @access  Public
router.get('/:id/leaderboard', getCharacterLeaderboard);

module.exports = router;