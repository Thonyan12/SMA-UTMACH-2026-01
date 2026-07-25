import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    // If not authenticated, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;
