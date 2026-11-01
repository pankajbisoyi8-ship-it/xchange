import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.ts';
import { Role } from '../../types/index.ts';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  redirectTo?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  redirectTo
}) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Verifying session credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    let target = '/login';
    if (allowedRoles?.includes('ADMIN')) target = '/admin/login';
    if (allowedRoles?.includes('AGENT')) target = '/agent/login';
    return <Navigate to={redirectTo || target} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If logged in as wrong role, redirect appropriately
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'AGENT') return <Navigate to="/agent" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

