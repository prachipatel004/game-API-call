import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    const user = useSelector((state) => state.auth.user);
    const stored = JSON.parse(localStorage.getItem('auth'));

    const isAuthenticated = user?.accessToken || stored?.accessToken;

    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
