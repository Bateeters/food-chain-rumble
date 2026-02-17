const express = require('express');
const router = express.Router();

// Import controller functions
const {
    submitMatch,
    getMatches,
    getMatchById,
    getRecentMatches,
    getUserMatchHistory,
    deleteMatch
} = require('../controllers/matchController');

// Import middleware
const { protect, isAdmin } = require('../middleware/auth');

// @route   Post /api/matches
// @desc    Submit match results (game server or admin)
// @access  Private/Admin
router.post('/', protect, isAdmin, submitMatch);

// @route   GET /api/matches
// @desc    Get matches (with filters - admin only for all matches, users see their own)
// @access  Private
router.get('/', protect, getMatches);

// @route   GET /api/matches/recent
// @desc    Get recent matches (public - for activity feed/homepage/tournament pages)
// @access  Public
router.get('/recent', getRecentMatches);

// @route   GET /api/matches/:id
// @desc    Get match details by ID
// @access  Public
router.get('/:id', getMatchById);

// @route   GET /api/matches/user/:userId
// @desc    Get match history for a specific user
// @access  Public
router.get('/user/:userId', getUserMatchHistory);

// @route   DELETE /api/matches/:id
// @desc    Delete match (admin only - for fixing errors)
// @access  Private/Admin
router.delete('/:id', protect, isAdmin, deleteMatch);

module.exports = router;