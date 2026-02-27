import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Navigate } from '@tanstack/react-router';
import { LogIn } from 'lucide-react';

interface AuthRequiredWrapperProps {
  children: React.ReactNode;
  message?: string;
  redirectTo?: string;
}

export default function AuthRequiredWrapper({
  children,
  message = 'Sign in to access this page',
  redirectTo = '/',
}: AuthRequiredWrapperProps) {
  const { identity, loginStatus, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  if (isInitializing || loginStatus === 'logging-in') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} />;
  }

  return <>{children}</>;
}
