const PlayerStats = require('../models/PlayerStats');
const Character = require('../models/Character');
const TalentStats = require('../models/TalentStats');
const BuildStats = require('../models/BuildStats');
const mongoose = require('mongoose');

// @route   GET /api/leaderboard/gameMode
// @desc    Get player leaderboard for a specific game mode
// @access  Public
const getLeaderboard = async (req, res) => {
    try {
        const { gameMode } = req.params;
        const { page = 1 , limit = 100, search, region } = req.query;

        // Validate game mode
        const validModes = ['1v1_ranked', '2v2_ranked', '3v3_ranked'];
        if (!validModes.includes(gameMode)) {
            return res.status(400).json({
                error: 'Invalid game mode',
                validModes
            });
        }

        // Build filter
        let filter = { gameMode };

        // Build aggregation pipeline to get top stats per user
        const leaderboard = await PlayerStats.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$user',
                    totalMatches: { $sum: '$stats.totalMatches' },
                    totalWins: { $sum: '$stats.wins' },
                    totalLosses: { $sum: '$stats.losses' },
                    totalKills: { $sum: '$stats.totalKills' },
                    totalDeaths: { $sum: '$stats.totalDeaths' },
                    totalAssists: { $sum: '$stats.totalAssists' },
                    topCharacters: {
                        $push: {
                            character: '$character',
                            matches: '$stats.totalMatches',
                            wins: '$stats.wins'
                        }
                    }
                }
            },
            {
                $addFields: {
                    winRate: {
                        $cond: [
                            { $gt: ['$totalMatches', 0] },
                            { $multiply: [{ $divide: ['$totalWins', '$totalMatches'] }, 100] },
                            0
                        ]
                    },
                    kdRatio: {
                        $cond: [
                            { $gt: ['$totalDeaths', 0] },
                            { $divide: ['$totalKills', '$totalDeaths'] },
                            '$totalKills'
                        ]
                    },
                    assistPerMatch: {
                        $cond: [
                            { $gt: ['$totalMatches', 0] },
                            { $divide: ['$totalAssists', '$totalMatches'] },
                            '$totalAssists'
                        ]
                    }
                }
            },
            { $sort: { totalWins: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: parseInt(limit) }
        ]);

        // Populate user and character details
        await PlayerStats.populate(leaderboard, [
            { path: '_id', select: 'username avatar' },
            { path: 'topCharacters.character', select: 'name image' }
        ]);

        // Sort and limit top characters for each user
        leaderboard.forEach(entry => {
            entry.user = entry._id;
            delete entry._id;

            entry.topCharacters.sort((a, b) => b.matches - a.matches);
            entry.topCharacters = entry.topCharacters.slice(0, 3);
        });

        // Get total count for pagination
        const totalCount = await PlayerStats.aggregate([
            { $match: filter },
            { $group: { _id: '$user' } },
            { $count: 'total' }
        ]);

        const total = totalCount[0]?.total || 0;

        res.json({
            gameMode,
            leaderboard: leaderboard.map((entry, index) => ({
                rank: (page - 1) * limit + index + 1,
                user: entry.user,
                stats: {
                    totalMatches: entry.totalMatches,
                    wins: entry.totalWins,
                    losses: entry.totalLosses,
                    winRate: Number(entry.winRate.toFixed(2)),
                    kdRatio: Number(entry.kdRatio.toFixed(2)),
                    assistPerMatch: Number(entry.assistPerMatch.toFixed(2)),
                    currentWinStreak: entry.currentWinStreak,
                    longesetWinStreak: entry.longesetWinStreak
                },
                topCharacters: entry.topCharacters
            })),
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({
            error: 'Error fetching leaderboard',
            details: error.message
        });
    }
};

// @route   GET /api/leaderboard/:gameMode/rank/:userId
// @desc    Get a specific player's rank in a game mode
// @access  Public
const getPlayerRank = async (req, res) => {
    try {
        const { gameMode, userId } = req.params;

        // Validate game mode
        const validModes = ['1v1_ranked', '2v2_ranked', '3v3_ranked'];
        if (!validModes.includes(gameMode)) {
            return res.status(400).json({
                error: 'Invalid game mode',
                validModes
            });
        }

        // Get player's total stats for this mode
        const playerStats = await PlayerStats.aggregate([
            { $match: {user: mongoose.Types.ObjectId(userId), gameMode } },
            {
                $group: {
                    _id: '$user',
                    totalMatches: { $sum: '$stats.totalMatches' },
                    totalWins: { $sum: '$stats.wins' },
                    totalLosses: { $sum: '$stats.losses' },
                    totalKills: { $sum: '$stats.totalKills' },
                    totalDeaths: { $sum: '$stats.totalDeaths' },
                    totalAssists: { $sum: '$stats.totalAssists' },
                    topCharacters: {
                        $push: {
                            character: '$character',
                            matches: '$stats.totalMatches',
                            wins: '$stats.wins'
                        }
                    }
                }
            }
        ]);

        if (!playerStats.length) {
            return res.status(404).json({
                error: 'Player has no stats in this game mode'
            });
        }

        const stats = playerStats[0];

        // Calculate player's rank (count how many players have more wins)
        const rankData = await PlayerStats.aggregate([
            { $match: { gameMode } },
            { 
                $group: {
                    _id: '$user',
                    totalWins: { $sum: '$stats.wins' }
                }
            },
            {
                $match: {
                    totalWins: { $gt: stats.totalWins }
                }
            },
            { $count: 'playersAbove' }
        ]);

        const rank = (rankData[0]?.playersAbove || 0) + 1;

        // Get total players count
        const totalPlayersData = await PlayerStats.aggregate([
            { $match: { gameMode } },
            { $group: { _id: '$user' } },
            { $count: 'total' }
        ]);

        const totalPlayers = totalPlayersData[0]?.total || 0;

        // Populate user and character details
        await PlayerStats.populate(stats, [
            { path: '_id', select: 'username avatar' },
            { path: 'topCharacters.character', select: 'name image' }
        ]);

        // Sort and limit top characters
        stats.topCharacters.sort((a, b) => b.matches - a.matches);
        stats.topCharacters = stats.topCharacters.slice(0, 3);

        res.json({
            gameMode,
            user: stats._id,
            rank,
            totalPlayers,
            percentile: totalPlayers > 0 ? ((1 - (rank - 1) / totalPlayers) * 100).toFixed(2) : 0,
            stats: {
                totalMatches: stats.totalMatches,
                wins: stats.totalWins,
                losses: stats.totalLosses,
                winRate: stats.totalMatches > 0 ? ((stats.totalWins / stats.totalMatches) * 100).toFixed(2): 0,
                kdRatio: stats.totalDeaths > 0 ? (stats.totalKills / stats.totalDeaths).toFixed(2) : stats.totalKills,
                assistsPerMach: stats.totalMatches > 0 ? (stats.totalAssists / stats.totalMatches).toFixed(2) : 0
            },
            topCharacters: stats.topCharacters
        });

    } catch (error) {
        console.error('Get player rank error:', error);
        res.status(500).json({
            error: 'Error fetching player rank',
            details: error.message
        });
    }
};