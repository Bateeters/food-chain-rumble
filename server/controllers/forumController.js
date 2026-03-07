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
            .sort({ order: 1 });

        res.json({
            boards: boards.map(board => ({
                _id: board._id,
                name: board.name,
                description: board.description,
                slug: board.slug,
                order: board.order,
                postCount: board.postCount,
                latestPost: board.latestPost
            }))
        });

    } catch (error) {
        console.error('Get all boards error:', error);
        res.status(500).json({
            error: 'Error fetching forum boards',
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

        // Build sort criteria
        let sortCriteria;
        switch (sort) {
            case 'popular':
                sortCriteria = { upvotes: -1, createdAt: -1 };
                break;
            case 'oldest':
                sortCriteria = { createdAt: 1 };
                break;
            case 'latest':
            default:
                sortCriteria = { isPinned: -1, updatedAt: -1 };
        }

        const posts = await ForumPost.find({ board: boardId })
            .populate('author', 'username avatar')
            .populate('board', 'name slug')
            .sort(sortCriteria)
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const total = await ForumPost.countDocuments({ board: boardId });

        res.json({
            post,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get posts in board error:', error)
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
        post.viewCount += 1;
        await post.save();

        res.json({ post });

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

        const post = await ForumPost.create({
            board: boardId,
            author: req.user.id,
            title,
            content
        });

        // Update board stats
        board.postCound += 1;
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
            message: 'Post updated seccessfully',
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

        // Get top-level comments (no parent)
        const comments = await Comment.find({
            post: postId,
            parentComment: null
        })
            .populate('author', 'username avatar')
            .sort({ createdAt: 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        // Get replies for each comment (one level deep)
        for (let comment of comments) {
            const replies = await Comment.find({ parentComment: comment._id })
                .populate('author', 'username avatar')
                .sort({ createdAt: 1 });
            comment._doc.replies = replies;
        }

        const total = await Comment.countDocuments({
            post: postId,
            parentComment: null
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
                error: 'Post is locked. Cannot add coments.'
            });
        }

        // If repllying to a comment, verify parent exists
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

        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                error: 'Comment not found'
            });
        }
        
        // Check authorization
        const isAuthor = comment.author.toString() === req.user.id;

        /* Check authorization (admin/mod)
        const isAdminOrMod = req.user.role === 'admin' || req.user.role === 'moderator';
        */

        if (!isAuthor /*&& !isAdminOrMod*/) {
            return res.status(403).json({
                error: 'Not authorized to edit this comment'
            });
        }

        comment.content = content;
        comment.isEdited = true;
        await comment.save();

        await comment.populate('author', 'username avatar');

        res.json({
            message: 'Comment updated successfully',
            comment
        });

    } catch (error) {
        console.error('Update comment error:', error);
        res.status(500).json({
            error: 'Error updating coment',
            details: error.message
        });
    }
};

