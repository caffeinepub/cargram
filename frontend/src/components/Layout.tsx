import React from 'react';
import { Outlet } from '@tanstack/react-router';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import GuestPromptBanner from './GuestPromptBanner';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function Layout() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />
      {!isAuthenticated && <GuestPromptBanner />}
      {/* Sponsor banner */}
      <div className="flex items-center justify-center gap-4 px-4 py-2 bg-muted/30 border-b border-border overflow-x-auto">
        <a href="https://www.ebay.com/motors" target="_blank" rel="noopener noreferrer" className="shrink-0">
          <img src="/assets/generated/ebay-banner.dim_940x313.jpg" alt="eBay Motors" className="h-8 object-contain" />
        </a>
        <a href="https://bullboost.com" target="_blank" rel="noopener noreferrer" className="shrink-0">
          <img src="/assets/generated/bullboost-logo.dim_760x200.png" alt="BullBoost" className="h-8 object-contain" />
        </a>
        <a href="https://enjukuracing.com" target="_blank" rel="noopener noreferrer" className="shrink-0">
          <img src="/assets/enjukuRacingBanner.jpg" alt="Enjuku Racing" className="h-8 object-contain" />
        </a>
      </div>
      <main className="flex-1 pb-20">
        <React.Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          }
        >
          <Outlet />
        </React.Suspense>
      </main>
      <BottomNav />
    </div>
  );
}
