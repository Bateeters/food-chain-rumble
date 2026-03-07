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