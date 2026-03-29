const Character = require('../models/Character');
const PlayerStats = require('../models/PlayerStats');
const mongoose = require('mongoose');

// @route   GET /api/characters
// @desc    Get all characters
// @access  Public
const getAllCharacters = async (req, res) => {
    try {
        const { available, difficulty, sort } = req.query;

        // Build filter
        let filter = {};

        if (available !== undefined) {
            filter.isAvailable = available === 'true';
        }

        if (difficulty) {
            filter.difficulty = parseInt(difficulty);
        }

        // Build sort
        let sortOption = {};

        switch (sort)  {
            case 'name':
                sortOption = { name: 1 };
                break;
            case '-winRate': {
                const pipeline = [
                    { $match: filter },
                    {
                        $addFields: {
                            _winRate: {
                                $cond: [
                                    { $gt: [{ $add: ['$globalStats.totalWins', '$globalStats.totalLosses'] }, 0] },
                                    { $divide: ['$globalStats.totalWins', { $add: ['$globalStats.totalWins', '$globalStats.totalLosses'] }] },
                                    0
                                ]
                            }
                        }
                    },
                    { $sort: { _winRate: -1 } },
                    { $unset: '_winRate' }
                ];
                const characters = await Character.aggregate(pipeline);
                return res.json({ characters, count: characters.length });
            }
            case 'releaseDate':
                sortOption = { releaseDate: 1 };
                break;
            case '-releaseDate':
                sortOption = { releaseDate: -1 };
                break;
            default:
                sortOption = { name: 1 }; // Default: alphabetical
        }

        // Get characters
        const characters = await Character.find(filter).sort(sortOption);

        res.json({
            characters,
            count: characters.length
        });

    } catch (error) {
        console.error('Get all characters error:', error);
        res.status(500).json({
            error: 'Error fetching characters',
            details: error.message
        });
    }
};

// @route   GET /api/characters/:id
// @desc    Get character by ID
// @access  Public
const getCharacterById = async (req, res) => {
    try {
        const character = await Character.findById(req.params.id);

        if (!character) {
        return res.status(404).json({
            error: 'Character not found'
        });
        }

        res.json({ character });

    } catch (error) {
        console.error('Get character by ID error:', error);
        res.status(500).json({
        error: 'Error fetching character',
        details: error.message
        });
    }
};

// @route   POST /api/characters
// @desc    Create a new character
// @access  Private/Admin
const createCharacter = async (req, res) => {
    try {
        const {
            name,
            description,
            image,
            abilities,
            talents,
            difficulty,
            isAvailable,
            releaseDate
        } = req.body;

        // Validation
        if (!name || !description) {
            return res.status(400).json({
                error: 'Name and description are required'
            });
        }

        // Check if character name already exists
        const existingCharacter = await Character.findOne({ name });

        if (existingCharacter) {
            return res.status(400).json({
                error: 'Character with this name already exists'
            });
        }

        // Create character
        const character = await Character.create({
            name,
            description,
            image,
            abilities,
            talents,
            difficulty,
            isAvailable,
            releaseDate
        });

        res.status(201).json({
            message: 'Character created successfully',
            character
        });

    } catch (error) {
        console.error('Create character error:', error);
        res.status(500).json({
            error: 'Error creating character',
            details: error.message
        });
    }
};

// @route   PATCH /api/characters/:id
// @desc    Update a character
// @access  Private/Admin
const updateCharacter = async (req, res) => {
    try {
        const updates = req.body;

        // If updating name, check it's not taken
        if (updates.name) {
            const existingCharacter = await Character.findOne({
                name: updates.name,
                _id: { $ne: req.params.id }
            });

            if (existingCharacter) {
                return res.status(400).json({
                    error: 'Character name already taken'
                });
            }
        }

        const character = await Character.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!character) {
            return res.status(404).json({
                error: 'Character not found'
            });
        }

        res.json({
            message: 'Character updated successfully',
            character
        });

    } catch (error) {
        console.error('Update character error:', error);
        res.status(500).json({
            error: 'Error updating character',
            details: error.message
        });
    }
};

// @route   DELETE /api/characters/:id
// @desc    Delete a character
// @access  Private/Admin
const deleteCharacter = async (req, res) => {
    try {
        const character = await Character.findByIdAndDelete(req.params.id);

        if (!character) {
            return res.status(404).json({
                error: 'Character not found'
            });
        }

        res.json({
            message: 'Character deleted successfully'
        });

    } catch (error) {
        console.error('Delete character error:', error);
        res.status(500).json({
            error: 'Error deleting character',
            details: error.message
        });
    }
};

// @route   GET /api/characters/:id/stats
// @desc    Get character global statistics
// @access  Public
const getCharacterStats = async (req, res) => {
    try {
        const characterId = req.params.id;

        // Get character
        const character = await Character.findById(characterId);

        if (!character) {
            return res.status(404).json({
                error: 'Character not found'
            });
        }

        // Get stats by game mode
        const statsByMode = await PlayerStats.aggregate([
            { $match: { character: mongoose.Types.ObjectId(characterId) } },
            {
                $group: {
                    _id: '$gameMode',
                    totalPicks: { $sum: '$stats.totalMatches' },
                    totalWins: { $sum: '$stats.wins' },
                    totalLosses: { $sum: '$stats.losses' },
                    totalKills: { $sum: '$stats.totalKills' },
                    totalDeaths: { $sum: '$stats.totalDeaths' },
                    totalAssists: { $sum: '$stats.totalAssists' },
                    totalDamageDealt: { $sum: '$stats.totalDamageDealt' },
                    totalDamageTaken: { $sum: '$stats.totalDamageTaken' }
                }
            },
            {
                $addFields: {
                    gameMode: '$_id',
                    winRate: {
                        $cond: [
                            { $gt: [{ $add: ['$totalWins', '$totalLosses'] }, 0] },
                            {
                                $multiply: [
                                    { $divide: ['$totalWins', { $add: ['$totalWins', '$totalLosses'] }] },
                                    100
                                ]
                            },
                            0
                        ]
                    }
                }
            },
            { $project: { _id: 0 } },
            { $sort: { totalPicks: -1 } }
        ]);

        // Get top players for this character (across all modes)
        const topPlayers = await PlayerStats.find({ character: characterId })
            .populate('user', 'username avatar')
            .sort({ 'stats.wins': -1 })
            .limit(10);
        
        res.json({
            character: {
                _id: character._id,
                name: character.name,
                image: character.image
            },
            globalStats: character.globalStats,
            statsByMode,
            topPlayers: topPlayers.map(stat => ({
                user: stat.user,
                gameMode: stat.gameMode,
                stats: {
                    totalMatches: stat.stats.totalMatches,
                    wins: stat.stats.wins,
                    losses: stat.stats.losses,
                    winRate: stat.winRate
                }
            }))
        });

    } catch (error) {
        console.error('Get character stats error:', error);
        res.status(500).json({
            error: 'Error fetching character stats',
            details: error.message
        });
    }
};

// @route   GET /api/characters/:id/leaderboard
// @desc    Get top players for a specific character (by character MMR)
// @access  Public
const getCharacterLeaderboard = async (req, res) => {
    try {
        const characterId = req.params.id;
        const { gameMode, limit = 100 } = req.query;

        // Get character
        const character = await Character.findById(characterId);

        if (!character) {
            return res.status(404).json({
                error: 'Character not found'
            });
        }

        // Build filter
        let filter = { character: characterId };
        if (gameMode) {
            filter.gameMode = gameMode;
        } else {
            // Default to ranked modes only
            filter.gameMode = { $in: ['1v1_ranked', '2v2_ranked', '3v3_ranked'] };
        }

        // Get top players by CHARACTER MMR for this character
        const leaderboard = await PlayerStats.find(filter)
            .populate('user', 'username avatar')
            .sort({ characterMMR: -1 })
            .limit(parseInt(limit));

        // Calculate total players
        const total = await PlayerStats.countDocuments(filter);

        res.json({
            character: {
                _id: character._id,
                name: character.name,
                image: character.image
            },
            gameMode: gameMode || 'all_ranked',
            leaderboard: leaderboard.map((stat, index) => ({
                rank: index + 1,
                user: stat.user,
                characterMMR: stat.characterMMR,
                peakCharacterMMR: stat.peakCharacterMMR,
                accountMMR: stat.accountMMR, // for context
                visibleRank: stat.rank, // their overall rank
                stats: {
                    totalMatches: stat.stats.totalMatches,
                    wins: stat.stats.wins,
                    losses: stat.stats.losses,
                    winRate: stat.winRate,
                    kdRatio: stat.kdRatio
                }
            })),
            total
        });

    } catch (error) {
        console.error('Get character leaderboard error:', error);
        res.status(500).json({
            error: 'Error fetching character leaderboard',
            details: error.message
        });
    }
};

// @route   GET /api/characters/:id/leaderboard/rank/:userId
// @desc    Get user's rank on a specific character
// @access  Public
const getCharacterLeaderboardRank = async (req, res) => {
    try {
        const { id: characterId, userId } = req.params;
        const { gameMode } = req.query;

        // Get character
        const character = await Character.findById(characterId);

        if (!character) {
            return res.status(404).json({
                error: 'Character not found'
            });
        }

        // Build filter
        let filter = {
            character: characterId,
            user: userId
        };

        if (gameMode) {
            filter.gameMode = gameMode;
        } else {
            // Default to ranked modes
            filter.gameMode = { $in: ['1v1_ranked', '2v2_ranked', '3v3_ranked'] };
        }

        // Get user's stats for this character
        const userStats = await PlayerStats.findOne(filter)
            .populate('user', 'username avatar');

        if (!userStats) {
            return res.status(404).json({
                error: 'User has no stats for this character in ranked modes'
            });
        }

        // Calculate rank (count how many players have higher character MMR)
        let rankFilter = { character: characterId };
        if (gameMode) {
            rankFilter.gameMode = gameMode;
        } else {
            rankFilter.gameMode = { $in: ['1v1_ranked', '2v2_ranked', '3v3_ranked'] };
        }

        const playersAbove = await PlayerStats.countDocuments({
            ...rankFilter,
            characterMMR: { $gt: userStats.characterMMR }
        });

        const rank = playersAbove + 1;

        // Get total players for this character
        const totalPlayers = await PlayerStats.countDocuments(rankFilter);

        // Calculate percentile
        const percentile = totalPlayers > 0
            ? ((1 - (rank - 1) / totalPlayers) * 100).toFixed(2)
            : 0;

        res.json({
            character: {
                _id: character._id,
                name: character.name,
                image: character.image
            },
            gameMode: gameMode || 'all_ranked',
            user: userStats.user,
            rank,
            totalPlayers,
            percentile,
            characterMMR: userStats.characterMMR,
            accountMMR: userStats.accountMMR,
            visibleRank: userStats.rank,
            stats: {
                totalMatches: userStats.stats.totalMatches,
                wins: userStats.stats.wins,
                losses: userStats.stats.losses,
                winRate: userStats.winRate,
                kdRatio: userStats.kdRatio,
                totalAssists: userStats.stats.totalAssists
            }
        });

    } catch (error) {
        console.error('Get user character rank error:', error);
        res.status(500).json({
            error: 'Error fetching user character rank',
            details: error.message
        });
    }
};

module.exports = {
    getAllCharacters,
    getCharacterById,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    getCharacterStats,
    getCharacterLeaderboard,
    getCharacterLeaderboardRank
};