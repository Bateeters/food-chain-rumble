import api from './api';

const forumService = {
    // ==================
    // BOARD ENDPOINTS
    // ==================
    
    // Get all boards
    getAllBoards: async () => {
        const response = await api.get('/forum/boards');
        return response.data;
    },

    // Get board by slug
    getBoardBySlug: async (slug) => {
        const response = await api.get(`/forum/boards/${slug}`);
        return response.data;
    },

    // ==================
    // POST ENDPOINTS
    // ==================
    
    // Get posts in a board
    getPostsInBoard: async (boardId, params = {}) => {
        const response = await api.get(`/forum/boards/${boardId}/posts`, { params });
        return response.data;
    },

    // Get single post by ID
    getPostById: async (postId) => {
        const response = await api.get(`/forum/posts/${postId}`);
        return response.data;
    },

    // Create new post
    createPost: async (boardId, postData) => {
        const response = await api.post(`/forum/boards/${boardId}/posts`, postData);
        return response.data;
    },

    // Update post
    updatePost: async (postId, postData) => {
        const response = await api.patch(`/forum/posts/${postId}`, postData);
        return response.data;
    },

    // Delete post
    deletePost: async (postId) => {
        const response = await api.delete(`/forum/posts/${postId}`);
        return response.data;
    },

    // Vote on post
    votePost: async (postId, voteType) => {
        const response = await api.post(`/forum/posts/${postId}/vote`, { voteType });
        return response.data;
    },

    // Flag post
    flagPost: async (postId, reason) => {
        const response = await api.post(`/forum/posts/${postId}/flag`, { reason });
        return response.data;
    },

    // Pin/unpin post (moderator)
    togglePinPost: async (postId) => {
        const response = await api.patch(`/forum/posts/${postId}/pin`);
        return response.data;
    },

    // Lock/unlock post (moderator)
    toggleLockPost: async (postId) => {
        const response = await api.patch(`/forum/posts/${postId}/lock`);
        return response.data;
    },

    // ==================
    // COMMENT ENDPOINTS
    // ==================
    
    // Get comments for a post
    getCommentsForPost: async (postId, params = {}) => {
        const response = await api.get(`/forum/posts/${postId}/comments`, { params });
        return response.data;
    },

    // Create comment
    createComment: async (postId, commentData) => {
        const response = await api.post(`/forum/posts/${postId}/comments`, commentData);
        return response.data;
    },

    // Update comment
    updateComment: async (commentId, content) => {
        const response = await api.patch(`/forum/comments/${commentId}`, { content });
        return response.data;
    },

    // Delete comment
    deleteComment: async (commentId) => {
        const response = await api.delete(`/forum/comments/${commentId}`);
        return response.data;
    },

    // Vote on comment
    voteComment: async (commentId, voteType) => {
        const response = await api.post(`/forum/comments/${commentId}/vote`, { voteType });
        return response.data;
    },

    // Flag comment
    flagComment: async (commentId, reason) => {
        const response = await api.post(`/forum/comments/${commentId}/flag`, { reason });
        return response.data;
    }
};

export default forumService;