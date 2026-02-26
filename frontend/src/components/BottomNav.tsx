import { useState } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Home, Film, Compass, Calendar, User, Plus, Trophy } from 'lucide-react';
import CreatePostSheet from './CreatePostSheet';

const NAV_ITEMS = [
  { path: '/' as const, icon: Home, label: 'Home' },
  { path: '/reels' as const, icon: Film, label: 'Reels' },
  { path: '/discover' as const, icon: Compass, label: 'Discover' },
  { path: null, icon: Plus, label: 'Create' },
  { path: '/leaderboard' as const, icon: Trophy, label: 'Racers' },
  { path: '/profile' as const, icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const [sheetOpen, setSheetOpen] = useState(false);

  const isActive = (path: string | null) => {
    if (!path) return false;
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-background/95 backdrop-blur-sm border-t border-border flex items-center justify-around px-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          if (item.path === null) {
            return (
              <button
                key="create"
                onClick={() => setSheetOpen(true)}
                className="flex flex-col items-center justify-center w-12 h-12 -mt-5 rounded-full bg-primary shadow-amber amber-glow transition-transform active:scale-95"
              >
                <Plus className="w-6 h-6 text-primary-foreground" />
              </button>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => navigate({ to: item.path! })}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-2 rounded-lg transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'fill-primary/20' : ''}`} />
              <span className="text-[9px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <CreatePostSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}
