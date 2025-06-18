import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext/index.js';
import LoadingSpinner from './ui/LoadingSpinner';

export const ProtectedRoute = () => {
  const { currentUser, loading, isAdmin } = useAuth();
    // If auth is still loading, show loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  // If not authenticated or not an admin, redirect to login
  if (!currentUser || !isAdmin()) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated and admin, render the children
  return <Outlet />;
};
