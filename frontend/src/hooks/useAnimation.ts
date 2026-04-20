import { useState, useEffect, useRef, useCallback } from 'react';
import type { LatLng, AnimationState } from '../types';
import { ANIMATION_CONFIG } from '../utils/config';

interface UseAnimationReturn {
  animState: AnimationState;
  startAnimation: (coords: LatLng[]) => void;
  stopAnimation: () => void;
  resetAnimation: () => void;
}

const INITIAL_STATE: AnimationState = {
  leftCoords: [],
  rightCoords: [],
  isComplete: false,
  progress: 0,
};

export function useAnimation(): UseAnimationReturn {
  const [animState, setAnimState] = useState<AnimationState>(INITIAL_STATE);
  const rafRef = useRef<number | null>(null);
  const coordsRef = useRef<LatLng[]>([]);
  const leftIdxRef = useRef(0);
  const rightIdxRef = useRef(0);

  const stopAnimation = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const resetAnimation = useCallback(() => {
    stopAnimation();
    coordsRef.current = [];
    leftIdxRef.current = 0;
    rightIdxRef.current = 0;
    setAnimState(INITIAL_STATE);
  }, [stopAnimation]);

  const startAnimation = useCallback((coords: LatLng[]) => {
    stopAnimation();

    if (!coords || coords.length < 2) return;

    coordsRef.current = coords;
    leftIdxRef.current = 0;
    rightIdxRef.current = coords.length - 1;

    const n = coords.length;
    const speed = ANIMATION_CONFIG.speed;

    const tick = () => {
      const left = leftIdxRef.current;
      const right = rightIdxRef.current;

      if (left >= right) {
        // Animation complete — show full route
        setAnimState({
          leftCoords: coords,
          rightCoords: [],
          isComplete: true,
          progress: 1,
        });
        return;
      }

      const newLeft = Math.min(left + speed, n - 1);
      const newRight = Math.max(right - speed, 0);

      leftIdxRef.current = newLeft;
      rightIdxRef.current = newRight;

      const progress = Math.min((newLeft / (n / 2)), 1);

      setAnimState({
        leftCoords: coords.slice(0, newLeft + 1),
        rightCoords: coords.slice(newRight),
        isComplete: false,
        progress,
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [stopAnimation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopAnimation();
  }, [stopAnimation]);

  return { animState, startAnimation, stopAnimation, resetAnimation };
}
