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