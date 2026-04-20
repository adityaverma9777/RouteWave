import React, { useMemo } from 'react';
import { Polyline, CircleMarker } from 'react-leaflet';
import type { AnimationState, LatLng } from '../types';

// ─── Color palettes ───────────────────────────────────────────────────────────
// Blue family for the start-side wave (warm → cool spectrum)
const LEFT_COLORS  = ['#3B82F6', '#60A5FA', '#1D4ED8', '#93C5FD', '#1E40AF'];
// Cyan family for the end-side wave
const RIGHT_COLORS = ['#06B6D4', '#22D3EE', '#0891B2', '#67E8F9', '#155E75'];

// ─── Per-branch visual weight (main branch heavier, outer ones lighter) ───────
function branchLineWeight(idx: number): number {
  return idx === 0 ? 5 : idx === 1 ? 3.5 : 2.5;
}
function branchLineOpacity(idx: number, total: number, globalAlpha: number): number {
  const base = idx === 0 ? 0.92 : Math.max(0.25, 0.72 - idx * 0.1);
  return base * globalAlpha;
}

// ─── Reveal route from its midpoint outward ───────────────────────────────────
function revealFromMid(coords: LatLng[], progress: number): { left: LatLng[]; right: LatLng[] } {
  if (!coords.length || progress <= 0) return { left: [], right: [] };
  const mid     = Math.floor(coords.length / 2);
  const leftLen  = Math.floor(mid * Math.min(progress, 1));
  const rightLen = Math.floor((coords.length - mid) * Math.min(progress, 1));
  return {
    left:  coords.slice(Math.max(0, mid - leftLen), mid + 1),
    right: coords.slice(mid, Math.min(coords.length, mid + rightLen + 1)),
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
interface WaveAnimationProps {
  animState: AnimationState;
}

const WaveAnimation: React.FC<WaveAnimationProps> = ({ animState }) => {
  const {
    phase,
    leftBranches,
    rightBranches,
    finalRoute,
    meetingPoint,
    convergenceProgress,
  } = animState;

  // ── All hook calls MUST be before any early return (Rules of Hooks) ──────
  const branchAlpha = phase === 'converging'
    ? Math.max(0, 1 - convergenceProgress * 3)
    : 1;

  const routeRevealProg = phase === 'converging'
    ? Math.max(0, (convergenceProgress - 0.25) / 0.75)
    : 0;

  const revealed = useMemo(
    () => revealFromMid(finalRoute, routeRevealProg),
    [finalRoute, routeRevealProg]
  );

  const flashAlpha = phase === 'converging' && convergenceProgress < 0.35
    ? Math.max(0, 0.85 - convergenceProgress * 2.8)
    : 0;
  const flashRadius = 14 + convergenceProgress * 90;

  // ── Early exit — nothing to render in these phases ──────────────────────
  if (phase === 'idle' || phase === 'complete') return null;

  return (
    <>
      {/* ════ LEFT BRANCHES (from start, blue) ════ */}
      {leftBranches.map((branch, i) =>
        branch.length > 1 ? (
          <Polyline
            key={`lb-${i}`}
            positions={branch}
            pathOptions={{
              color:   LEFT_COLORS[i % LEFT_COLORS.length],
              weight:  branchLineWeight(i),
              opacity: branchLineOpacity(i, leftBranches.length, branchAlpha),
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        ) : null
      )}

      {/* ════ RIGHT BRANCHES (from end, cyan) ════ */}
      {rightBranches.map((branch, i) =>
        branch.length > 1 ? (
          <Polyline
            key={`rb-${i}`}
            positions={branch}
            pathOptions={{
              color:   RIGHT_COLORS[i % RIGHT_COLORS.length],
              weight:  branchLineWeight(i),
              opacity: branchLineOpacity(i, rightBranches.length, branchAlpha),
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        ) : null
      )}

      {/* ════ WAVE TIPS (exploring only) ════ */}
      {phase === 'exploring' && (() => {
        return (
          <>
            {/* All left branch tips */}
            {leftBranches.map((b, i) => {
              const tip = b[b.length - 1];
              if (!tip) return null;
              return (
                <React.Fragment key={`lt-${i}`}>
                  {i === 0 && (
                    // Pulsing halo only on main branch
                    <CircleMarker center={tip} radius={18} pathOptions={{
                      color: '#3B82F6', fillColor: '#3B82F6',
                      fillOpacity: 0.12, weight: 1, opacity: 0.4,
                    }} />
                  )}
                  <CircleMarker center={tip} radius={i === 0 ? 5 : 3} pathOptions={{
                    color: '#FFFFFF',
                    fillColor: LEFT_COLORS[i % LEFT_COLORS.length],
                    fillOpacity: 1,
                    weight: i === 0 ? 2 : 1,
                    opacity: 1,
                  }} />
                </React.Fragment>
              );
            })}
            {/* All right branch tips */}
            {rightBranches.map((b, i) => {
              const tip = b[0];
              if (!tip) return null;
              return (
                <React.Fragment key={`rt-${i}`}>
                  {i === 0 && (
                    <CircleMarker center={tip} radius={18} pathOptions={{
                      color: '#06B6D4', fillColor: '#06B6D4',
                      fillOpacity: 0.12, weight: 1, opacity: 0.4,
                    }} />
                  )}
                  <CircleMarker center={tip} radius={i === 0 ? 5 : 3} pathOptions={{
                    color: '#FFFFFF',
                    fillColor: RIGHT_COLORS[i % RIGHT_COLORS.length],
                    fillOpacity: 1,
                    weight: i === 0 ? 2 : 1,
                    opacity: 1,
                  }} />
                </React.Fragment>
              );
            })}
          </>
        );
      })()}

      {/* ════ COLLISION FLASH ════ */}
      {meetingPoint && flashAlpha > 0 && (
        <>
          {/* Outer expanding ring */}
          <CircleMarker
            center={meetingPoint}
            radius={flashRadius}
            pathOptions={{
              color: '#FFFFFF', fillColor: '#FFFFFF',
              fillOpacity: flashAlpha * 0.25,
              weight: 2, opacity: flashAlpha,
            }}
          />
          {/* Inner bright core */}
          <CircleMarker
            center={meetingPoint}
            radius={8}
            pathOptions={{
              color: '#FFFFFF', fillColor: '#FDE047',
              fillOpacity: flashAlpha,
              weight: 0, opacity: 0,
            }}
          />
        </>
      )}

      {/* ════ OPTIMAL ROUTE REVEAL (center → outward) ════ */}
      {routeRevealProg > 0 && (
        <>
          {/* Glow backing — left side */}
          {revealed.left.length > 1 && (
            <Polyline positions={revealed.left} pathOptions={{
              color: '#3B82F6', weight: 16,
              opacity: 0.18 * routeRevealProg,
              lineCap: 'round', lineJoin: 'round',
            }} />
          )}
          {/* Glow backing — right side */}
          {revealed.right.length > 1 && (
            <Polyline positions={revealed.right} pathOptions={{
              color: '#06B6D4', weight: 16,
              opacity: 0.18 * routeRevealProg,
              lineCap: 'round', lineJoin: 'round',
            }} />
          )}
          {/* Mid glow — left */}
          {revealed.left.length > 1 && (
            <Polyline positions={revealed.left} pathOptions={{
              color: '#60A5FA', weight: 8,
              opacity: 0.4 * routeRevealProg,
              lineCap: 'round', lineJoin: 'round',
            }} />
          )}
          {/* Mid glow — right */}
          {revealed.right.length > 1 && (
            <Polyline positions={revealed.right} pathOptions={{
              color: '#22D3EE', weight: 8,
              opacity: 0.4 * routeRevealProg,
              lineCap: 'round', lineJoin: 'round',
            }} />
          )}
          {/* Core line — left */}
          {revealed.left.length > 1 && (
            <Polyline positions={revealed.left} pathOptions={{
              color: '#BAE6FD', weight: 4,
              opacity: routeRevealProg,
              lineCap: 'round', lineJoin: 'round',
            }} />
          )}
          {/* Core line — right */}
          {revealed.right.length > 1 && (
            <Polyline positions={revealed.right} pathOptions={{
              color: '#A5F3FC', weight: 4,
              opacity: routeRevealProg,
              lineCap: 'round', lineJoin: 'round',
            }} />
          )}
        </>
      )}
    </>
  );
};

export default WaveAnimation;
