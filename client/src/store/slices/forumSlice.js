import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import forumService from '../../services/forumService';

// ==================
// ASYNC THUNKS
// ==================

// Boards
export const fetchAllBoards = createAsyncThunk(
    'forum/fetchAllBoards',
    async (_, { rejectWithValue }) => {
        try {
            const data = await forumService.getAllBoards();
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch boards');
        }
    }
);

export const fetchBoardBySlug = createAsyncThunk(
    'forum/fetchBoardBySlug',
    async (slug, { rejectWithValue }) => {
        try {
            const data = await forumService.getBoardBySlug(slug);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch board');
        }
    }
);

// Posts
export const fetchPostsInBoard = createAsyncThunk(
    'forum/fetchPostsInBoard',
    async ({ boardId, params }, { rejectWithValue }) => {
        try {
            const data = await forumService.getPostsInBoard(boardId, params);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch posts');
        }
    }
);

export const fetchPostById = createAsyncThunk(
    'forum/fetchPostById',
    async (postId, { rejectWithValue }) => {
        try {
            const data = await forumService.getPostById(postId);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch post');
        }
    }
);

export const createPost = createAsyncThunk(
    'forum/createPost',
    async ({ boardId, postData }, { rejectWithValue }) => {
        try {
            const data = await forumService.createPost(boardId, postData);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to create post');
        }
    }
);

export const voteOnPost = createAsyncThunk(
    'forum/voteOnPost',
    async ({ postId, voteType }, { rejectWithValue }) => {
        try {
            const data = await forumService.votePost(postId, voteType);
            return { postId, ...data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to vote');
        }
    }
);

// Comments
export const fetchComments = createAsyncThunk(
    'forum/fetchComments',
    async ({ postId, params }, { rejectWithValue }) => {
        try {
            const data = await forumService.getCommentsForPost(postId, params);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch comments');
        }
    }
);

export const createComment = createAsyncThunk(
    'forum/createComment',
    async ({ postId, commentData }, { rejectWithValue }) => {
        try {
            const data = await forumService.createComment(postId, commentData);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to create comment');
        }
    }
);

export const voteOnComment = createAsyncThunk(
    'forum/voteOnComment',
    async ({ commentId, voteType }, { rejectWithValue }) => {
        try {
            const data = await forumService.voteComment(commentId, voteType);
            return { commentId, ...data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to vote');
        }
    }
);

// ==================
// INITIAL STATE
// ==================

const initialState = {
    // Boards
    boards: [],
    currentBoard: null,
    
    // Posts
    posts: [],
    currentPost: null,
    postsPagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
    },
    
    // Comments
    comments: [],
    commentsPagination: {
        page: 1,
        limit: 50,
        total: 0,
        pages: 0
    },
    
    // UI State
    isLoading: false,
    error: null,
    
    // Create/Edit State
    createPostSuccess: false,
    createCommentSuccess: false
};

// ==================
// SLICE
// ==================

const forumSlice = createSlice({
    name: 'forum',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentPost: (state) => {
            state.currentPost = null;
            state.comments = [];
        },
        clearCreateSuccess: (state) => {
            state.createPostSuccess = false;
            state.createCommentSuccess = false;
        },
        clearPosts: (state) => {
            state.posts =[];
            state.currentBoard = null;
        }
    },
    extraReducers: (builder) => {
        builder
        // Fetch all boards
        .addCase(fetchAllBoards.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(fetchAllBoards.fulfilled, (state, action) => {
            state.isLoading = false;
            state.boards = action.payload.boards;
        })
        .addCase(fetchAllBoards.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })
        
        // Fetch board by slug
        .addCase(fetchBoardBySlug.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(fetchBoardBySlug.fulfilled, (state, action) => {
            state.isLoading = false;
            state.currentBoard = action.payload.board;
        })
        .addCase(fetchBoardBySlug.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })
        
        // Fetch posts in board
        .addCase(fetchPostsInBoard.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(fetchPostsInBoard.fulfilled, (state, action) => {
            state.isLoading = false;
            state.posts = action.payload.posts;
            state.postsPagination = action.payload.pagination;
        })
        .addCase(fetchPostsInBoard.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })
        
        // Fetch post by ID
        .addCase(fetchPostById.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(fetchPostById.fulfilled, (state, action) => {
            state.isLoading = false;
            state.currentPost = action.payload.post;
        })
        .addCase(fetchPostById.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })
        
        // Create post
        .addCase(createPost.pending, (state) => {
            state.isLoading = true;
            state.error = null;
            state.createPostSuccess = false;
        })
        .addCase(createPost.fulfilled, (state, action) => {
            state.isLoading = false;
            state.createPostSuccess = true;
            state.posts.unshift(action.payload.post); // Add to beginning
        })
        .addCase(createPost.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
            state.createPostSuccess = false;
        })
        
        // Vote on post
        .addCase(voteOnPost.fulfilled, (state, action) => {
            const { postId, upvotes, downvotes, userVote } = action.payload;
            
            // Calculate vote score
            const voteScore = upvotes - downvotes;
            
            // Update in posts list (for board view)
            const postInList = state.posts.find(p => p._id === postId);
            if (postInList) {
                postInList.voteScore = voteScore;
                postInList.userVote = userVote;
            }
            
            // Update current post (for detail view)
            if (state.currentPost && state.currentPost._id === postId) {
                state.currentPost.voteScore = voteScore;
                state.currentPost.userVote = userVote;
            }
        })
        
        // Fetch comments
        .addCase(fetchComments.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(fetchComments.fulfilled, (state, action) => {
            state.isLoading = false;
            state.comments = action.payload.comments;
            state.commentsPagination = action.payload.pagination;
        })
        .addCase(fetchComments.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })
        
        // Create comment
        .addCase(createComment.pending, (state) => {
            state.isLoading = true;
            state.error = null;
            state.createCommentSuccess = false;
        })
        .addCase(createComment.fulfilled, (state, action) => {
            state.isLoading = false;
            state.createCommentSuccess = true;
            state.comments.push(action.payload.comment);
            
            // Increment comment count on current post
            if (state.currentPost) {
                state.currentPost.stats.commentCount += 1;
            }
        })
        .addCase(createComment.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
            state.createCommentSuccess = false;
        })
        
        // Vote on comment
        .addCase(voteOnComment.fulfilled, (state, action) => {
            console.log('🟢 voteOnComment.fulfilled payload:', action.payload);
            
            const { commentId, upvotes, downvotes, userVote } = action.payload;
            
            const voteScore = upvotes - downvotes;
            console.log('📊 Calculated voteScore:', voteScore);
            
            // Find comment in top-level comments
            const comment = state.comments.find(c => c._id === commentId);
            if (comment) {
                console.log('✅ Found top-level comment, updating voteScore');
                comment.voteScore = voteScore;
                comment.userVote = userVote;
            }
            
            // Also check nested replies
            state.comments.forEach(c => {
                if (c.replies) {
                    const reply = c.replies.find(r => r._id === commentId);
                    if (reply) {
                        console.log('✅ Found reply comment, updating voteScore');
                        reply.voteScore = voteScore;
                        reply.userVote = userVote;
                    }
                }
            });
        })
    }
});

export const { clearError, clearCurrentPost, clearCreateSuccess, clearPosts } = forumSlice.actions;
export default forumSlice.reducer;