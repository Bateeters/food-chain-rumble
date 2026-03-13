import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import leaderboardService from '../../services/leaderboardService';

// Async thunks
export const fetchOverallLeaderboard = createAsyncThunk(
    'leaderboard/fetchOverall',
    async ({ gameMode, page, limit }, { rejectWithValue }) => {
        try {
            const data = await leaderboardService.getOverallLeaderboard(gameMode, page, limit);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch leaderboard');
        }
    }
);

export const fetchCharacterLeaderboard = createAsyncThunk(
    'leaderboard/fetchCharacter',
    async ({ characterId, gameMode, page, limit }, { rejectWithValue }) => {
        try {
            const data = await leaderboardService.getCharacterLeaderboard(characterId, gameMode, page, limit);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch character leaderboard');
        }
    }
);

// Initial state
const initialState = {
    rankings: [],
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalPlayers: 0,
        hasMore: false
    },
    isLoading: false,
    error: null
};

// Slice
const leaderboardSlice = createSlice({
    name: 'leaderboard',
    initialState,
    reducers: {
        clearLeaderboard: (state) => {
            state.rankings = [];
            state.pagination = {
                currentPage: 1,
                totalPages: 1,
                totalPlayers: 0,
                hasMore: false
            };
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch overall leaderboard
            .addCase(fetchOverallLeaderboard.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchOverallLeaderboard.fulfilled, (state, action) => {
                state.isLoading = false;
                state.rankings = action.payload.rankings || [];
                state.pagination = action.payload.pagination || state.pagination;
            })
            .addCase(fetchOverallLeaderboard.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.rankings = [];
            })
            // Fetch character leaderboard
            .addCase(fetchCharacterLeaderboard.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCharacterLeaderboard.fulfilled, (state, action) => {
                state.isLoading = false;
                state.rankings = action.payload.rankings || [];
                state.pagination = action.payload.pagination || state.pagination;
            })
            .addCase(fetchCharacterLeaderboard.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.rankings = [];
            });
    }
});

export const { clearLeaderboard, clearError } = leaderboardSlice.actions;
export default leaderboardSlice.reducer;