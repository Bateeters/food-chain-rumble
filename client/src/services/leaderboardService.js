import api from './api';

const leaderboardService = {
    // Get overall leaderboard
    getOverallLeaderboard: async (gameMode = null, page = 1, limit = 100) => {
        const response = await api.get('/leaderboard/overall', {
            params: { gameMode, page, limit }
        });
        return response.data;
    },

    // Get character-specific leaderboard
    getCharacterLeaderboard: async (characterId, gameMode = null, page = 1, limit = 100) => {
        const response = await api.get(`/leaderboard/character/${characterId}`, {
            params: { gameMode, page, limit }
        });
        return response.data;
    },

    // Get user rank
    getUserRank: async (userId, gameMode = null) => {
        const response = await api.get(`/leaderboard/user/${userId}`, {
            params: gameMode ? { gameMode } : {}
        });
        return response.data;
    }
};

export default leaderboardService;