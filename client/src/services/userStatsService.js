import api from './api';

const userStatsService = {
    // Get current user's stats
    getUserStats: async () => {
        const response = await api.get ('/user/stats');
        return response.data
    },

    // Get current user's recent matches
    getRecentMatches: async (limit = 10) => {
        const response = await api.get('/user/recent-matches', {
            params: { limit }
        });
        return response.data;
    }
};

export default userStatsService;