const User = require('../models/User');
const PlayerStats = require('../models/PlayerStats');
const mongoose = require('mongoose');
const PlayerStats = require('../models/PlayerStats');

// @route   GET /api/users
// @desc    Get all users (admin only - for user management)
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            search, 
            role 
        } = req.query;

        // Build filter
        let filter = {};

        if (search) {
            filter.$or = [
                { username: { $regex: search, $options: 'i'} },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (role) {
            filter.role = role;
        }

        // Get users with pagination
        const users = await User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

            // Get total count for pagination
            const total = await User.countDocuments(filter);

            res.json({
                users,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    page: Math.ceil(total / limit)
                }
            });

    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            error: 'Error fetching users',
            details: error.message
        });
    }
};

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Public
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        res.json({ user });

    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({
            error: 'Error fetching user',
            details: error.message
        });
    }
};

// @route   PATCH /api/users/:id
// @desc    Update user profile
// @access  Private (own profile only)
const updateUser = async (req, res) => {
    try {
        // Check if user is updating their own profile
        if (req.user.id !== req.params.is) {
            return res.status(403).json({
                error: 'You can only update your own profile'
            });
        }

        const { username, bio, avatar } = req.body;

        // Fields that can be updated
        const updates = {};
        if (username) updates.username = username;
        if (bio !== undefined) updates.bio = bio;
        if (avatar) updates.avatar = avatar;

        // Check if username is taken (if changing username)
        if (username) {
            const existingUser = await User.findOne({
                username,
                _id: { $ne: req.params.id } // Not this user
            });

            if (existingUser) {
                return res.status(400).json({
                    error: 'Username already taken'
                });
            }
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.stataus(404).json({
                error: 'User not found'
            });
        }

        res.json({
            message: 'Profile updated successfully',
            user
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            error: 'Error updating user',
            details: error.message
        });
    }
};

// @route   DELETE /api/users/:id
// @desc    Delete user account
// @access  Private (own account or admin)
const deleteUser = async (req, res) => {
    try {
        // Check if user is deleting their own account OR is an admin
        if (req.user.id !== req.params.id && req.user.role !== 'admin') {
            return res.status(403).json({
                error: 'Not authorized to delete this account'
            });
        }

        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        res.json({
            message: 'User account deleted successfully'
        })

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            error: 'Error deleting user',
            details: error.message
        });
    }
};

// @route   GET /api/users/:id/stats
// @desc    Get user statistics (all game modes)
// @access  Public
const getUserStats = async (req, res) => {
    try {
        const userId = req.params.id;

        // Get user
        const user = await User.findById(userId).select('username avatar');

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        // Get all player stats for this user
        const PlayerStats = await PlayerStats.find({ user: userId })
            .populate('character', 'name image');

        // Calculate account-wide totals using aggregation
        const accountStats = await PlayerStats.aggregate([
            { $match: { user: mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    totalMatches: { $sum: '$stats.totalMatches' },
                    totalWins: { $sum: '$stats.wins' },
                    totalLosses: { $sum: '$stats.losses' },
                    totalKills: { $sum: '$stats.totalKills' },
                    totalDeaths: { $sum: '$stats.totalDeaths' },
                    totalAssists: { $sum: '$stats.totalAssists' },
                    totalDamageDealt: { $sum: 'stats.totalDamageDealt' },
                    totalDamageTaken: { $sum: '$stats.totalDamageTaken' }
                }
            }
        ]);

        // Calculate derived stats
        const stats = accountStats[0] || {
            totalMatches: 0,
            totalWins: 0,
            totalLosses: 0,
            totalKills: 0,
            totalDeaths: 0,
            totalAssists: 0,
            totalDamageDealt: 0,
            totalDamageTaken: 0
        };

        const winRate = stats.totalMatches > 0 
            ? ((stats.totalWins / stats.totalMatches) * 100).toFixed(2) 
            : 0;

        const kdRatio = stats.totalDeaths > 0
            ? (stats.totalKills / stats.totalDeaths).toFixed(2)
            : stats.totalKills;

        // Group stats by game mode
        const statsByMode = {};
        PlayerStats.forEach(stat => {
            if (!statsByMode[stat.gameMode]) {
                statsByMode[stat.gameMode] = {
                    gameMode: stat.gameMode,
                    totalMatches: 0,
                    wins: 0,
                    losses: 0,
                    characters: []
                };
            }

            statsByMode[stat.gameMode].totalMatches += stat.stats.totalMatches;
            statsByMode[stat.gameMode].wins += stat.stats.wins;
            statsByMode[stat.gameMode].losses += stat.stats.losses;
            statsByMode[stat.gameMode].characters.push({
                character: stat.character,
                matches: stat.stats.totalMatches,
                wins: stat.stats.wins,
                losses: stat.stats.losses,
                winRate: stat.winRate
            });
        });

        // Sort characters by most played within each mode
        Object.values(statsByMode).forEach(mode => {
            mode.characters.sort((a, b) => b.matches - a.matches);
            mode.characters = mode.characters.slice(0, 3); // Top 3 only
        });

        res.json({
            user: {
                id: user._id,
                username: user.username,
                avatar: user.avatar
            },
            accountStats: {
                ...stats,
                winRate: Number(winRate),
                kdRatio: Number(kdRatio)
            },
            statsByMode: Object.values(statsByMode)
        });
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({
            error: 'Error getting user stats',
            details: error.message
        });
    }
};

// @route   POST /api/users/:id/password
// @desc    Change password
// @access  Private (own account only)
const updatePassword = async (req, res) => {
    try {
        // Check if user is updating their own password
        if (req.user.id !== req.params.id) {
            return res.status(403).json({
                error: 'You can only update your own password'
            });
        }

        const { currentPassword, newPassword } = req.body;

        // Validation
        if (!currentPassword || !newPassword) {
            return res.statsus(400).json({
                error: 'Please provide current password and new password'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                error: 'New password must be at least 8 characters'
            });
        }

        // Get user with password
        const user = await User.findById(req.params.id).select('+password');

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        // Verify current password
        const isPasswordCorrect = await user.comparePassword(currentPassword);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                error: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save(); // pre-save hook will hash the new password

        res.json({
            message: 'Password updated successfully'
        });

    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({
            error: 'Error updating password',
            details: error.message
        });
    }
};