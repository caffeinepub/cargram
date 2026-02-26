import { useNavigate, useRouterState } from '@tanstack/react-router';
import { MessageCircle, Bell, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PAGE_TITLES: Record<string, string> = {
  '/': 'REVGRID',
  '/reels': 'REELS',
  '/discover': 'DISCOVER',
  '/events': 'EVENTS',
  '/profile': 'PROFILE',
  '/messages': 'MESSAGES',
  '/mechanics': 'MECHANICS',
  '/builds': 'BUILDS',
  '/about': 'ABOUT',
};

export default function TopBar() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  const getTitle = () => {
    if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
    if (pathname.startsWith('/profile')) return 'PROFILE';
    if (pathname.startsWith('/messages')) return 'MESSAGES';
    if (pathname.startsWith('/mechanics')) return 'MECHANICS';
    if (pathname.startsWith('/builds')) return 'BUILDS';
    if (pathname.startsWith('/events')) return 'EVENTS';
    if (pathname.startsWith('/create')) return 'CREATE';
    if (pathname.startsWith('/marketplace')) return 'MARKETPLACE';
    return 'REVGRID';
  };

  const isHome = pathname === '/';
  const isAbout = pathname === '/about';

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-background/95 backdrop-blur-sm border-b border-border flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        {isHome && (
          <img src="/assets/generated/revgrid-logo.dim_256x256.png" alt="RevGrid" className="w-8 h-8 object-contain" />
        )}
        <h1 className="font-heading text-xl font-bold text-primary tracking-widest">{getTitle()}</h1>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: '/messages' })}
          className="text-foreground hover:text-primary"
        >
          <MessageCircle className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-foreground hover:text-primary"
        >
          <Bell className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: '/about' })}
          className={isAbout ? 'text-primary' : 'text-foreground hover:text-primary'}
          title="About RevGrid"
        >
          <Info className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
