const ForumBoard = require('../models/ForumBoard');
const ForumPost = require('../models/ForumPost');
const Comment = require('../models/ForumComment');
const User = require('../models/User');
const mongoose = require('mongoose');

// @route   GET /api/forum/boards
// @desc    Get all forum boards
// @access  Public
const getAllBoards = async (req, res) => {
    try {
        const boards = await ForumBoard.find()
            .sort({ displayOrder: 1 });

        // Get real-time post count for each board
        const boardsWithCounts = await Promise.all(
            boards.map(async (board) => {
                const postCount = await ForumPost.countDocuments({
                    board: board._id,
                    isDeleted: false
                });

                const recentPost = await ForumPost.findOne({
                    board: board._id,
                    isDeleted: false
                })
                    .sort({ createdAt: -1 })
                    .populate('author', 'username avatar')
                    .lean();

                return {
                    _id: board._id,
                    name: board.name,
                    description: board.description,
                    slug: board.slug,
                    icon: board.icon,
                    color: board.color,
                    displayOrder: board.displayOrder,
                    postCount: postCount,
                    recentPost: recentPost ? {
                        _id: recentPost._id,
                        title: recentPost.title,
                        author: recentPost.author,
                        createdAt: recentPost.createdAt
                    } : null
                };
            })
        );

        res.json({
            boards: boardsWithCounts
        });

    } catch (error) {
        console.error('Get all boards error:', error);
        res.status(500).json({
            error: 'Error fetching forum boards',
            details: error.message
        });
    }
};

// @route   GET /api/forum/boards/:slug
// @desc    Get a board by its slug
// @access  Public
const getBoardBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const board = await ForumBoard.findOne({ slug });

        if (!board) {
            return res.status(404).json({
                error: 'Forum board not found'
            });
        }

        res.json({
            board: {
                _id: board._id,
                name: board.name,
                description: board.description,
                slug: board.slug,
                order: board.order,
                postCount: board.postCount,
                latestPost: board.latestPost,
                color: board.color,
            }
        });

    } catch (error) {
        console.error('Get board by slug error:', error);
        res.status(500).json({
            error: 'Error fetching forum board',
            details: error.message
        });
    }
};

// @route   POST /api/forum/boards
// @desc    Create a new forum board (Admin only)
// @access  Private/Admin
const createBoard = async (req, res) => {
    try {
        const { name, description, order } = req.body;

        // Validation
        if (!name || !description) {
            return res.status(400).json({
                error: 'Name and description are required'
            });
        }

        const board = await ForumBoard.create({
            name,
            description,
            order: order || 0
        });

        res.status(201).json({
            message: 'Forum board created successfully',
            board
        });

    } catch (error) {
        console.error('Create board error:', error);
        res.status(500).json({
            error: 'Error creating forum board',
            details: error.message
        });
    }
};

// @route   PUT /api/forum/boards/:id
// @desc    Update a forum board (Admin only)
// @access  Private/Admin
const updateBoard = async (req, res) => {
    try {
        const { name, description, order } = req.body;

        const board = await ForumBoard.findByIdAndUpdate(
            req.params.id,
            { name, description, order },
            { new: true, runValidators: true }
        );

        if (!board) {
            return res.status(404).json({
                error: 'Forum board not found'
            });
        }

        res.json({
            message: 'Forum board updated successfully',
            board
        });
    } catch (error) {
        console.error('Update board error:', error);
        res.status(500).json({
            error: 'Error updating forum board',
            details: error.message
        });
    }
};

// @route   DELETE /api/forum/boards/:id
// @desc    Delete a forum board (Admin only)
// @access  Private/Admin
const deleteBoard = async (req, res) => {
    try {
        const board = await ForumBoard.findById(req.params.id);

        if (!board) {
            return res.status(404).json({
                error: 'Forum board not found'
            });
        }

        // Check if board has posts
        const postCount = await ForumPost.countDocuments ({ board: board._id });
        if (postCount > 0) {
            return res.status(400).json({
                error: `Cannot delete board with ${postCount} posts. Delete posts first.`
            });
        }

        await board.deleteOne();

        res.json({
            message: 'Forum board deleted successfully'
        });

    } catch (error) {
        console.error('Delete forum board error:', error);
        res.status(500).json({
            error: 'Error deleting forum board',
            details: error.message
        });
    }
};

// @route   GET /api/forum/boards/:boardId/posts
// @desc    Get posts in a board
// @access  Public
const getPostsInBoard = async (req, res) => {
    try {
        const { boardId } = req.params;
        const { page = 1, limit = 20, sort = 'latest' } = req.query;
        
        // Get userId if logged in
        const userId = req.user?.id || req.user?._id;

        const posts = await ForumPost.find({ board: boardId, isDeleted: false })
            .populate('author', 'username avatar')
            .populate('board', 'name slug')
            .lean();
        
        // Calculate vote scores and check user votes
        const postsWithScores = posts.map(post => {
            const voteScore = (post.votes?.upvotes?.length || 0) - (post.votes?.downvotes?.length || 0);
            
            let userVote = null;
            if (userId) {
                const hasUpvoted = post.votes?.upvotes?.some(id => id.toString() === userId.toString());
                const hasDownvoted = post.votes?.downvotes?.some(id => id.toString() === userId.toString());
                
                if (hasUpvoted) userVote = 'upvote';
                else if (hasDownvoted) userVote = 'downvote';
            }
            
            return {
                ...post,
                voteScore,
                userVote
            };
        });

        // Sort in memory
        let sortedPosts;
        switch (sort) {
            case 'popular':
                sortedPosts = postsWithScores.sort((a, b) => {
                    if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
                    return b.voteScore - a.voteScore;
                });
                break;
            case 'oldest':
                sortedPosts = postsWithScores.sort((a, b) => {
                    if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
                    return new Date(a.createdAt) - new Date(b.createdAt);
                });
                break;
            case 'latest':
            default:
                sortedPosts = postsWithScores.sort((a, b) => {
                    if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
                    return new Date(b.stats?.lastActivityDate || b.createdAt) - new Date(a.stats?.lastActivityDate || a.createdAt);
                });
        }

        // Paginate
        const startIndex = (page - 1) * limit;
        const paginatedPosts = sortedPosts.slice(startIndex, startIndex + limit);

        res.json({
            posts: paginatedPosts,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: posts.length,
                pages: Math.ceil(posts.length / limit)
            }
        });

    } catch (error) {
        console.error('Get posts in board error:', error);
        res.status(500).json({
            error: 'Error fetching posts in board',
            details: error.message
        });
    }
};

// @route   GET /api/forum/posts/:id
// @desc    Get a single post by ID
// @access  Public
const getPostById = async (req, res) => {
    try {
        const post = await ForumPost.findById(req.params.id)
            .populate('author', 'username avatar')
            .populate('board', 'name slug');

        if (!post) {
            return res.status(404).json({
                error: 'Post not found'
            });
        }

        // Increment view count
        post.stats.viewCount += 1;
        await post.save();

        const postObject = post.toObject();
        
        // Calculate vote score
        postObject.voteScore = (post.votes?.upvotes?.length || 0) - (post.votes?.downvotes?.length || 0);
        
        // Check user's vote
        const userId = req.user?.id || req.user?._id;
        postObject.userVote = null;
                
        if (userId) {            
            const hasUpvoted = post.votes?.upvotes?.some(id => {
                const match = id.toString() === userId.toString();
                return match;
            });
            const hasDownvoted = post.votes?.downvotes?.some(id => id.toString() === userId.toString());
                        
            if (hasUpvoted) postObject.userVote = 'upvote';
            else if (hasDownvoted) postObject.userVote = 'downvote';
        }

        res.json({ post: postObject });

    } catch (error) {
        console.error('Get post by ID error:', error);
        res.status(500).json({
            error: 'Error fetching post',
            details: error.message
        });
    }
};

// @route   POST /api/forum/boards/:boardId/posts
// @desc    Create a new post
// @access  Private
const createPost = async (req, res) => {
    try {
        const { boardId } = req.params;
        const { title, content } = req.body;

        // Validation
        if (!title || !content) {
            return res.status(400).json({
                error: 'Title and content are required'
            });
        }

        // Check if board exists
        const board = await ForumBoard.findById(boardId);
        if (!board) {
            return res.status(404).json({
                error: 'Forum board not found'
            });
        }

        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            + '-' + Date.now();

        const post = await ForumPost.create({
            board: boardId,
            author: req.user.id,
            title,
            content,
            slug
        });

        // Update board stats
        board.postCount += 1;
        board.stats.totalPosts += 1;
        board.latestPost = {
            _id: post._id,
            title: post.title,
            author: req.user.id,
            createdAt: post.createdAt
        };
        await board.save();

        // Populate author info
        await post.populate('author', 'username avatar');
        await post.populate('board', 'name slug');

        res.status(201).json({
            message: 'Post created successfully',
            post
        });

    } catch (error) {
        console.error ('Create post error:', error);
        res.status(500).json({
            error: 'Error creating post',
            details: error.message
        });
    }
};

// @route   PUT /api/forum/posts/:id
// @desc    Update a post
// @access  Private (author)

// =========================================================
// Commented out Admin/moderator if we want to re-implement.
// If admin/mod have to edit, author should be notified and
// post should be flagged and/or taken down instead.
// =========================================================

const updatePost = async (req, res) => {
    try {
        const { title, content } = req.body;

        const post = await ForumPost.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                error: 'Post not found'
            });
        }

        // Check authorization (author)
        const isAuthor = post.author.toString() === req.user.id;
        /* Check authorization (admin/mod)
        const isAdminOrMod = req.user.role === 'admin' || req.user.role === 'moderator';
        */

        if (!isAuthor /*&& !isAdminOrMod*/) {
            return res.status(403).json({
                error: 'Not authorized to edit this post'
            });
        }

        // Update fields
        if (title) post.title = title;
        if (content) post.content = content;
        post.isEdited = true;

        await post.save();
        await post.populate('author', 'username avatar');
        await post.populate('board', 'name slug');

        res.json({
            message: 'Post updated successfully',
            post
        });

    } catch (error) {
        console.error('Update post error:', error);
        res.status(500).json({
            error: 'Error updating post',
            details: error.message
        });
    }
};

// @route   DELETE /api/forum/post/:id
// @desc    Delete a post
// @access  Private (author or admin/moderator)
const deletePost = async (req, res) => {
    try {
        const post = await ForumPost.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                error: 'Post not found'
            });
        }

        // Check authorization
        const isAuthor = post.author.toString() === req.user.id;
        const isAdminOrMod = req.user.role === 'admin' || req.user.role === 'moderator';

        if (!isAuthor && !isAdminOrMod) {
            return res.status(403).json({
                error: 'Not authorized to delete this post'
            });
        }

        // Delete all comments on this post
        await Comment.deleteMany({ post: post._id });

        // Update board stats
        const board = await ForumBoard.findById(post.board);
        if (board) {
            board.postCount = Math.max(0, board.postCount -1);
            await board.save();
        }

        await post.deleteOne();

        res.json({
            message: 'Post deleted successfully'
        });

    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({
            error: 'Error deleting post',
            details: error.message
        });
    }
};

// @route   PATCH /api/forum/posts/:id/pin
// @desc    Pin/unpin a post (Moderator/Admin only)
// @access  Private/Admin/Moderator
const togglePinPost = async (req, res) => {
    try {
        const post = await ForumPost.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                error: 'Post not found'
            });
        }

        post.isPinned = !post.isPinned;
        await post.save();

        res.json({
            message: `Post ${post.isPinned ? 'pinned' : 'unpinned'} successfully`,
            isPinned: post.isPinned
        });

    } catch (error) {
        console.error('Toggle pin post error:', error);
        res.status(500).json({
            error: 'Error toggling pin status',
            details: error.message
        });
    }
};

// @route   PATCH /api/forum/posts/:id/lock
// @desc    Lock/unlock a post (Moderator/Admin only)
// @access  Private/Moderator/Admin
const toggleLockPost = async (req, res) => {
    try {
        const post = await ForumPost.findById(req.params.id);

        if(!post) {
            return res.status(404).json({
                error: 'Post not found'
            });
        }

        post.isLocked = !post.isLocked;
        await post.save();

        res.json({
            message: `Post ${post.isLocked ? 'locked' : 'unlocked'} successfully`,
            isLocked: post.isLocked
        });

    } catch (error) {
        console.error('Toggle lock post error:', error);
        res.status(500).json({
            error: 'Error toggling lock status',
            details: error.message
        });
    }
};

// =========================================================
// COMMENT CONTROLLERS
// =========================================================

// @route   GET /api/forum/posts/:postId/comments
// @desc    Get comments for a post
// @access  Public
const getCommentsForPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        const userId = req.user?.id || req.user?._id;

        // Get top-level comments (no parent)
        const comments = await Comment.find({
            post: postId,
            parentComment: null,
            isDeleted: false
        })
            .populate('author', 'username avatar')
            .sort({ createdAt: 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();
        
        // Get replies for each comment (one level deep)
        for (let comment of comments) {
            // Calculate voteScore for comment
            comment.voteScore = (comment.votes?.upvotes?.length || 0) - (comment.votes?.downvotes?.length || 0);
            
            const replies = await Comment.find({ 
                parentComment: comment._id,
                isDeleted: false
            })
                .populate('author', 'username avatar')
                .sort({ createdAt: 1 })
                .lean();
            
            // Add user vote status to replies
            comment.replies = replies.map(reply => {
                // Calculate voteScore for reply
                const replyVoteScore = (reply.votes?.upvotes?.length || 0) - (reply.votes?.downvotes?.length || 0);
                
                let userVote = null;
                if (userId) {
                    const hasUpvoted = reply.votes?.upvotes?.some(id => id.toString() === userId.toString());
                    const hasDownvoted = reply.votes?.downvotes?.some(id => id.toString() === userId.toString());
                    
                    if (hasUpvoted) userVote = 'upvote';
                    else if (hasDownvoted) userVote = 'downvote';
                }
                
                return {
                    ...reply,
                    voteScore: replyVoteScore,
                    userVote
                };
            });
            
            // Add user vote status to main comment
            let userVote = null;
            if (userId) {
                const hasUpvoted = comment.votes?.upvotes?.some(id => id.toString() === userId.toString());
                const hasDownvoted = comment.votes?.downvotes?.some(id => id.toString() === userId.toString());
                
                if (hasUpvoted) userVote = 'upvote';
                else if (hasDownvoted) userVote = 'downvote';
            }
            comment.userVote = userVote;
        }

        const total = await Comment.countDocuments({
            post: postId,
            parentComment: null,
            isDeleted: false
        });

        res.json({
            comments,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get comments for post error:', error);
        res.status(500).json({
            error: 'Error fetching comments',
            details: error.message
        });
    }
};

// @route   POST /api/forum/posts/:postId/comments
// @desc    Create a comment on a post
// @access  Private
const createComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content, parentCommentId } = req.body;

        // Validation
        if (!content) {
            return res.status(400).json({
                error: 'Content is required'
            });
        }

        // Check if post exists
        const post = await ForumPost.findById(postId);
        if (!post) {
            return res.status(404).json({
                error: 'Post not found'
            });
        }

        // Check if post is locked
        if (post.isLocked) {
            return res.status(403).json({
                error: 'Post is locked. Cannot add comments.'
            });
        }

        // If replying to a comment, verify parent exists
        if (parentCommentId) {
            const parentComment = await Comment.findById(parentCommentId);
            if (!parentComment) {
                return res.status(404).json({
                    error: 'Parent comment not found'
                });
            }
        }

        const comment = await Comment.create({
            post: postId,
            author: req.user.id,
            content,
            parentComment: parentCommentId || null
        });

        // Update post comment count
        post.commentCount += 1;
        await post.save();

        await comment.populate('author', 'username avatar');

        res.status(201).json({
            message: 'Comment created successfully',
            comment
        });

    } catch (error) {
        console.error('Create comment error:', error);
        res.status(500).json({
            error: 'Error creating comment',
            details: error.message
        });
    }
};

// @route   PUT /api/forum/comments/:id
// @desc    Update a comment
// @access  Private (author)

// =========================================================
// Commented out Admin/moderator if we want to re-implement.
// If admin/mod have to edit, author should be notified and
// comment should be flagged and/or taken down instead.
// =========================================================

const updateComment = async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                error: 'Comment content is required'
            });
        }

        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                error: 'Comment not found'
            });
        }

        // Check if user is the author
        if (comment.author.toString() !== req.user.id && comment.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                error: 'Not authorized to update this comment'
            });
        }

        comment.content = content.trim();
        comment.editedAt = Date.now();

        await comment.save();

        const populatedComment = await Comment.findById(comment._id)
            .populate('author', 'username avatar');

        res.json({
            message: 'Comment updated successfully',
            comment: populatedComment
        });

    } catch (error) {
        console.error('Update comment error:', error);
        res.status(500).json({
            error: 'Error updating comment',
            details: error.message
        });
    }
};

// @route   DELETE /api/forum/comments/:id
// @desc    Delete a comment
// @access  Private (author or admin/mod)
const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                error: 'Comment not found'
            });
        }

        // Check if user is the author or moderator/admin
        const isAuthor = comment.author.toString() === req.user.id || comment.author.toString() === req.user._id.toString();
        const isModerator = req.user.role === 'admin' || req.user.role === 'moderator';

        if (!isAuthor && !isModerator) {
            return res.status(403).json({
                error: 'Not authorized to delete this comment'
            });
        }

        // Soft delete - mark as deleted instead of removing
        comment.isDeleted = true;
        comment.content = '[deleted]';
        await comment.save();

        // Update post comment count
        const post = await ForumPost.findById(comment.post);
        if (post) {
            post.stats.commentCount = Math.max(0, post.stats.commentCount - 1);
            await post.save();
        }

        res.json({
            message: 'Comment deleted successfully'
        });

    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({
            error: 'Error deleting comment',
            details: error.message
        });
    }
};

// =========================================================
// VOTING CONTROLLERS
// =========================================================

// @route   POST /api/forum/posts/:id/vote
// @desc    Upvote/downvote a post
// @access  Private
const votePost = async (req, res) => {
    try {
        const { voteType } = req.body;

        // Allow null to remove vote, or upvote/downvote
        if (voteType !== null && !['upvote', 'downvote'].includes(voteType)) {
            return res.status(400).json({
                error: 'Invalid vote type. Must be "upvote", "downvote", or null to remove vote'
            });
        }

        const post = await ForumPost.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                error: 'Post not found'
            });
        }

        const userId = req.user.id || req.user._id.toString();

        // Check current vote status
        const hasUpvoted = post.votes.upvotes.some(id => id.toString() === userId.toString());
        const hasDownvoted = post.votes.downvotes.some(id => id.toString() === userId.toString());

        // Remove existing votes first
        post.votes.upvotes = post.votes.upvotes.filter(id => id.toString() !== userId.toString());
        post.votes.downvotes = post.votes.downvotes.filter(id => id.toString() !== userId.toString());

        let newUserVote = null;

        // If voteType is null, just remove votes (already done above)
        if (voteType === null) {
            newUserVote = null;
        } else if (voteType === 'upvote') {
            if (!hasUpvoted) {
                // Add upvote (wasn't upvoted before)
                post.votes.upvotes.push(userId);
                newUserVote = 'upvote';
            } else {
                // Was already upvoted, removed above, don't re-add (toggle off)
                newUserVote = null;
            }
        } else if (voteType === 'downvote') {
            if (!hasDownvoted) {
                // Add downvote (wasn't downvoted before)
                post.votes.downvotes.push(userId);
                newUserVote = 'downvote';
            } else {
                // Was already downvoted, removed above, don't re-add (toggle off)
                newUserVote = null;
            }
        }

        await post.save();

        res.json({
            message: 'Vote registered successfully',
            upvotes: post.votes.upvotes.length,
            downvotes: post.votes.downvotes.length,
            userVote: newUserVote
        });

    } catch (error) {
        console.error('Vote post error:', error);
        res.status(500).json({
            error: 'Error voting on post',
            details: error.message
        });
    }
};

// @route   POST /api/forum/comments/:id/vote
// @desc    Upvote/downvote a comment
// @access  Private
const voteComment = async (req, res) => {
    try {
        const { voteType } = req.body;

        if (voteType !== null && !['upvote', 'downvote'].includes(voteType)) {
            return res.status(400).json({
                error: 'Invalid vote type. Must be "upvote", "downvote", or null to remove vote'
            });
        }

        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                error: 'Comment not found'
            });
        }

        const userId = req.user.id || req.user._id.toString();

        const hasUpvoted = comment.votes.upvotes.some(id => id.toString() === userId.toString());
        const hasDownvoted = comment.votes.downvotes.some(id => id.toString() === userId.toString());

        // Remove existing votes
        comment.votes.upvotes = comment.votes.upvotes.filter(id => id.toString() !== userId.toString());
        comment.votes.downvotes = comment.votes.downvotes.filter(id => id.toString() !== userId.toString());

        let newUserVote = null;

        if (voteType === null) {
            newUserVote = null;
        } else if (voteType === 'upvote') {
            if (!hasUpvoted) {
                comment.votes.upvotes.push(userId);
                newUserVote = 'upvote';
            }
        } else if (voteType === 'downvote') {
            if (!hasDownvoted) {
                comment.votes.downvotes.push(userId);
                newUserVote = 'downvote';
            }
        }

        await comment.save();

        res.json({
            message: 'Vote registered successfully',
            upvotes: comment.votes.upvotes.length,
            downvotes: comment.votes.downvotes.length,
            userVote: newUserVote
        });

    } catch (error) {
        console.error('Vote comment error:', error);
        res.status(500).json({
            error: 'Error voting on comment',
            details: error.message
        });
    }
};

// =========================================================
// FLAGGING/REPORTING CONTROLLERS
// =========================================================

// @route   POST /api/forum/posts/:id/flag
// @desc    Flag a post for moderation
// @access  Private

const flagPost = async (req, res) => {
    try {
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                error: 'Reason is required'
            });
        }

        const post = await ForumPost.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                error: 'Post not found'
            });
        }

        // Check if user already flagged this post
        const alreadyFlagged = post.flags.some(
            flag => flag.reporter.toString() === req.user.id
        );

        if (alreadyFlagged) {
            return res.status(400).json({
                error: 'You have already flagged this post'
            });
        }

        // Add flag
        post.flags.push({
            reporter: req.user.id,
            reason,
            reportedAt: new Date()
        });

        await post.save();

        res.json({
            message: 'Post flagged successfully',
            flagCount: post.flags.length
        });

    } catch (error) {
        console.error('Flag post error:', error);
        res.status(500).json({
            error: 'Error flagging post',
            details: error.message
        });
    }
};

// @route   POST /api/forum/comments/:id/flag
// @desc    Flag a comment for moderation
// @access  Private
const flagComment = async (req, res) => {
    try {
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                error: 'Reason is required'
            });
        }

        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                error: 'Comment not found'
            });
        }

        // Check if user already flagged this comment
        const alreadyFlagged = comment.flags.some(
            flag => flag.reporter.toString() === req.user.id
        );

        if (alreadyFlagged) {
            return res.status(400).json({
                error: 'You have already flagged this comment'
            });
        }

        // Add flag
        comment.flags.push({
            reporter: req.user.id,
            reason,
            reportedAt: new Date()
        });

        await comment.save();

        res.json({
            message: 'Comment flagged successfully',
            flagCount: comment.flags.length
        });

    } catch (error) {
        console.error('Flag comment error:', error);
        res.status(500).json({
            error: 'Error flagging comment',
            details: error.message
        });
    }
};

module.exports = {
    // Board controllers
    getAllBoards,
    getBoardBySlug,
    createBoard,
    updateBoard,
    deleteBoard,

    // Post controllers
    getPostsInBoard,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    togglePinPost,
    toggleLockPost,

    // Comment controllers
    getCommentsForPost,
    createComment,
    updateComment,
    deleteComment,

    // Voting controllers
    votePost,
    voteComment,

    // Flagging controllers
    flagPost,
    flagComment
};