const express = require('express');
const router = express.Router();

// Import controller functions
const {
    getLeaderboard,
    getPlayerRank,
    getCharacterLeaderboard,
    getTopCharacters,
    getCharacterBalanceData,
    getTalentBalanceData,
    getBuildBalanceData
} = require('../controllers/leaderboardController');

// Import middleware
const { protect, isAdmin } = require('../middleware/auth');

// @route   GET /api/leaderboard/characters/top
// @desc    Get overall top characters across all ranked modes
// @access  Public
router.get('/characters/top', getTopCharacters);

// @route   GET /api/leaderboards/balance/characters
// @desc    Get DETAILED character balance data including talent usage
// @access  Private/Admin
router.get('/balance/characters', protect, isAdmin, getCharacterBalanceData);

// @route   GET /api/leaderboard/balance/talents
// @desc    Get talent usage and win rate data for balancing
// @access  Private/Admin
router.get('/balance/talents', protect, isAdmin, getTalentBalanceData);

// @route   GET /api/leaderboard/balance/builds
// @desc    Get build combination data (*which builds are dominating)
// @access  Private/Admin
router.get('/balance/builds', protect, isAdmin, getBuildBalanceData);

// @route   GET /api/leaderboard/:gameMode
// @desc    Get player leaderboard for a specific game mode
// @access  Public
router.get('/:gameMode', getLeaderboard);

// @route   GET /api/leaderboard/:gameMode/character
// @desc    Get top characters (win rate) for a specific game mode
// @access  Public
router.get('/:gameMode/character', getCharacterLeaderboard);

// @route   GET /api/leaderboard/:gameMode/rank/:userId
// @desc    Get a specific player's rank in a game mode
// @access  Public
router.get('/:gameMode/rank/:userId', getPlayerRank);

module.exports = router;
