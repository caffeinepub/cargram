import { useCallback, useEffect, useRef, useState } from 'react';

// Royalty-free electronic/driving track from Internet Archive (Public Domain)
// "Big Car Theft" by Jason Shaw - CC BY 3.0 - Audionautix
const MUSIC_URL =
  'https://ia800905.us.archive.org/19/items/BigCarTheft/BigCarTheft.mp3';

export interface UseLandingMusicReturn {
  isMuted: boolean;
  isPlaying: boolean;
  toggleMute: () => void;
  startPlayback: () => void;
  fadeOutAndStop: (durationMs?: number) => void;
}

export function useLandingMusic(): UseLandingMusicReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize audio element once — unmuted by default
  useEffect(() => {
    const audio = new Audio(MUSIC_URL);
    audio.loop = true;
    audio.volume = 0;
    audio.muted = false;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    };
  }, []);

  const startPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Start unmuted and fade in volume
    audio.muted = false;
    audio.volume = 0;

    audio.play().then(() => {
      setIsPlaying(true);
      // Fade in volume to 0.5
      let vol = 0;
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = setInterval(() => {
        vol = Math.min(vol + 0.05, 0.5);
        audio.volume = vol;
        if (vol >= 0.5 && fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
        }
      }, 50);
    }).catch(() => {
      // Autoplay blocked by browser — fall back to muted autoplay
      audio.muted = true;
      setIsMuted(true);
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Autoplay fully blocked
      });
    });
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      // Unmute: try to play if not already playing, then fade in
      audio.muted = false;
      if (audio.paused) {
        audio.play().then(() => {
          setIsPlaying(true);
          // Fade in volume
          audio.volume = 0;
          let vol = 0;
          if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
          fadeIntervalRef.current = setInterval(() => {
            vol = Math.min(vol + 0.05, 0.5);
            audio.volume = vol;
            if (vol >= 0.5 && fadeIntervalRef.current) {
              clearInterval(fadeIntervalRef.current);
            }
          }, 50);
        }).catch(() => {});
      } else {
        // Already playing, just fade in
        audio.volume = 0;
        let vol = 0;
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = setInterval(() => {
          vol = Math.min(vol + 0.05, 0.5);
          audio.volume = vol;
          if (vol >= 0.5 && fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
          }
        }, 50);
      }
      setIsMuted(false);
    } else {
      // Mute: fade out then mute
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      let vol = audio.volume;
      fadeIntervalRef.current = setInterval(() => {
        vol = Math.max(vol - 0.05, 0);
        audio.volume = vol;
        if (vol <= 0 && fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
          audio.muted = true;
        }
      }, 50);
      setIsMuted(true);
    }
  }, [isMuted]);

  const fadeOutAndStop = useCallback((durationMs = 1500) => {
    const audio = audioRef.current;
    if (!audio || audio.paused) return;

    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    const steps = 30;
    const stepInterval = durationMs / steps;
    const volumeStep = audio.volume / steps;
    let currentVol = audio.volume;

    fadeIntervalRef.current = setInterval(() => {
      currentVol = Math.max(currentVol - volumeStep, 0);
      audio.volume = currentVol;
      if (currentVol <= 0 && fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
        audio.pause();
        setIsPlaying(false);
      }
    }, stepInterval);
  }, []);

  return { isMuted, isPlaying, toggleMute, startPlayback, fadeOutAndStop };
}
