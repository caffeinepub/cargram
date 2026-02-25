import { Outlet } from '@tanstack/react-router';
import BottomNav from './BottomNav';
import TopBar from './TopBar';
import { ShoppingCart, ExternalLink } from 'lucide-react';

const AFFILIATE_URL =
  'https://ebay.com/inf/revreel?mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=5339143418&toolid=80008&mkevt=1';

function AftermarketBanner() {
  return (
    <a
      href={AFFILIATE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 px-4 py-2 bg-asphalt-900 border-b border-amber-500/30 hover:bg-asphalt-800 transition-colors group"
    >
      <ShoppingCart className="w-4 h-4 text-amber-400 flex-shrink-0" />
      <span className="text-xs font-semibold tracking-wide text-amber-400 group-hover:text-amber-300 transition-colors uppercase">
        Shop Aftermarket Parts
      </span>
      <span className="hidden sm:inline text-xs text-muted-foreground group-hover:text-amber-300/70 transition-colors">
        — Find the best deals on eBay
      </span>
      <ExternalLink className="w-3 h-3 text-amber-500/60 group-hover:text-amber-400 transition-colors flex-shrink-0" />
    </a>
  );
}

export default function Layout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />
      <div className="pt-14">
        <AftermarketBanner />
        <main className="flex-1 pb-20">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
