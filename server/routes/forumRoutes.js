const express = require('express');
const router = express.Router();

// Import controller functions
const {
    // Board Controllers
    getAllBoards,
    getBoardBySlug,
    createBoard,
    updateBoard,
    deleteBoard,

    // Post controllers
    getPostsByBoard,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    voteOnPost,
    flagPost,

    // Comment controllers
    getCommentsByPost,
    createComment,
    updateComment,
    deleteComment,
    voteOnComment,
    flagComment
} = require('../controllers/forumControllers');

// Import middleware
const { protect, isAdmin } = require('../middleware/auth');

// ======================
// BOARD ROUTES
// ======================

// @route   GET /api/forum/boards
// @desc    Get all active forum boards
// @access  Public
router.get('/boards', getAllBoards);

// @route   POST /api/forum/boards
// @desc    Create a new forum board (admin only)
// @access  Private/Admin
route.post('/boards', protect, isAdmin, createBoard)

// @route   GET /api/forum/boards/:slug
// @desc    Get a board by its slug
// @access  Public
router.get('/boards/:slug', getBoardBySlug);

// @route   PATCH /api/forum/boards/:id
// @desc    Update a forum board (admin only)
// @access  Private/Admin
router.patch('/boards/:id', protect, isAdmin, updateBoard);

// @route   DELETE /api/forum/boards/:id
// @desc    Delete a forum board (admin only)
// @access  Private/Admin
router.delete('/boards/:id', protect, isAdmin, deleteBoard);

// ======================
// POST ROUTES
// ======================

// @route   GET /api/forum/boards/:boardId/posts
// @desc    Get all post in a board (with sorting/filtering)
// @access  Public
router.get('/boards/:boardId/posts', getPostsByBoard);

// @route   POST /api/forum/boards/:boardId/posts
// @desc    Create a new post in a board
// @access  Private
router.post('/boards/:boardId/posts', protect, createPost);

// @route   GET /api/forum/posts/:id
// @desc    Get a single post by ID (with comments)
// @access  Public
router.get('/posts/:id', getPostById);

// @route   PATCH /api/forum/posts/:id
// @desc    Update a post (author or admin/mod only)
// @access  Private
router.patch('/posts/:id', protect, updatePost);

// @route   DELETE /api/forum/posts/:id
// @desc    Delete a post (author or admin/mod only)
// @access  Private
router.delete('/posts/:id', protect, deletePost);

// @route   POST /api/forum/posts/:id/vote
// @desc    Vote on a post (upvote or downvote)
// @access  Private
router.post('/posts/:id/vote', protect, voteOnPost);

// @route   POST /api/forum/posts/:id/flag
// @desc    Flag a post for moderation
// @access  Private
router.post('/posts/:id/flag', protect, flagPost);

// =====================
// COMMENT ROUTES
// =====================

// @route   GET /api/forum/posts/:postId/comments
// @desc    Get all comments for a post
// @access  Public
router.get('/posts/:postId/comments', getCommentsByPost);

// @route   POST /api/forum/posts/:postId/comments
// @desc    Create a comment on a post
// @access  Private
router.post('/posts/:postId/comments', protect, createComment);

// @route   PATCH /api/forum/comments/:id
// @desc    Update a comment (author only)
// @access  Private
router.patch('/comments/:id', protect, updateComment);

// @route   DELETE /api/forum/comments/:id
// @desc    Delete a comment (author or admin/mod only)
// @access  Private
router.delete('/comments/:id', protect, deleteComment);

// @route   POST /api/forum/comments/:id/vote
// @desc    Vote on a comment (upvote or downvote)
// @access  Private
router.post('/comments/:id/vote', protect, voteOnComment);

// @route   POST /api/forum/comments/:id/flag
// @desc    Flag a comment for moderation
// @access  Private
router.post('/comments/:id/flag', protect, flagComment);

module.exports = router;