import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import characterService from '../../services/characterService';

// Async thunks
export const fetchCharacters = createAsyncThunk(
    'characters/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const data = await characterService.getAllCharacters();
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch characters');
        }
    }
);

export const fetchCharacterById = createAsyncThunk(
    'characters/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const data = await characterService.getCharacterById(id);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch character')
        }
    }
);

// Initial state
const initialState = {
    characters: [],
    selectedCharacter: null,
    isLoading: false,
    error: null
};

// Slice
const characterSlice = createSlice({
    name: 'characters',
    initialState,
    reducers: {
        clearSelectedCharacter: (state) => {
            state.selectedCharacter = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch all characters
            .addCase(fetchCharacters.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCharacters.fulfilled, (state, action) => {
                state.isLoading = false;
                state.characters = Array.isArray(action.payload.characters)
                ? action.payload.characters
                : [];
            })
            .addCase(fetchCharacters.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.characters = [];
            })
            // Fetch character by ID
            .addCase(fetchCharacterById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCharacterById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.selectedCharacter = action.payload.character || null;
            })
            .addCase(fetchCharacterById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.selectedCharacter = null;
            });
    }
});

export const { clearSelectedCharacter, clearError } = characterSlice.actions;
export default characterSlice.reducer;