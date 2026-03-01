const Match = require('../models/Match');
const PlayerStats = require('../models/PlayerStats');
const Character = require('../models/Character');
const User = require('../models/User');
const ForumBoard = require('../models/ForumBoard');
const mongoose = require('mongoose');

// @route   POST /api/matches
// @desc    Submit match results
// @access  Private/Admin (game server or admin)
const submitMatch = async (req, res) => {
    try {
        const {
            gameMode,
            players,
            winningTeam,
            duration,
            arena,
            startedAt,
            endedAt,
            replayUrl,
            serverRegion
        } = req.body;

        // Validation
        if (!gameMode || !players || !winningTeam || !duration) {
            return res.status(400).json({
                error: 'gameMode, players, winningTeam, and duration are required'
            });
        }

        // Validate player count matches game mode
        const expectedPlayerCount = {
            '1v1_ranked': 2,
            '1v1_casual': 2,
            '2v2_ranked': 4,
            '2v2_casual': 4,
            '3v3_ranked': 6,
            '3v3_casual': 6,
        };

        if (players.length !== expectedPlayerCount[gameMode]) {
            return res.status(400).json({
                error: `${gameMode} requires ${expectedPlayerCount[gamemode]} players, got ${players.length}`
            });
        }

        // Create match record
        const match = await Match.create({
            gameMode,
            players,
            winningTeam,
            duration,
            arena,
            startedAt,
            endedAt,
            replayUrl,
            serverRegion
        });

        // Update stats for each player
        for (const player of players) {
            // Update or create PlayerStats
            await PlayerStats.findOneAndUpdate(
                {
                    user: player.user,
                    character: player.character,
                    gameMode: gameMode
                },
                {
                    $inc: {
                        'stats.totalMatches': 1,
                        'stats.wins': player.result === 'win' ? 1 : 0,
                        'stats.losses': player.result === 'loss' ? 1 : 0,
                        'stats.totalKills': player.stats.kills || 0,
                        'stats.totalDeaths': player.stats.deaths || 0,
                        'stats.totalAssists': player.stats.assists || 0,
                        'stats.totalDamageDealt': player.stats.damageDealt || 0,
                        'stats.totalDamageTaken': player.stats.damageTaken || 0
                    },
                    $set: {
                        lastPlayed: new Date()
                    }
                },
                {
                    upsert: true,
                    new: true
                }
            );

            // Update win streaks
            const playerStat = await PlayerStats.findOne({
                user: player.user,
                character: player.character,
                gameMode: gameMode
            });

            if (player.result === 'win') {
                playerStat.stats.currentWinStreak += 1;
                if (playerStat.stats.currentWinStreak > playerStat.stats.longestWinStreak) {
                    playerStat.stats.longestWinStreak = playerStat.stats.currentWinStreak;
                } 
            } else {
                playerStat.stats.currentWinStreak = 0;
            }

            await playerStat.save();

            // Update Character global stats
            await Character.findByIdAndUpdate(
                player.character,
                {
                    $inc: {
                        'globalStats.totalPicks': 1,
                        'globalStats.totalWins': player.result === 'win' ? 1 : 0,
                        'globalStats.totalLosses': player.result === 'loss' ? 1 : 0,
                        'globalStats.totalKills': player.stats.kills || 0,
                        'globalStats.totalDeaths': player.stats.deaths || 0,
                        'globalStats.totalAssists': player.stats.assists || 0,
                        'globalStats.totalDamageDealt': player.stats.damageDealt || 0,
                        'globalStats.totalDamageTaken': player.stats.damageTaken || 0,
                    }
                }
            );
        }

        res.status(201).json({
            message: 'Match submitted successfully',
            match: {
                _id: match._id,
                gameMode: match.gameMode,
                winningTeam: match.winningTeam,
                duration: match.duration,
                createdAt: match.createdAt
            }
        });

    } catch (error) {
        console.error('Submit match error:', error);
        res.status(500).json({
            error: 'Error submitting match',
            details: error.message
        });
    }
};

// @route   GET /api/matches
// @desc    Get matches with filters
// @access  Private
const getMatches = async (req, res) => {
    try {
        const { gameMode, startDate, endDate, character, page = 1, limit = 20 } = req.query;

        // Build filter
        let filter = {};

        // If not admin, only show user's own matches
        if (req.user.role !== 'admin') {
            filter['players.User'] = req.user.id;
        }

        if (gameMode) {
            filter.gameMode = gameMode;
        }

        if (character) {
            filter['players.character'] = character;
        }

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        // Get matches
        const matches = await Match.find(filter)
            .populate('players.user', 'username avatar')
            .populate('players.character', 'name image')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Match.countDocuments(filter);

        res.json({
            matches,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get matches error:', error);
        res.status(500).json({
            error: 'Error fetching matches',
            details: error.message
        });
    }
};