import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Checking authentication credentials..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div style={{ maxWidth: 600, margin: '60px auto', textAlign: 'center', padding: '30px' }}>
        <h2 style={{ color: '#b91c1c', marginBottom: '12px' }}>Access Prohibited</h2>
        <p style={{ color: '#475569' }}>
          Your account role (<strong>{user.role}</strong>) does not have authorization to view this page.
        </p>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
