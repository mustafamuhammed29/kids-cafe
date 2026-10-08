import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, staffProfile, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0F17] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-sky-400 mb-3" />
        <span className="text-xs font-semibold">Mitarbeiterberechtigung wird überprüft...</span>
      </div>
    );
  }

  // Strict check: User MUST have an active Supabase session AND an active owner profile (Single Owner only)
  if (!user || !staffProfile || !staffProfile.isActive || staffProfile.role !== 'owner') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
