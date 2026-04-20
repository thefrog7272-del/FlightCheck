import { useState, useCallback, useRef } from 'react';

const STORAGE_KEY = 'flightcheck_muted';

function getInitialMuted(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'true';
  } catch {
    return false;
  }
}

export function useSound() {
  const [isMuted, setIsMuted] = useState(getInitialMuted);
  const ctxRef = useRef<AudioContext | null>(null);

  const playCheck = useCallback(() => {
    if (isMuted) return;

    try {
      if (!ctxRef.current) {
        ctxRef.current = new AudioContext();
      }
      const ctx = ctxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.value = 0.1;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // Silently ignore audio errors
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, []);

  return { playCheck, isMuted, toggleMute };
}
