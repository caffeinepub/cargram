import React, { useState, useEffect, useCallback } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

interface LandingPageProps {
  onLoginSuccess: () => void;
}

const slides = [
  {
    image: '/assets/generated/intro-car-1.dim_1920x1080.jpg',
    title: 'WELCOME TO REVGRID',
    subtitle: 'The Ultimate Car Community',
  },
  {
    image: '/assets/generated/intro-car-2.dim_1920x1080.jpg',
    title: 'SHARE YOUR BUILD',
    subtitle: 'Show off your ride to the world',
  },
  {
    image: '/assets/generated/intro-car-3.dim_1920x1080.jpg',
    title: 'CONNECT WITH RACERS',
    subtitle: 'Find your crew, join the grid',
  },
  {
    image: '/assets/generated/intro-car-4.dim_1920x1080.jpg',
    title: 'JOIN THE GRID',
    subtitle: 'Your journey starts here',
  },
];

export default function LandingPage({ onLoginSuccess }: LandingPageProps) {
  const { login, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Handle successful login
  useEffect(() => {
    if (identity) {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      onLoginSuccess();
    }
  }, [identity, onLoginSuccess, queryClient]);

  const handleLogin = useCallback(async () => {
    setIsLoggingIn(true);
    setLoginError('');
    try {
      await login();
    } catch (err: any) {
      console.error('Login error:', err);
      if (err?.message !== 'User is already authenticated') {
        setLoginError('Login failed. Please try again.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  }, [login]);

  const isProcessing = isLoggingIn || loginStatus === 'logging-in';

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Slideshow */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center">
        {/* Logo */}
        <div className="mb-8">
          <img
            src="/assets/generated/revgrid-logo.dim_256x256.png"
            alt="RevGrid"
            className="w-24 h-24 mx-auto mb-4"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <h1 className="text-5xl font-black text-white tracking-wider">
            REV<span className="text-primary">GRID</span>
          </h1>
        </div>

        {/* Slide Text */}
        <div className="mb-12 min-h-[80px]">
          <h2 className="text-2xl font-bold text-white mb-2">
            {slides[currentSlide].title}
          </h2>
          <p className="text-white/70 text-lg">
            {slides[currentSlide].subtitle}
          </p>
        </div>

        {/* Slide Indicators */}
        <div className="flex gap-2 mb-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-primary w-6'
                  : 'bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Login Button */}
        <div className="w-full max-w-xs space-y-4">
          <button
            onClick={handleLogin}
            disabled={isProcessing}
            className="w-full py-4 bg-primary text-primary-foreground font-bold text-lg rounded-2xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Connecting...
              </span>
            ) : (
              'Get Started 🚗'
            )}
          </button>

          {loginError && (
            <p className="text-red-400 text-sm text-center">{loginError}</p>
          )}

          <p className="text-white/50 text-xs text-center">
            Powered by Internet Computer • Decentralized & Secure
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center z-10">
        <p className="text-white/30 text-xs">
          © {new Date().getFullYear()} RevGrid • Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white/60 transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
