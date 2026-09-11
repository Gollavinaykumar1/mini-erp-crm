import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

interface Props {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<Props> = ({ children, allowedRoles }) => {
  const { user, loading, hasRole } = useAuth();
  const location = useLocation();

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return <div style={{ padding: '2rem', textAlign: 'center', marginTop: '2rem' }}>Access Denied: You do not have permission to view this page.</div>;
  }

  return <>{children}</>;
};
