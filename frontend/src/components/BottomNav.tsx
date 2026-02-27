import React, { useState } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { Home, Film, Search, Plus, Trophy, User } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGuestCheck } from '../hooks/useGuestCheck';
import CreatePostSheet from './CreatePostSheet';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { identity } = useInternetIdentity();
  const { isGuest, requireAuth } = useGuestCheck();
  const [createSheetOpen, setCreateSheetOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Film, label: 'Reels', path: '/reels' },
    { icon: Search, label: 'Discover', path: '/discover' },
    null, // placeholder for center create button
    { icon: Trophy, label: 'Racers', path: '/leaderboard' },
    { icon: User, label: 'Profile', path: identity ? `/profile/${(identity as any)?.getPrincipal?.()?.toString?.() || ''}` : '/discover' },
  ];

  const handleCreateClick = () => {
    if (isGuest) {
      requireAuth('Sign in to create content');
      return;
    }
    setCreateSheetOpen(true);
  };

  const handleProfileClick = () => {
    if (isGuest) {
      requireAuth('Sign in to view your profile');
      return;
    }
    // Navigate to profile - the profile page will handle getting the current user
    navigate({ to: '/discover' });
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border">
        <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
          {/* Home */}
          <button
            onClick={() => navigate({ to: '/' })}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
              isActive('/') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Home</span>
          </button>

          {/* Reels */}
          <button
            onClick={() => navigate({ to: '/reels' })}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
              isActive('/reels') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Film className="w-5 h-5" />
            <span className="text-[10px]">Reels</span>
          </button>

          {/* Discover */}
          <button
            onClick={() => navigate({ to: '/discover' })}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
              isActive('/discover') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px]">Discover</span>
          </button>

          {/* Create (center floating button) */}
          <button
            onClick={handleCreateClick}
            className="flex flex-col items-center gap-0.5 -mt-4"
          >
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity active:scale-95">
              <Plus className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-[10px] text-muted-foreground mt-0.5">Create</span>
          </button>

          {/* Leaderboard */}
          <button
            onClick={() => navigate({ to: '/leaderboard' })}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
              isActive('/leaderboard') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Trophy className="w-5 h-5" />
            <span className="text-[10px]">Racers</span>
          </button>

          {/* Profile */}
          <button
            onClick={() => {
              if (isGuest) {
                requireAuth('Sign in to view your profile');
                return;
              }
              navigate({ to: '/discover' });
            }}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors text-muted-foreground hover:text-foreground`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px]">Profile</span>
          </button>
        </div>
      </nav>

      {!isGuest && (
        <CreatePostSheet open={createSheetOpen} onOpenChange={setCreateSheetOpen} />
      )}
    </>
  );
}
