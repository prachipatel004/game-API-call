
import { createSlice } from '@reduxjs/toolkit';

const storedAuth = localStorage.getItem('auth');

const initialState = {
  user: storedAuth ? JSON.parse(storedAuth) : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('auth', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      localStorage.removeItem('auth');
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
