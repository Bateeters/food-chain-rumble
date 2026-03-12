import api from './api';

const characterService = {
    // Get all characters
    getAllCharacters: async (availableOnly = true) => {
        const response = await api.get('/characters', {
            params: { available: availableOnly }
        });
        return response.data;
    },

    // Get character by ID
    getCharacterById: async (id) => {
        const response = await api.get(`/characters/${id}`);
        return response.data;
    },

    // Get character stats
    getCharacterStats: async (id, gameMode = null) => {
        const response = await api.get(`/characters/${id}/stats`, {
            params: gameMode ? { gameMode } : {}
        });
        return response.data;
    },

    // Get character leaderboard
    getCharacterLeaderboard: async (id, gameMode, page = 1, limit = 100) => {
        const response = await api.get(`/characters/${id}/leaderboard`, {
            params: { gameMode, page, limit }
        });
        return response.data;
    }
};

export default characterService;