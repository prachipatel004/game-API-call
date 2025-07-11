
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://sportapi.tracewavetransparency.com/api/v1/admin/game';

const getAuthHeaders = () => {
    const auth = JSON.parse(localStorage.getItem('auth'));
    const token = auth?.accessToken;

    return {
        'api-key': 'game@tracewave',
        'platform': 'AnDroId@Trace',
        'is-encript': 'false',
        'token': `${token}`,
    };
};
export const fetchGames = createAsyncThunk('games/fetch', async (_, { rejectWithValue }) => {
    try {
        const res = await axios.post('http://sportapi.tracewavetransparency.com/api/v1/admin/game/game_listing', { page: '1', per_page: '10' }, {
            headers: getAuthHeaders(),
        });
        return res.data.data?.result || [];

    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Listing failed');
    }
});
export const addGame = createAsyncThunk('games/add', async (newGame, { rejectWithValue }) => {
    try {
        const payload = {
            name: newGame.name,
            photo: newGame.photo,
        };
        const res = await axios.post('http://sportapi.tracewavetransparency.com/api/v1/admin/game/add_game',
            payload,
            { headers: getAuthHeaders() });
        return res.data.data,
        {
            name:newGame.name,
            photo:newGame.photo,
        };

    } catch (err) {
        console.error('Add Game Error:', err.response?.data || err.message);
        return rejectWithValue(err.response?.data?.message || 'Add failed');
    }
});
export const editGame = createAsyncThunk(
    'games/edit',
    async (updatedGame, { rejectWithValue }) => {
        try {
            const payload = {
                game_id: updatedGame.id,
                name: updatedGame.name,
                photo: updatedGame.photo,
            };

            const res = await axios.post(
                'http://sportapi.tracewavetransparency.com/api/v1/admin/game/edit_game',
                payload,
                { headers: getAuthHeaders() }
            );

            return {
                id: updatedGame.id,
                ...res.data.data,
            };
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Edit failed');
        }
    }
);
export const deleteGame = createAsyncThunk('games/delete', async (game_id, { rejectWithValue }) => {
    try {
        await axios.post(`${API_URL}/delete_game`, { game_id }, { headers: getAuthHeaders() });
        return game_id;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Delete failed');
    }
});

const gameSlice = createSlice({
    name: 'games',
    initialState: {
        list: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchGames.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchGames.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchGames.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(addGame.fulfilled, (state, action) => {
                state.list.unshift(action.payload);
            })
            .addCase(addGame.rejected, (state, action) => {
                state.error = action.payload;
            })

            .addCase(editGame.fulfilled, (state, action) => {
                const index = state.list.findIndex(game => game.id === action.payload.id);
                if (index !== -1) state.list[index] = action.payload;
            })
            .addCase(editGame.rejected, (state, action) => {
                state.error = action.payload;
            })

            .addCase(deleteGame.fulfilled, (state, action) => {
                state.list = state.list.filter(game => game.id !== action.payload);
            })
            .addCase(deleteGame.rejected, (state, action) => {
                state.error = action.payload;
            });
    }
});

export default gameSlice.reducer;
