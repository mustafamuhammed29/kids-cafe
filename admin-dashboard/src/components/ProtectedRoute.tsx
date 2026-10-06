import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, staffProfile, isLoading, isConfigured } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#183D3D] mb-3" />
        <span className="text-xs font-medium">Sitzung wird überprüft...</span>
      </div>
    );
  }

  // If Supabase not configured in development mode, allow seeing the dashboard with notice
  if (!isConfigured) {
    return <>{children}</>;
  }

  // Not logged in or not staff -> redirect to login
  if (!user || !staffProfile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
