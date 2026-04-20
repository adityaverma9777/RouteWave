import { useState, useEffect, useRef, useCallback } from 'react';
import type { LatLng, AnimationState } from '../types';

// ─── Constants ────────────────────────────────────────────────────────────────
const NUM_BRANCHES = 5;
const CONVERGENCE_STEP = 0.022; // ~45 frames ≈ 0.75s for convergence effect

const INITIAL_STATE: AnimationState = {
  phase: 'idle',
  leftBranches: [],
  rightBranches: [],
  finalRoute: [],
  meetingPoint: null,
  convergenceProgress: 0,
  isComplete: false,
  progress: 0,
};

// ─── Adaptive speed: target ~120 frames total for the explore phase ───────────
function adaptiveSpeed(numCoords: number): number {
  // Each side covers n/2 coords in ~120 frames
  return Math.max(2, Math.ceil(numCoords / 2 / 120));
}

// ─── Branch speed multipliers (variation so they look independent) ────────────
function branchSpeeds(base: number, count: number): number[] {
  // Patterns: 1.0, 0.8, 1.15, 0.65, 1.3 — gives a realistic spread feel
  const factors = [1.0, 0.82, 1.15, 0.65, 1.30];
  return Array.from({ length: count }, (_, i) =>
    Math.max(1, Math.round(base * (factors[i] ?? 1.0)))
  );
}

// ─── Generate N offset branches around the real route ────────────────────────
/**
 * Branch 0 = the actual OSRM route.
 * Branches 1..N-1 are copies with a perpendicular lateral offset that
 * peaks at the midpoint and fades to zero at both endpoints (so all
 * branches share the same start and end marker).
 *
 * Offset magnitude is scaled to 1.5% of the route's geographic span per
 * branch level — ensures visibility at any zoom level.
 */
function generateBranches(coords: LatLng[], numBranches: number): LatLng[][] {
  const branches: LatLng[][] = [coords];

  if (coords.length < 2) return branches;

  // Scale offset to route extent so it's visible at any zoom
  const lats = coords.map(c => c[0]);
  const lngs = coords.map(c => c[1]);
  const latSpan = Math.max(...lats) - Math.min(...lats);
  const lngSpan = Math.max(...lngs) - Math.min(...lngs);
  const span = Math.max(latSpan, lngSpan, 0.01); // floor prevents 0 for tiny routes
  const unitOffset = span * 0.016; // 1.6% of span per branch level

  for (let b = 1; b < numBranches; b++) {
    const sign = b % 2 === 0 ? 1 : -1;
    const magnitude = Math.ceil(b / 2);
    const lateralDeg = sign * magnitude * unitOffset;

    const branch: LatLng[] = coords.map((pt, i) => {
      const prev = coords[Math.max(0, i - 1)];
      const next = coords[Math.min(coords.length - 1, i + 1)];

      // Direction along the route at this point
      const dlat = next[0] - prev[0];
      const dlng = next[1] - prev[1];
      const len = Math.sqrt(dlat * dlat + dlng * dlng) || 1;

      // Perpendicular unit vector (rotate 90°)
      const perpLat = -dlng / len;
      const perpLng = dlat / len;

      // Bell-shaped fade: 0 at endpoints, 1 mid-route
      const t = i / Math.max(coords.length - 1, 1);
      const fade = Math.sin(t * Math.PI);

      return [
        pt[0] + perpLat * lateralDeg * fade,
        pt[1] + perpLng * lateralDeg * fade,
      ] as LatLng;
    });

    branches.push(branch);
  }

  return branches;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
interface UseAnimationReturn {
  animState: AnimationState;
  startAnimation: (coords: LatLng[]) => void;
  stopAnimation: () => void;
  resetAnimation: () => void;
}

export function useAnimation(): UseAnimationReturn {
  const [animState, setAnimState] = useState<AnimationState>(INITIAL_STATE);

  const rafRef        = useRef<number | null>(null);
  const coordsRef     = useRef<LatLng[]>([]);
  const branchesRef   = useRef<LatLng[][]>([]);
  const speedsRef     = useRef<number[]>([]);
  const leftIdxRef    = useRef<number[]>([]);
  const rightIdxRef   = useRef<number[]>([]);

  const stopAnimation = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const resetAnimation = useCallback(() => {
    stopAnimation();
    coordsRef.current   = [];
    branchesRef.current = [];
    speedsRef.current   = [];
    leftIdxRef.current  = [];
    rightIdxRef.current = [];
    setAnimState(INITIAL_STATE);
  }, [stopAnimation]);

  const startAnimation = useCallback((coords: LatLng[]) => {
    stopAnimation();
    if (!coords || coords.length < 2) return;

    const n       = coords.length;
    const base    = adaptiveSpeed(n);
    const speeds  = branchSpeeds(base, NUM_BRANCHES);
    const branches = generateBranches(coords, NUM_BRANCHES);

    coordsRef.current   = coords;
    branchesRef.current = branches;
    speedsRef.current   = speeds;
    leftIdxRef.current  = Array(NUM_BRANCHES).fill(0);
    rightIdxRef.current = Array(NUM_BRANCHES).fill(n - 1);

    // ── Convergence animation ──────────────────────────────────────────────
    const runConvergence = (
      frozenLeft: LatLng[][],
      frozenRight: LatLng[][],
      meetPt: LatLng,
      fullCoords: LatLng[]
    ) => {
      let convProgress = 0;

      const convTick = () => {
        convProgress += CONVERGENCE_STEP;
        const done = convProgress >= 1;

        setAnimState({
          phase: done ? 'complete' : 'converging',
          leftBranches:  done ? [] : frozenLeft,
          rightBranches: done ? [] : frozenRight,
          finalRoute: fullCoords,
          meetingPoint: meetPt,
          convergenceProgress: Math.min(convProgress, 1),
          isComplete: done,
          progress: 1,
        });

        if (!done) {
          rafRef.current = requestAnimationFrame(convTick);
        }
      };

      rafRef.current = requestAnimationFrame(convTick);
    };

    // ── Explore tick ───────────────────────────────────────────────────────
    const tick = () => {
      const newLeft  = leftIdxRef.current.map((idx, i) =>
        Math.min(idx + speedsRef.current[i], n - 1)
      );
      const newRight = rightIdxRef.current.map((idx, i) =>
        Math.max(idx - speedsRef.current[i], 0)
      );

      leftIdxRef.current  = newLeft;
      rightIdxRef.current = newRight;

      const leftFront  = Math.max(...newLeft);
      const rightFront = Math.min(...newRight);

      // Slice each branch to current frontier
      const leftBranches  = branchesRef.current.map((b, i) => b.slice(0, newLeft[i]  + 1));
      const rightBranches = branchesRef.current.map((b, i) => b.slice(newRight[i]));

      if (leftFront >= rightFront) {
        // ── Fronts met — kick off convergence ─────────────────────────────
        const meetIdx = Math.min(Math.floor((leftFront + rightFront) / 2), n - 1);
        const meetPt  = coordsRef.current[meetIdx];

        // Show fully-extended branches for first convergence frame
        setAnimState({
          phase: 'converging',
          leftBranches,
          rightBranches,
          finalRoute: coordsRef.current,
          meetingPoint: meetPt,
          convergenceProgress: 0,
          isComplete: false,
          progress: 1,
        });

        runConvergence(leftBranches, rightBranches, meetPt, coordsRef.current);
        return;
      }

      const progress = Math.min(leftFront / Math.max(n / 2, 1), 0.99);

      setAnimState({
        phase: 'exploring',
        leftBranches,
        rightBranches,
        finalRoute: [],
        meetingPoint: null,
        convergenceProgress: 0,
        isComplete: false,
        progress,
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [stopAnimation]);

  useEffect(() => () => stopAnimation(), [stopAnimation]);

  return { animState, startAnimation, stopAnimation, resetAnimation };
}
