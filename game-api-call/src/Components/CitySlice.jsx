// citySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import axiosInstance from '../Utils/AxioxInstamce';
const API_URL = 'http://sportapi.tracewavetransparency.com/api/v1/admin/common';

const getAuthHeaders = () => {
    const auth = JSON.parse(localStorage.getItem('auth'));
    return {
        'api-key': 'game@tracewave',
        'platform': 'AnDroId@Trace',
        'is-encript': 'false',
        token: ` ${auth?.accessToken}`,
    };
};
export const fetchCities = createAsyncThunk('cities/fetch', async (_, { rejectWithValue }) => {
    try {
        const res = await axiosInstance.post(`${API_URL}/city_listing`, {
            page: '1',
            per_page: '100',
            search: '',
        }, { headers: getAuthHeaders() });

        return res.data.data.result || [];
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch cities');
    }
});


export const addCity = createAsyncThunk('cities/add', async (newCity, { rejectWithValue }) => {
    try {
        const payload = {
            name: newCity.name
        };
        const res = await axiosInstance.post('http://sportapi.tracewavetransparency.com/api/v1/admin/common/add_city',
            payload,
            { headers: getAuthHeaders() });
        return res.data.data,
        {
            name: newCity.name,
        };

    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Add failed');
    }
});


export const editCity = createAsyncThunk('cities/edit', async (updatedCity, { rejectWithValue }) => {
    try {
        const payload = {
            name: updatedCity.name,
            city_id: updatedCity.id,

        };
        const res = await axiosInstance.post('http://sportapi.tracewavetransparency.com/api/v1/admin/common/edit_city', payload,
            { headers: getAuthHeaders() });
        return res.data.data,
        {
            name: updatedCity.name,
            id:updatedCity.id,
        };
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Edit failed');
    }
});


export const deleteCity = createAsyncThunk('city/delete', async (city_id, { rejectWithValue }) => {
    try {
        await axiosInstance.post('http://sportapi.tracewavetransparency.com/api/v1/admin/common/delete_city', { city_id }, { headers: getAuthHeaders() });
        return city_id;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Delete failed');
    }
});

const citySlice = createSlice({
    name: 'cities',
    initialState: {
        list: [],
        loading: false,
        error: null,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCities.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCities.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchCities.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(addCity.fulfilled, (state, action) => {
                state.list.push(action.payload);
            })
            .addCase(editCity.fulfilled, (state, action) => {
                const index = state.list.findIndex(city => city.id === action.payload.id);
                if (index !== -1) state.list[index] = action.payload;
            })
            .addCase(deleteCity.fulfilled, (state, action) => {
                state.list = state.list.filter(city => city.id !== action.payload);
            });
    }
});

export default citySlice.reducer;
