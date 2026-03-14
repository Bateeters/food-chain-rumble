const express = require('express')
const router = express.Router()

// Import individual route files
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const characterRoutes = require('./characterRoutes');
const matchRoutes = require('./matchRoutes');
const leaderboardRoutes = require('./leaderboardRoutes');
const forumRoutes = require('./forumRoutes');
const userStatsRoutes = require('./userStatsRoutes');

// Mount routes
router.use ('/auth', authRoutes);               // /api/auth/*
router.use('/users', userRoutes);               // /api/users/*
router.use('/characters', characterRoutes);     // /api/characters/*
router.use('/matches', matchRoutes);            // /api/matches/*
router.use('/leaderboard', leaderboardRoutes);  // /api/leaderboard/*
router.use('/forum', forumRoutes);              // /api/forum/*
router.use('/user', userStatsRoutes);           // /api/user/*

// Heath check route
router.get('/heath', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Food Chain Rumble API is running',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;