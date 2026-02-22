const User = require('../models/User');
const PlayerStats = require('../models/PlayerStats');
const mongoose = require('mongoose');

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
}