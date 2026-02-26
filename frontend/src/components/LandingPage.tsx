import React, { useState, useEffect, useRef } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useLandingMusic } from '../hooks/useLandingMusic';

interface LandingPageProps {
  isAuthenticated: boolean;
  onIntroComplete?: () => void;
  onLoginSuccess?: () => void;
  skipIntroImmediately?: boolean;
}

const introSlides = [
  '/assets/generated/intro-car-1.dim_1920x1080.jpg',
  '/assets/generated/intro-car-2.dim_1920x1080.jpg',
  '/assets/generated/intro-car-3.dim_1920x1080.jpg',
  '/assets/generated/intro-car-4.dim_1920x1080.jpg',
];

export default function LandingPage({
  isAuthenticated,
  onIntroComplete,
  onLoginSuccess,
  skipIntroImmediately = false,
}: LandingPageProps) {
  const { login, loginStatus } = useInternetIdentity();
  const { isMuted, isPlaying, toggleMute, startPlayback, fadeOutAndStop } = useLandingMusic();

  const [phase, setPhase] = useState<'intro' | 'login'>(
    skipIntroImmediately ? 'login' : 'intro'
  );
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loginError, setLoginError] = useState('');
  const introTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Start music when component mounts
  useEffect(() => {
    if (!skipIntroImmediately) {
      startPlayback();
    }
    return () => {
      if (introTimerRef.current) clearTimeout(introTimerRef.current);
    };
  }, []);

  // Auto-advance slides during intro
  useEffect(() => {
    if (phase !== 'intro') return;

    const SLIDE_DURATION = 1800;
    const TOTAL_SLIDES = introSlides.length;

    if (currentSlide < TOTAL_SLIDES - 1) {
      introTimerRef.current = setTimeout(() => {
        setCurrentSlide((s) => s + 1);
      }, SLIDE_DURATION);
    } else {
      // Last slide — transition to login
      introTimerRef.current = setTimeout(() => {
        setPhase('login');
      }, SLIDE_DURATION);
    }

    return () => {
      if (introTimerRef.current) clearTimeout(introTimerRef.current);
    };
  }, [phase, currentSlide]);

  // If skipIntroImmediately changes to true after mount, jump to login phase
  useEffect(() => {
    if (skipIntroImmediately && phase === 'intro') {
      setPhase('login');
    }
  }, [skipIntroImmediately]);

  const handleLogin = async () => {
    setLoginError('');
    try {
      await login();
      // Fade out music on successful login
      fadeOutAndStop();
      // Notify parent that login succeeded
      onLoginSuccess?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      if (message === 'User is already authenticated') {
        fadeOutAndStop();
        onLoginSuccess?.();
      } else {
        setLoginError('Login failed. Please try again.');
      }
    }
  };

  const handleSkipIntro = () => {
    if (introTimerRef.current) clearTimeout(introTimerRef.current);
    setPhase('login');
    onIntroComplete?.();
  };

  // ── Intro slideshow phase ──────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="relative min-h-screen bg-black overflow-hidden">
        {/* Slides */}
        {introSlides.map((src, i) => (
          <div
            key={src}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === currentSlide ? 1 : 0 }}
          >
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover"
              draggable={false}
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}

        {/* Logo overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
          <img
            src="/assets/generated/revgrid-logo.dim_256x256.png"
            alt="RevGrid"
            className="w-24 h-24 mb-4 drop-shadow-2xl"
          />
          <h1 className="text-4xl font-black tracking-widest text-white drop-shadow-lg uppercase">
            RevGrid
          </h1>
          <p className="text-white/70 text-sm tracking-widest mt-2 uppercase">
            The Automotive Social Network
          </p>
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-2 z-10">
          {introSlides.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === currentSlide ? 'bg-primary w-6' : 'bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Skip button */}
        <button
          onClick={handleSkipIntro}
          className="absolute top-4 right-4 z-20 text-white/60 hover:text-white text-sm px-3 py-1 rounded border border-white/20 hover:border-white/50 transition-colors"
        >
          Skip
        </button>

        {/* Mute button */}
        <button
          onClick={toggleMute}
          className="absolute bottom-4 right-4 z-20 text-white/60 hover:text-white text-sm px-3 py-1 rounded border border-white/20 hover:border-white/50 transition-colors"
        >
          {isMuted ? '🔇 Unmute' : '🔊 Mute'}
        </button>
      </div>
    );
  }

  // ── Login phase ────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex flex-col items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/assets/generated/landing-bg.dim_1920x1080.jpg"
          alt=""
          className="w-full h-full object-cover"
          draggable={false}
        />
        <div className="absolute inset-0 bg-black/65" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center max-w-sm w-full">
        <img
          src="/assets/generated/revgrid-logo.dim_256x256.png"
          alt="RevGrid"
          className="w-20 h-20 drop-shadow-2xl"
        />
        <div>
          <h1 className="text-4xl font-black tracking-widest text-white uppercase mb-2">
            RevGrid
          </h1>
          <p className="text-white/70 text-sm tracking-wide">
            The Automotive Social Network
          </p>
        </div>

        <div className="w-full flex flex-col gap-3 mt-4">
          <button
            onClick={handleLogin}
            disabled={loginStatus === 'logging-in'}
            className="w-full py-3 px-6 bg-primary text-primary-foreground font-bold rounded-lg text-base tracking-wide uppercase transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loginStatus === 'logging-in' ? (
              <>
                <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Connecting…
              </>
            ) : (
              'Login / Sign Up'
            )}
          </button>

          {loginError && (
            <p className="text-destructive text-sm text-center">{loginError}</p>
          )}
        </div>

        <p className="text-white/40 text-xs mt-2">
          Secure login powered by Internet Identity
        </p>
      </div>

      {/* Mute button */}
      {isPlaying && (
        <button
          onClick={toggleMute}
          className="absolute bottom-4 right-4 z-20 text-white/60 hover:text-white text-sm px-3 py-1 rounded border border-white/20 hover:border-white/50 transition-colors"
        >
          {isMuted ? '🔇 Unmute' : '🔊 Mute'}
        </button>
      )}
    </div>
  );
}
