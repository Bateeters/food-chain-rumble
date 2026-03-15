import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userStatsService from '../../services/userStatsService';

// Async thunks
export const fetchUserStats = createAsyncThunk(
    'userStats/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            const data = await userStatsService.getUserStats();
            return data;
        } catch (error) {
            rejectWithValue(error.response?.data?.error || 'Failed to fetch stats');
        }
    }
);

export const fetchRecentMatches = createAsyncThunk(
    'UserStats/fetchRecentMatches',
    async (limit = 10, { rejectWithValue }) => {
        try {
            const data = await userStatsService.getRecentMatches(limit);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch matches');
        }
    }
);

// Initial state
const initialState = {
    stats: null,
    recentMatches: [],
    isLoading: false,
    error: null
};

// Slice
const userStatsSlice = createSlice({
    name: 'userStats',
    initialState,
    reducers: {
        clearUserStats: (state) => {
            state.stats = null;
            state.recentMatches =[];
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch user stats
            .addCase(fetchUserStats.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserStats.fulfilled, (state, action) => {
                state.isLoading = false;
                state.stats = action.payload;
            })
            .addCase(fetchUserStats.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch recent matches
            .addCase(fetchRecentMatches.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchRecentMatches.fulfilled, (state, action) => {
                state.isLoading = false;
                state.recentMatches = action.payload.matches;
            })
            .addCase(fetchRecentMatches.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export const { clearUserStats } = userStatsSlice.actions;
export default userStatsSlice.reducer;