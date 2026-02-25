import { Loader2 } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background image */}
      <img
        src="/assets/generated/landing-bg.dim_1920x1080.jpg"
        alt="Modified import car"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Dark cinematic overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />

      {/* Amber accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <img
            src="/assets/generated/revgrid-logo.dim_256x256.png"
            alt="RevGrid"
            className="w-24 h-24 object-contain drop-shadow-[0_0_24px_rgba(255,160,0,0.6)]"
          />
          <h1 className="font-heading text-6xl md:text-7xl font-bold tracking-widest text-white text-amber-glow drop-shadow-lg">
            REVGRID
          </h1>
          <p className="text-white/80 text-lg md:text-xl font-body tracking-wide max-w-md">
            The social network for car enthusiasts
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 w-full max-w-xs">
          <div className="flex-1 h-px bg-primary/60" />
          <span className="text-primary text-xs font-heading tracking-widest uppercase">Join the Grid</span>
          <div className="flex-1 h-px bg-primary/60" />
        </div>

        {/* Login button */}
        <Button
          onClick={login}
          disabled={isLoggingIn}
          className="w-full max-w-xs h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-heading text-xl font-bold tracking-widest rounded-sm amber-glow transition-all duration-200 hover:scale-105 active:scale-95"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Connecting...
            </>
          ) : (
            'LOGIN'
          )}
        </Button>

        <p className="text-white/40 text-xs font-body">
          Powered by Internet Identity — secure, decentralized login
        </p>
      </div>

      {/* Amber accent line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
    </div>
  );
}
