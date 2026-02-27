import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import ProfileSetupForm from './ProfileSetupForm';

interface AuthGateProps {
  children: React.ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();

  // Show profile setup only when authenticated but no profile exists yet
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // While the identity is still initializing, show a minimal spinner
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <img
            src="/assets/generated/revgrid-logo.dim_256x256.png"
            alt="RevGrid"
            className="w-16 h-16 mx-auto mb-4 animate-pulse"
          />
          <div className="flex items-center gap-2 justify-center">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  // Show profile setup form for authenticated users without a profile
  if (showProfileSetup) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <img
              src="/assets/generated/revgrid-logo.dim_256x256.png"
              alt="RevGrid"
              className="w-16 h-16 mx-auto mb-3"
            />
            <h1 className="text-2xl font-heading text-primary">Set Up Your Profile</h1>
            <p className="text-muted-foreground text-sm mt-1">Tell the RevGrid community about yourself</p>
          </div>
          <ProfileSetupForm />
        </div>
      </div>
    );
  }

  // Always render children — guests see the app in read-only mode
  return <>{children}</>;
}
