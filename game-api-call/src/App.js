// App.js
import './App.css';
import GameList from './Components/GameList';
import Login from './Components/Login';
import CityList from './Components/CityList';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoute from './Components/PrivateRoute';
import PublicRoute from './Components/PublicRoute';
import VenueList from './Components/VenueList';
import AddVenueForm from './Components/AddVenueList';
import BannerList from './Components/BannerList';



function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/gamelist"
          element={
            <PrivateRoute>
              <GameList />
            </PrivateRoute>
          }
        />
        <Route
          path="/citylist"
          element={
            <PrivateRoute>
              <CityList />
            </PrivateRoute>
          }
        />
           <Route
          path="/venuelist"
          element={
            <PrivateRoute>
              <VenueList />
            </PrivateRoute>
          }
        />
          <Route
          path="/addvenue"
          element={
            <PrivateRoute>
              <AddVenueForm/>
            </PrivateRoute>
          }
        />
           <Route
          path="/bannerlist"
          element={
            <PrivateRoute>
              <BannerList/>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
