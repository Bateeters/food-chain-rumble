import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import characterReducer from './slices/characterSlice';
import leaderboardReducer from './slices/leaderboardSlice';
import userStatsReducer from './slices/userStatsSlice';
import forumReducer from './slices/forumSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    characters: characterReducer,
    leaderboard: leaderboardReducer,
    userStats: userStatsReducer,
    forum: forumReducer,
  }
});

// Expose store globally for debugging (development only)
if (process.env.NODE_ENV === 'development') {
  window.store = store;
}

export default store;