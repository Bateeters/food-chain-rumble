const mongoose = require('mongoose')

const forumCommentSchema = new mongoose.Schema({
    // Which post this comment belongs to
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ForumPost',
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: [true, 'Comment content is required'],
        maxLength: [5000, 'Comment cannot exceed 5,000 characters']
    },

    // Nested comments (replies to this comment)
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ForumComment',
        default: null
        // null = top-level comment (reply to post)
        // If set = reply to another comment (nested)
    },

    // Voting system (same as posts)
    votes: {
        upvotes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        downvotes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    },

    // Comment status
    isDeleted: {
        type: Boolean,
        default: false
        // Soft delete
    },
    deletedAt: {
        type: Date
    },
    editedAt: {
        type: Date
    },

    // Flagged for moderation
    isFlagged: {
        type: Boolean,
        default: false
    },
    flagCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes for performance
forumCommentSchema.index({ post: 1, createdAt: 1 });
forumCommentSchema.index({ author: 1, createdAt: -1 });
forumCommentSchema.index({ parentComment: 1, createdAt: 1 });

// Virtual: Calculate vote score
forumCommentSchema.virtual('voteScore').get(function() {
    return (this.votes?.upvotes?.length || 0) - (this.votes?.downvotes?.length || 0);
});

// Include virtuals when converting to JSON
forumCommentSchema.set('toJSON', {virtuals: true});
forumCommentSchema.set('toObject', {virtuals: true});

module.exports = mongoose.model('ForumComment', forumCommentSchema);