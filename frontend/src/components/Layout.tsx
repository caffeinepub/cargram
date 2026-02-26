import { Outlet } from '@tanstack/react-router';
import BottomNav from './BottomNav';
import TopBar from './TopBar';

const AFFILIATE_URL =
  'https://ebay.com/inf/revreel?mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=5339143418&toolid=80008&mkevt=1';

const BULLBOOST_URL = 'https://bullboostperformance.com/?ref=xprbexxu';

const ENJUKU_URL = 'https://enjukuracing.com';

function SponsorBannerRow() {
  return (
    <div className="flex items-stretch w-full bg-black border-b border-amber-500/20 overflow-hidden">
      {/* eBay Banner */}
      <a
        href={AFFILIATE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center overflow-hidden hover:opacity-90 transition-opacity"
        style={{ minWidth: 0 }}
      >
        <img
          src="/assets/generated/ebay-banner.dim_940x313.jpg"
          alt="Shop Aftermarket Parts on eBay"
          className="w-full h-16 object-cover object-center"
        />
      </a>

      {/* BullBoost Banner */}
      <a
        href={BULLBOOST_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center bg-black hover:opacity-90 transition-opacity border-l border-amber-500/10 overflow-hidden"
        style={{ minWidth: 0 }}
      >
        <img
          src="/assets/683892f33f52abb30a48532909b689c7.w1600.h900.jpg"
          alt="Bull Boost Performance"
          className="w-full h-16 object-contain object-center px-1"
          style={{ objectPosition: 'center 30%' }}
        />
      </a>

      {/* Enjuku Racing Banner */}
      <a
        href={ENJUKU_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center bg-black hover:opacity-90 transition-opacity border-l border-amber-500/10 overflow-hidden"
        style={{ minWidth: 0 }}
      >
        <img
          src="/assets/generated/enjuku-racing-banner.dim_940x627.jpg"
          alt="Enjuku Racing"
          className="w-full h-16 object-cover object-center"
        />
      </a>
    </div>
  );
}

export default function Layout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />
      <div className="pt-14">
        <SponsorBannerRow />
        <main className="flex-1 pb-20">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
