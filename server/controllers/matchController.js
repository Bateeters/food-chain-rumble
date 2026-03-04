const Match = require('../models/Match');
const PlayerStats = require('../models/PlayerStats');
const Character = require('../models/Character');
const User = require('../models/User');
const ForumBoard = require('../models/ForumBoard');
const mongoose = require('mongoose');

const {
    calculateExpectedScore,
    calculateMMRChange,
    calculatePerformanceBonus,
    getRankFromMMR,
    calculateTeamAverageStats,
    calculateAverageOpponentMMR
} = require('../utils/mmrHelpers');

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

            // Update MMR
            if (match.gameMode.includes('_ranked')) {
                // Get opponents for this player
                const opponents = match.players.filter(p => p.team !== player.team);

                // Need to fetch opponent PlayerStats to get their MMRs
                const opponentStats = []; // initialize empty array
                for (const opp of opponents) {
                    const oppStat = await PlayerStats.findOne({
                        user: opp.user,
                        characer: opp.character,
                        gameMode: match.gameMode
                    });

                    // Add to empty array
                    if (oppStat) {
                        opponentStats.push(oppStat);
                    }
                }

                // Calculate average opponent MMR
                avgOpponentMMR = calculateAverageOpponentMMR(opponentStats);

                // Calculate team average stats for performance bonus
                const teamPlayers = match.players.filter(p => p.team === player.team);
                const teamAvgStats = calculateTeamAverageStats(teamPlayers);

                // Calculate performance bonus
                const performanceBonus = calculatePerformanceBonus(
                    player.stats,
                    teamAvgStats,
                    player.result
                );

                // Get k-Factor (uncertainty)
                const kFactor = playerStat.mmrUncertainty || 20;

                // Calculate base MMR change
                const baseMmrChange = calculateMMRChange(
                    playerStat.mmr,
                    avgOpponentMMR,
                    player.result === 'win',
                    kFactor
                );

                // Total MMR change (base + performance)
                const totalMmrChange = baseMmrChange + performanceBonus;

                // Update MMR
                playerStat.mmr += totalMmrChange;
                playerStat.mmr = Math.max(0, playerStat.mmr)

                // Update peak MMR if needed
                if (playerStat.mmr > playerStat.peakMmr) {
                    playerStat.peakMmr = playerStat.mmr;
                }

                // Decrease uncertainty over time (placement matches)
                if (playerStat.stats.totalMatches >= 10) {
                    playerStat.mmrUncertainty = Math.max(10, playerStat.mmrUncertainty - 0.5);
                }

                // Update visible rank based on new MMR
                const newRank = getRankFromMMR(playerStat.mmr);
                playerStat.rank = newRank;

                // Save MMR changes
                await playerStat.save();
            }

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

// @route   GET /api/matcches/recent
// @desc    Get recent matches (public)
// @access  Public
const getRecentMatches = async (req, res) => {
    try {
        const { gameMode, limit = 10 } = req.query;

        let filter = {};
        if (gameMode) {
            filter.gameMode = gameMode;
        }

        const matches = await Match.find(filter)
            .populate('players.user', 'username avatar')
            .populate('players.character', 'name image')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json({
            recentMatches: matches,
            total: matches.length
        });

    } catch (error) {
        console.error('Get recent matches error:', error);
        res.status(500).json({
            error: 'Error fetching recent matches',
            details: error.message
        });
    }
};

// @route   GET /api/matches/:id
// @desc    Get match by ID
// @access  Public
const getMatchById = async (req, res) => {
    try {
        const match = await Match.findById(req.params.id)
            .populate('players.user', 'username avatar')
            .populate('players.character', 'name image');

        if (!match) {
            return res.status(404).json({
                error: 'Match not found'
            });
        }

        res.json({ match });

    } catch (error) {
        console.error('Get match by ID error:', error);
        res.status(500).json({
            error: 'Error fetching match',
            details: error.message
        });
    }
};

// @route   GET /api/matches/user/:userId
// @desc    Get user match history
// @access  Public
const getUserMatchHistory = async (req, res) => {
    try {
        const { gameMode, character, page = 1, limit = 20 } = req.query;

        let filter = {
            'players.user': req.params.userId
        };

        if (gameMode) {
            filter.gameMode = gameMode;
        }

        if (character) {
            filter['players.user.character'] = character;
        }

        const matches = await Match.find(filter)
            .populate('players.user', 'username avatar')
            .populate('players.character', 'name image')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Match.countDocuments(filter);

        // Calculate summary stats
        let wins = 0;
        let losses = 0;

        matches.forEach(match => {
            const playerData = match.players.find(p => p.user._id.toString() === req.params.userId);
            if (playerData) {
                if (playerData.result === 'win') wins++;
                if (playerData.result === 'loss') losses++;
            }
        });

        res.json({
            user: {
                userId: req.params.userId
            },
            matches,
            pagination: {
                page: number(page),
                limit: number(limit),
                total,
                pages: Math.ceil(total / limit)
            },
            summary: {
                totalMatches: wins + losses,
                wins,
                losses,
                winRate: wins + losses > 0 ? ((wins / (wins + losses)) * 100).toFixed(2) : 0
            }
        });

    } catch (error) {
        console.error('Get user match history error:', error);
        res.status(500).json({
            error: 'Error fetching user match history',
            details: error.message
        });
    }
};

// @route   DELETE /api/matches/:id
// @desc    Delete match (admin only - for fixing errors)
// @access  Private/Admin
const deleteMatch = async (req, res) => {
    try {
        const match = await Match.findById(req.params.id);

        if (!match) {
            return res.status(404).json({
                error: 'Match not found'
            });
        }

        // Reverse the stats updates (this is complex - simplified version)
        // In production, you'd want to be more careful about this
        for (const player of match.players) {
            await PlayerStats.findOneAndUpdate(
                {
                    user: player.user,
                    character: player.character,
                    gameMode: match.gameMode
                },
                {
                    $inc: {
                        'stats.totalMatches': -1,
                        'stats.wins': player.result === 'win' ? -1 : 0,
                        'stats.losses': player.result === 'loss' ? -1 : 0,
                        'stats.totalKills': -(player.stats.kills || 0),
                        'stats.totalDeaths': -(player.stats.deaths || 0),
                        'stats.totalAssists': -(player.stats.assists || 0),
                        'stats.totalDamageDealt': -(player.stats.damageDealt || 0),
                        'stats.totalDamageTaken': -(player.stats.damageTaken || 0),
                    }
                }
            );

            await Character.findByIdAndUpdate(
                player.character,
                {
                    $inc: {
                        'globalStats.totalPicks': -1,
                        'globalStats.totalWins': player.result === 'win' ? -1 : 0,
                        'globalStats.totalLosses': player.result === 'loss' ? -1 : 0,
                        'globalStats.totalKills': -(player.stats.kills || 0),
                        'globalStats.totalDeaths': -(player.stats.deaths || 0),
                        'globalStats.totalAssists': -(player.stats.assists || 0),
                        'globalStats.totalDamageDealt': -(player.stats.damageDealt || 0),
                        'globalStats.totalDamageTaken': -(player.stats.damageTaken || 0),
                    }
                }
            );
        }

        await match.deleteOne();

        res.json({
            message: 'Match deleted successfully',
            matchId: req.params.id
        });

    } catch (error) {
        console.error ('Delete match error:', error);
        res.status(500).json({
            error: 'Error deleting match',
            details: error.message
        });
    }
};

module.esports = {
    submitMatch,
    getMatches,
    getRecentMatches,
    getMatchById,
    getUserMatchHistory,
    deleteMatch
};