import React from 'react';
import type { AppState, LatLng, RouteData } from '../types';
import { formatDistance, formatDuration, formatCoord } from '../utils/geo';
import StatusBadge from './StatusBadge';
import BorderBadge from './BorderBadge';

interface ControlPanelProps {
  appState: AppState;
  startPoint: LatLng | null;
  endPoint: LatLng | null;
  routeData: RouteData | null;
  errorMessage: string | null;
  onReset: () => void;
  onSwap: () => void;
  animProgress: number;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  appState,
  startPoint,
  endPoint,
  routeData,
  errorMessage,
  onReset,
  onSwap,
  animProgress,
}) => {
  const isComplete = appState === 'complete';
  const isAnimating = appState === 'animating';
  const isSearching = appState === 'searching';
  const isError = appState === 'error';
  const hasPoints = startPoint !== null;

  return (
    <div className="control-panel">

      <div className="control-panel__header">
        <div className="control-panel__logo">
          <span className="control-panel__logo-icon">🌊</span>
          <span className="control-panel__logo-text">RouteWave</span>
        </div>
        <StatusBadge state={appState} />
      </div>


      {appState === 'idle' && (
        <p className="control-panel__hint">Click anywhere on the map to set your <strong>start point</strong></p>
      )}
      {appState === 'selecting_start' && (
        <p className="control-panel__hint">Click to place your <strong>start point</strong></p>
      )}
      {appState === 'selecting_end' && (
        <p className="control-panel__hint">Now click to place your <strong>end point</strong></p>
      )}


      {(startPoint || endPoint) && (
        <div className="control-panel__coords">
          <div className="coord-row">
            <span className="coord-row__label coord-row__label--start">▶ Start</span>
            <span className="coord-row__value">
              {startPoint ? formatCoord(startPoint) : '—'}
            </span>
          </div>
          <div className="coord-row">
            <span className="coord-row__label coord-row__label--end">⬛ End</span>
            <span className="coord-row__value">
              {endPoint ? formatCoord(endPoint) : '—'}
            </span>
          </div>
        </div>
      )}


      {isAnimating && (
        <div className="progress-bar">
          <div className="progress-bar__label">Bidirectional search</div>
          <div className="progress-bar__track">
            <div
              className="progress-bar__fill"
              style={{ width: `${Math.round(animProgress * 100)}%` }}
            />
          </div>
          <div className="progress-bar__pct">{Math.round(animProgress * 100)}%</div>
        </div>
      )}


      {isSearching && (
        <div className="radar-wrap">
          <div className="radar">
            <div className="radar__ring radar__ring--1" />
            <div className="radar__ring radar__ring--2" />
            <div className="radar__ring radar__ring--3" />
            <div className="radar__dot" />
          </div>
          <span className="radar__label">Computing optimal route...</span>
        </div>
      )}


      {routeData && isComplete && (
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-card__icon">📏</span>
            <span className="stat-card__value">{formatDistance(routeData.distance)}</span>
            <span className="stat-card__label">Distance</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__icon">⏱</span>
            <span className="stat-card__value">{formatDuration(routeData.duration)}</span>
            <span className="stat-card__label">Drive time</span>
          </div>
        </div>
      )}


      {routeData && isComplete && (
        <BorderBadge
          crossesBorder={routeData.crossesBorder}
          countries={routeData.countries}
        />
      )}


      {isError && errorMessage && (
        <div className="error-box">
          <span className="error-box__icon">⚠️</span>
          <span className="error-box__msg">{errorMessage}</span>
        </div>
      )}


      {hasPoints && (
        <div className="control-panel__actions">
          {startPoint && endPoint && (
            <button
              id="btn-swap"
              className="btn btn--secondary"
              onClick={onSwap}
              disabled={isSearching || isAnimating}
              title="Swap start and end points"
            >
              ⇅ Swap
            </button>
          )}
          <button
            id="btn-reset"
            className="btn btn--danger"
            onClick={onReset}
            title="Reset and start over"
          >
            ✕ Reset
          </button>
        </div>
      )}


      <div className="control-panel__footer">
        {isComplete
          ? 'Click anywhere on map to start a new route'
          : appState === 'idle'
            ? '3rd click resets the map'
            : ''}
      </div>
    </div>
  );
};

export default ControlPanel;
