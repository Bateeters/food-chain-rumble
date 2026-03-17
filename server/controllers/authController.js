const crypto = require('crypto');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const { 
    getVerificationEmailTemplate, 
    getWelcomeEmailTemplate,
    getPasswordResetEmailTemplate 
} = require('../utils/emailTemplates');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
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

        // Generate email verification token (plain)
        const verificationToken = crypto.randomBytes(32).toString('hex');
        
        // Hash token for database storage (security!)
        const hashedToken = crypto
            .createHash('sha256')
            .update(verificationToken)
            .digest('hex');

        // Create User
        const user = await User.create({
            username,
            email,
            password,
            isEmailVerified: false,
            emailVerificationToken: hashedToken,  // ← Store hashed version
            emailVerificationExpires: Date.now() + parseInt(process.env.VERIFICATION_TOKEN_EXPIRE)
        });

        // Create verification URL (use plain token in URL)
        const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

        // Send verification email
        try {
            const emailHtml = getVerificationEmailTemplate(user.username, verificationUrl);

            await sendEmail({
                email: user.email,
                subject: 'Verify Your Food Chain Rumble Account',
                html: emailHtml
            });

            res.status(201).json({
                message: 'Registration successful! Please check your email to verify your account.',
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    isEmailVerified: user.isEmailVerified
                }
            });

        } catch (emailError) {
            console.error('❌ Email sending failed:', emailError);
            
            res.status(201).json({
                message: 'Account created but verification email failed to send. Please use "Resend Verification Email".',
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    isEmailVerified: user.isEmailVerified
                }
            });
        }

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
        const { username, email, password } = req.body;

        // Support login with either username OR email
        if ((!username && !email) || !password) {
            return res.status(400).json({
                error: 'Please provide username/email and password'
            });
        }

        // Find user by username OR email
        const query = username ? { username } : { email };
        const user = await User.findOne(query).select('+password');

        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordCorrect = await user.comparePassword(password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
            return res.status(403).json({
                error: 'Please verify your email before logging in',
                needsVerification: true,
                email: user.email
            });
        }

        // Check if user is banned
        if (user.isBanned) {
            if (user.banExpiresAt && new Date() > user.banExpiresAt) {
                user.isBanned = false;
                user.banReason = null;
                user.banExpiresAt = null;
                await user.save();
            } else {
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

        // Remove password before sending
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
// @desc    Logout user
// @access  Private
const logout = async (req, res) => {
    try {
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
// @access  Public
const refreshToken = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                error: 'Token is required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

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

        // Hash the token from URL to compare with database
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with matching hashed token
        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                error: 'Verification link is invalid or has expired.'
            });
        }

        // Verify user
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        // Send welcome email (non-blocking)
        try {
            const welcomeHtml = getWelcomeEmailTemplate(user.username);
            sendEmail({
                email: user.email,
                subject: 'Welcome to Food Chain Rumble!',
                html: welcomeHtml
            }).catch(err => console.error('Welcome email failed:', err));
        } catch (emailError) {
            console.log('Welcome email failed but verification succeeded');
        }

        res.json({ 
            message: 'Email verified successfully! You can now log in.' 
        });

    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ 
            error: 'Error verifying email', 
            details: error.message 
        });
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