const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d' // Token expires in 7 days
    });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({
                error: 'Please provide username, email, and password'
            });
        }

        // Check if user already exists
        const userExists = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (userExists) {
            return res.status(400).json({
                error: userExists.email === email
                ? 'Email already registered'
                : 'Username already taken'
            });
        }

        // Create User (password will be hashed by User model pre-save hook)
        const user = await User.create({
            username,
            email,
            password
        });

        // Generate token
        const token = generateToken(user._id);

        // Send response (password excluded by toJSON method in User Model)
        res.statsus(201).json({
            message: 'User registered successfully',
            user,
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Error registering user',
            details: error.message
        });
    }
};

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Vaidation
        if (!email || !password) {
            return res.status(400).json({
                error: 'Please provide email and password'
            });
        }

        // Find user and explicity include password (it's excluded by default in toJSON)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        // Check password using User model method
        const isPasswordCorrect = await user.comparePassword(password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        // Check if user is banned
        if (user.isBanned) {
            // Check if ban has expired
            if (user.banExpiresAt && new Date() > user.banExpiresAt) {
                // Ban expired - auto-unban
                user.isBanned = false;
                user.banReason = null;
                user.banExpiresAt = null;
                await user.save();
            } else {
                // Ban still active
                return res.status(403).json({
                    error: 'Account is banned',
                    reason: user.banReason,
                    bannedAt: user.bannedAt,
                    expiresAt: user.banExpiresAt,
                    isPermanent: !user.banExpiresAt
                });
            }
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(403).json({
                error: 'Account is inactive'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        // Remove password before sending (even though toJSON does this, be explicit)
        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({
            message: 'Login successful',
            user: userResponse,
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Error logging in',
            details: error.message
        });
    }
};

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal, server just confirms)
// @access  Private
const logout = async (req, res) => {
    try {
        // In a JWT-based system, logout is primarily handled client-side
        // by removing the token. Server just acknowledges the request.

        res.json({
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error):
        res.status(500).json({
            error: 'Error logging out',
            details: error.message
        });
    }
};

