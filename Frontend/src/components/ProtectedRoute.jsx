import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    </div>;
  }

  if (!user) {
    // If not authenticated, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;
