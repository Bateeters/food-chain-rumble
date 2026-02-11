const mongoose = require('mongoose')

const forumBoardSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Board name is required'],
        unique: true,
        trim: true,
        maxlength: [50, 'Board name cannot exceed 50 characters']
        // Example: "General Discussion", "Character Guides"
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
        // URL-friendly version: "general-discussion", "character-guides"
    },
    description: {
        type: String,
        required: [true, 'Board description is required'],
        maxlength: [500, 'Description cannot exceed 500 characters']
        // What this board is for
    },
    icon: {
        type: String,
        default: 'default-board-icon.png'
        // Icon/img for the board
    },
    color: {
        type: String,
        default: '#3B82F6'
        // Hex color for theming (optional visual differentiation)
    },

    // Board order/position for display
    displayOrder: {
        type: Number,
        default: 0
        // Lower numbers show first
    },

    isActive: {
        type: Boolean,
        default: true
    },

    moderators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    stats: {
        totalPosts: {
            type: Number,
            default: 0
        },
        totalComments: {
            type: Number,
            default: 0
        },
        lastPostDate: {
            type: Date
            // When most recent post was created
        },
        lastPostedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
            // Who made the most recent post
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ForumBoard', forumBoardSchema);