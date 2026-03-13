import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import characterReducer from './slices/characterSlice';
import leaderboardReducer from './slices/leaderboardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    characters: characterReducer,
    leaderboard: leaderboardReducer
  }
});

// Expose store globally for debugging (development only)
if (process.env.NODE_ENV === 'development') {
  window.store = store;
}