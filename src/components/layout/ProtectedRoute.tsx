import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
