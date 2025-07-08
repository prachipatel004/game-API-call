// Components/PublicRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const auth = JSON.parse(localStorage.getItem('auth'));
  return auth?.accessToken ? <Navigate to="/gamelist" /> : children;
};

export default PublicRoute;
