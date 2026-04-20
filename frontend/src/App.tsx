import React, { useState, useCallback, useEffect } from 'react';
import MapView from './components/MapView';
import ControlPanel from './components/ControlPanel';
import { useRoute } from './hooks/useRoute';
import { useAnimation } from './hooks/useAnimation';
import type { AppState, LatLng } from './types';

const App: React.FC = () => {
  const [appState, setAppState]     = useState<AppState>('idle');
  const [startPoint, setStartPoint] = useState<LatLng | null>(null);
  const [endPoint, setEndPoint]     = useState<LatLng | null>(null);

  const { routeData, error, isLoading, fetchRoute, clearRoute } = useRoute();
  const { animState, startAnimation, resetAnimation } = useAnimation();

  // ─── Sync loading → state ────────────────────────────────────────────────
  useEffect(() => {
    if (isLoading) setAppState('searching');
  }, [isLoading]);

  // ─── When route arrives → start animation ────────────────────────────────
  useEffect(() => {
    if (routeData && appState === 'searching') {
      setAppState('animating');
      startAnimation(routeData.geometry);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeData]);

  // ─── When error arrives ───────────────────────────────────────────────────
  useEffect(() => {
    if (error) setAppState('error');
  }, [error]);

  // ─── When animation finishes ──────────────────────────────────────────────
  useEffect(() => {
    if (animState.isComplete && appState === 'animating') {
      setAppState('complete');
    }
  }, [animState.isComplete, appState]);

  // ─── Map click handler ────────────────────────────────────────────────────
  const handleMapClick = useCallback(async (latlng: LatLng) => {
    if (appState === 'complete' || appState === 'error') {
      // Any click after completion resets
      handleReset();
      return;
    }

    if (!startPoint) {
      setStartPoint(latlng);
      setAppState('selecting_end');
      return;
    }

    if (!endPoint) {
      setEndPoint(latlng);
      // Trigger route computation
      await fetchRoute(startPoint, latlng);
      return;
    }

    // Third click → reset
    handleReset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState, startPoint, endPoint, fetchRoute]);

  // ─── Reset ───────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setAppState('idle');
    setStartPoint(null);
    setEndPoint(null);
    clearRoute();
    resetAnimation();
  }, [clearRoute, resetAnimation]);

  // ─── Swap ────────────────────────────────────────────────────────────────
  const handleSwap = useCallback(async () => {
    if (!startPoint || !endPoint) return;
    const newStart = endPoint;
    const newEnd   = startPoint;
    setStartPoint(newStart);
    setEndPoint(newEnd);
    clearRoute();
    resetAnimation();
    await fetchRoute(newStart, newEnd);
  }, [startPoint, endPoint, clearRoute, resetAnimation, fetchRoute]);

  // ─── Keyboard shortcuts ──────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleReset();
      if (e.key === 's' && e.ctrlKey) { e.preventDefault(); handleSwap(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleReset, handleSwap]);

  return (
    <div className="app">
      {/* Full-screen map */}
      <MapView
        appState={appState}
        startPoint={startPoint}
        endPoint={endPoint}
        routeData={routeData}
        animState={animState}
        onMapClick={handleMapClick}
      />

      {/* Glassmorphism control panel */}
      <ControlPanel
        appState={appState}
        startPoint={startPoint}
        endPoint={endPoint}
        routeData={routeData}
        errorMessage={error?.message ?? null}
        onReset={handleReset}
        onSwap={handleSwap}
        animProgress={animState.progress}
      />

      {/* Keyboard shortcut hint */}
      <div className="keyboard-hint">
        <kbd>Esc</kbd> reset &nbsp;·&nbsp; <kbd>Ctrl+S</kbd> swap
      </div>
    </div>
  );
};

export default App;
