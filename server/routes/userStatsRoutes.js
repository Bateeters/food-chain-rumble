const express = require('express');
const router = express.Router();
const { getUserStats, getRecentMatches } = require('../controllers/userStatsController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// @route   GET /api/user/stats
// @desc    Get current user's overall stats
// @access  Private
router.get('/stats', getUserStats);

// @route   GET /api/user/recent-matches
// @desc    Get current user's recent matches
// @access  Private
router.get('/recent-matches', getRecentMatches);

module.exports = router;