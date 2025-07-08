import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './GameSlice';
import authReducer from './AuthSlice';
import cityReducer from './CitySlice';
export default configureStore({
  reducer: {
    games: gameReducer,
    cities: cityReducer,
    auth: authReducer,
  },
});
