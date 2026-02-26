import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';

const INTRO_IMAGES = [
  '/assets/generated/intro-car-1.dim_1920x1080.jpg',
  '/assets/generated/intro-car-2.dim_1920x1080.jpg',
  '/assets/generated/intro-car-3.dim_1920x1080.jpg',
  '/assets/generated/intro-car-4.dim_1920x1080.jpg',
];

const SLIDE_DURATION = 1800; // ms per slide
const TRANSITION_DURATION = 500; // ms fade

interface LandingPageProps {
  /** Whether the current user is already authenticated */
  isAuthenticated?: boolean;
  /** Called when the intro completes or is skipped */
  onIntroComplete?: () => void;
  /** If true, skip the slideshow and go straight to login/forward phase */
  skipIntroImmediately?: boolean;
}

export default function LandingPage({
  isAuthenticated = false,
  onIntroComplete,
  skipIntroImmediately = false,
}: LandingPageProps) {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === 'logging-in';

  const [phase, setPhase] = useState<'intro' | 'login'>(
    skipIntroImmediately ? 'login' : 'intro'
  );
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [introFadeOut, setIntroFadeOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const introTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Preload images
  useEffect(() => {
    INTRO_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // When phase transitions to 'login', check if user is already authenticated
  // and auto-forward them into the app without showing the login button.
  useEffect(() => {
    if (phase === 'login' && isAuthenticated) {
      // Small delay to let the fade-in animation play before forwarding
      const forwardTimer = setTimeout(() => {
        onIntroComplete?.();
      }, 300);
      return () => clearTimeout(forwardTimer);
    }
  }, [phase, isAuthenticated, onIntroComplete]);

  // Slideshow logic
  useEffect(() => {
    if (phase !== 'intro') return;

    const advance = () => {
      const nextSlide = currentSlide + 1;

      if (nextSlide >= INTRO_IMAGES.length) {
        // Last slide done — fade out intro and show login/forward
        introTimerRef.current = setTimeout(() => {
          setIntroFadeOut(true);
          introTimerRef.current = setTimeout(() => {
            setPhase('login');
          }, TRANSITION_DURATION);
        }, SLIDE_DURATION - TRANSITION_DURATION);
      } else {
        // Fade out current, then switch to next
        timerRef.current = setTimeout(() => {
          setFadeOut(true);
          timerRef.current = setTimeout(() => {
            setCurrentSlide(nextSlide);
            setFadeOut(false);
          }, TRANSITION_DURATION);
        }, SLIDE_DURATION - TRANSITION_DURATION);
      }
    };

    advance();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (introTimerRef.current) clearTimeout(introTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlide, phase]);

  const skipIntro = () => {
    if (phase !== 'intro') return;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (introTimerRef.current) clearTimeout(introTimerRef.current);
    setIntroFadeOut(true);
    setTimeout(() => setPhase('login'), TRANSITION_DURATION);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-black">
      {/* Amber accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-primary z-30" />

      {/* ── INTRO PHASE ── */}
      {phase === 'intro' && (
        <div
          className="absolute inset-0 cursor-pointer"
          onClick={skipIntro}
          style={{
            opacity: introFadeOut ? 0 : 1,
            transition: `opacity ${TRANSITION_DURATION}ms ease-in-out`,
          }}
        >
          {/* Slide images */}
          {INTRO_IMAGES.map((src, idx) => (
            <img
              key={src}
              src={src}
              alt={`Modified import car ${idx + 1}`}
              className="absolute inset-0 w-full h-full object-cover object-center"
              style={{
                opacity: idx === currentSlide ? (fadeOut ? 0 : 1) : 0,
                transition: `opacity ${TRANSITION_DURATION}ms ease-in-out`,
                zIndex: idx === currentSlide ? 1 : 0,
              }}
            />
          ))}

          {/* Cinematic dark overlay */}
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-black/30 to-black/70 pointer-events-none" />

          {/* Amber vignette */}
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.65) 100%)',
            }}
          />

          {/* Amber top bar flash */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary z-20 pointer-events-none" />

          {/* Branding overlay */}
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
            <img
              src="/assets/generated/revgrid-logo.dim_256x256.png"
              alt="RevGrid"
              className="w-20 h-20 object-contain drop-shadow-[0_0_32px_rgba(255,160,0,0.8)] mb-4"
              style={{
                filter: 'drop-shadow(0 0 24px rgba(255,160,0,0.7))',
              }}
            />
            <h1 className="font-heading text-5xl md:text-7xl font-bold tracking-widest text-white drop-shadow-lg"
              style={{ textShadow: '0 0 40px rgba(255,160,0,0.5), 0 2px 8px rgba(0,0,0,0.8)' }}
            >
              REVGRID
            </h1>
            <p className="text-white/70 text-base md:text-lg font-body tracking-widest mt-2 uppercase">
              The social network for car enthusiasts
            </p>
          </div>

          {/* Slide progress dots */}
          <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center gap-2 pointer-events-none">
            {INTRO_IMAGES.map((_, idx) => (
              <div
                key={idx}
                className="h-1 rounded-full transition-all duration-300"
                style={{
                  width: idx === currentSlide ? '2rem' : '0.5rem',
                  backgroundColor:
                    idx <= currentSlide
                      ? 'var(--color-primary, #f59e0b)'
                      : 'rgba(255,255,255,0.3)',
                }}
              />
            ))}
          </div>

          {/* Skip hint */}
          <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center pointer-events-none">
            <span className="text-white/40 text-xs font-body tracking-widest uppercase">
              Tap to skip
            </span>
          </div>
        </div>
      )}

      {/* ── LOGIN / FORWARD PHASE ── */}
      {phase === 'login' && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            animation: `fadeInUp ${TRANSITION_DURATION + 100}ms ease-out forwards`,
          }}
        >
          {/* Background — last car image as static bg */}
          <img
            src={INTRO_IMAGES[INTRO_IMAGES.length - 1]}
            alt="Modified import car"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />

          {/* Dark cinematic overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/85" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
            {/* Logo */}
            <div className="flex flex-col items-center gap-4">
              <img
                src="/assets/generated/revgrid-logo.dim_256x256.png"
                alt="RevGrid"
                className="w-24 h-24 object-contain"
                style={{ filter: 'drop-shadow(0 0 24px rgba(255,160,0,0.6))' }}
              />
              <h1 className="font-heading text-6xl md:text-7xl font-bold tracking-widest text-white drop-shadow-lg"
                style={{ textShadow: '0 0 40px rgba(255,160,0,0.4), 0 2px 8px rgba(0,0,0,0.8)' }}
              >
                REVGRID
              </h1>
              <p className="text-white/80 text-lg md:text-xl font-body tracking-wide max-w-md">
                The social network for car enthusiasts
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 w-full max-w-xs">
              <div className="flex-1 h-px bg-primary/60" />
              <span className="text-primary text-xs font-heading tracking-widest uppercase">
                {isAuthenticated ? 'Welcome Back' : 'Join the Grid'}
              </span>
              <div className="flex-1 h-px bg-primary/60" />
            </div>

            {/* Authenticated: show entering spinner while auto-forwarding */}
            {isAuthenticated ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-white/60 text-sm font-body tracking-wide">Entering RevGrid...</p>
              </div>
            ) : (
              <>
                {/* Login button for unauthenticated users */}
                <Button
                  onClick={login}
                  disabled={isLoggingIn}
                  className="w-full max-w-xs h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-heading text-xl font-bold tracking-widest rounded-sm transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{ boxShadow: '0 0 24px rgba(255,160,0,0.4)' }}
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
              </>
            )}
          </div>
        </div>
      )}

      {/* Amber accent line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary z-30" />

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
