import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * AdminRoute Component
 * 
 * Protects admin routes by checking if the user is authenticated
 * and has admin or super_admin role. Redirects unauthorized users
 * to appropriate pages.
 * 
 * Features:
 * - Role-based access control
 * - Loading state handling
 * - Automatic redirection for unauthorized users
 * - Support for both admin and super_admin roles
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @returns {JSX.Element} Protected admin route or redirect
 */
const AdminRoute = ({ children }) => {
  const { user, token, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Checking admin access..." />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!token || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  // Check if user has admin privileges
  const isAdmin = user.role === 'super_admin' || user.role === 'admin';
  
  if (!isAdmin) {
    // Redirect to appropriate dashboard based on user role
    switch (user.role) {
      case 'patient':
        return <Navigate to="/patient/dashboard" replace />;
      case 'pharmacy_owner':
        return <Navigate to="/pharmacy/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // User is authenticated and has admin privileges
  return children;
};

export default AdminRoute;
