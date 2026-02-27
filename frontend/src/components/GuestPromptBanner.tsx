import React, { useState } from 'react';
import { X, LogIn } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

export default function GuestPromptBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { login, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();

  if (dismissed) return null;

  const handleLogin = async () => {
    try {
      await login();
      queryClient.invalidateQueries();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 flex items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <LogIn className="w-4 h-4 text-primary shrink-0" />
        <span className="text-foreground/80 truncate">
          <span className="font-medium text-foreground">Browse as guest</span>
          {' — '}Sign in to like, comment, and create content
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleLogin}
          disabled={loginStatus === 'logging-in'}
          className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loginStatus === 'logging-in' ? 'Signing in...' : 'Sign In'}
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
