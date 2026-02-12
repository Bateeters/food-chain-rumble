const mongoose = require('mongoose')

const forumPostSchema = new mongoose.Schema({
    // Which board this post belongs to
    board: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ForumBoard',
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Post content
    title: {
        type: String,
        required: [true, 'Post title is required'],
        trim: true,
        minlength: [3, 'Title must be at least 3 characters'],
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    content: {
        type: String,
        required: [true, 'Post content is required'],
        maxlength: [10000, 'Content cannot exceed 10,000 characters']
    },

    // Post metadata
    slug: {
        type: String,
        required: true
    },

    // Voting system
    votes: {
        upvotes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            // Array of users who upvoted
        }],
        downvotes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            // Array of users who downvoted
        }]
    },

    // Post status
    isPinned: {
        type: Boolean,
        default: false
        // Pinned post appear at top of board
    },
    isLocked: {
        type: Boolean,
        default: false
        // Locked post cannot receive new comments
    },
    isDeleted: {
        type: Boolean,
        default: false
        // Soft delete - post hidden but not removed from database
    },
    deletedAt: {
        type: Date
    },

    // Statistics
    stats: {
        commentCount: {
            type: Number,
            default: 0
        },
        viewCount: {
            type: Number,
            default: 0
        },
        lastActivityDate: {
            type: Date,
            default: Date.now
            // Last time someone commented (for sorting by "not")
        }
    },

    // Tags/Categories - (for filtering)
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],

    // For moderation
    editedAt: {
        type: Date
        // When post was last edited by author
    },
    editHistory: [{
        editedAt: {
            type: Date,
            default: Date.now
        },
        editedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
    }],
    
    // Flagged for moderation
    isFlagged: {
        type: Boolean,
        default: false
        // Users can flag inappropriate content
    },
    flagCount: {
        type: Number,
        default: 0
        // How many users flagged this content
    }
}, {
    timestamps: true
});

// Indexes for performance
forumPostSchema.index({ board: 1, createdAt: -1 });
forumPostSchema.index({ author: 1, createdAt: -1 });
forumPostSchema.index({ slug: 1, board: 1}, { unique: true });
forumPostSchema.index({ 'stats.lastActivityDate': -1 });
forumPostSchema.index({ isPinned: -1, 'stats.lastActivityDate': -1});

// Virtual: Calculate vote score (upvotes - downvotes)
forumPostSchema.virtual('voteScore').get(function() {
  return this.votes.upvotes.length - this.votes.downvotes.length;
});

// Include virtuals when converting to JSON
forumPostSchema.set('toJSON', { virtuals: true });
forumPostSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ForumPost', forumPostSchema);