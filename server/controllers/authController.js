const crypto = require('crypto');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const { getVerificationEmailTemplate, getWelcomeEmailTemplate } = require('../utils/emailTemplates');

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

        // Generate email verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Create User (password will be hashed by User model pre-save hook)
        const user = await User.create({
            username,
            email,
            password,
            emailVerificationToken: verificationToken,
            emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        });

        // Send verification email
        const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
        const template = getVerificationEmailTemplate(username, verificationUrl);
        await sendEmail({ email, subject: template.subject, html: template.html, text: template.text });

        res.status(201).json({
            message: 'Registration successful! Please check your email to verify your account.'
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

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                error: 'Please provide email and password'
            });
        }

        // Find user and explicitly include password (it's excluded by default in toJSON)
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

        // Check if email is verified
        if (!user.isEmailVerified) {
            return res.status(401).json({
                error: 'Email not verified. Please check your inbox for verification email.'
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
        console.error('Logout error:', error);
        res.status(500).json({
            error: 'Error logging out',
            details: error.message
        });
    }
};

// @route   GET /api/auth/me
// @desc    Get current logged-in user
// @access  Private
const getCurrentUser = async (req, res) => {
    try {
        // req.user is set by protect middleware
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        res.json({ user });

    } catch (error) {
        res.status(500).json({
            error: 'Error fetching user',
            details: error.message
        });
    }
};

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public (but requires valid token)
const refreshToken = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                error: 'Token is required'
            });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        // Check if banned or inactive
        if (user.isBanned) {
            return res.status(403).json({
                error: 'Account is banned'
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                error: 'Account is inactive'
            });
        }

        // Generate new token
        const newToken = generateToken(user._id);

        res.json({
            message: 'Token refreshed',
            token: newToken
        });

    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Invalid or expired token'
            });
        }

        console.error('Refresh token error:', error);
        res.status(500).json({
            error: 'Error refreshing token',
            details: error.message
        });
    }
};

// @route   GET /api/auth/verify-email/:token
// @desc    Verify user email address
// @access  Public
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                error: 'Verification link is invalid or has expired.'
            });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        // Send welcome email (non-blocking)
        const template = getWelcomeEmailTemplate(user.username);
        sendEmail({ email: user.email, subject: template.subject, html: template.html, text: template.text })
            .catch(err => console.error('Welcome email failed:', err));

        res.json({ message: 'Email verified successfully! You can now log in.' });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ error: 'Error verifying email', details: error.message });
    }
};

module.exports = {
    register,
    login,
    logout,
    getCurrentUser,
    refreshToken,
    verifyEmail
};