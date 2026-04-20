import React from 'react';
import {
  Route, MapPin, RotateCcw, ArrowLeftRight,
  Ruler, Clock, Navigation, AlertCircle, Zap,
} from 'lucide-react';
import type { AppState, LatLng, RouteData } from '../types';
import { formatDistance, formatDuration, formatCoord } from '../utils/geo';
import StatusBadge from './StatusBadge';
import BorderBadge from './BorderBadge';

interface ControlPanelProps {
  appState:     AppState;
  startPoint:   LatLng | null;
  endPoint:     LatLng | null;
  routeData:    RouteData | null;
  errorMessage: string | null;
  onReset:      () => void;
  onSwap:       () => void;
  animProgress: number;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  appState, startPoint, endPoint, routeData,
  errorMessage, onReset, onSwap, animProgress,
}) => {
  const isComplete  = appState === 'complete';
  const isAnimating = appState === 'animating';
  const isSearching = appState === 'searching';
  const isError     = appState === 'error';
  const hasPoints   = startPoint !== null;

  return (
    <div className="control-panel">
      {/* Gradient accent bar */}
      <div className="control-panel__accent" />

      <div className="control-panel__body">

        {/* ── Header ───────────────────────────────────────── */}
        <div className="control-panel__header">
          <div className="control-panel__logo">
            <div className="control-panel__logo-icon">
              <Route size={18} strokeWidth={2.2} />
            </div>
            <div>
              <div className="control-panel__logo-text">RouteWave</div>
              <div className="control-panel__logo-sub">Visual pathfinding</div>
            </div>
          </div>
          <StatusBadge state={appState} />
        </div>

        {/* ── Contextual hint ───────────────────────────────── */}
        {appState === 'idle' && (
          <div className="control-panel__hint">
            <MapPin size={14} className="control-panel__hint-icon" />
            Click anywhere on the map to set your <strong>&nbsp;start point</strong>
          </div>
        )}
        {appState === 'selecting_end' && (
          <div className="control-panel__hint">
            <Navigation size={14} className="control-panel__hint-icon" />
            Now click to set your <strong>&nbsp;destination</strong>
          </div>
        )}

        {/* ── Coordinates card ─────────────────────────────── */}
        {(startPoint || endPoint) && (
          <div className="coords-card">
            <div className="coord-row">
              <div className="coord-row__dot coord-row__dot--start" />
              <span className="coord-row__label">From</span>
              <span className="coord-row__value">
                {startPoint ? formatCoord(startPoint) : '—'}
              </span>
            </div>
            <div className="coord-row">
              <div className="coord-row__dot coord-row__dot--end" />
              <span className="coord-row__label">To</span>
              <span className="coord-row__value">
                {endPoint ? formatCoord(endPoint) : '—'}
              </span>
            </div>
          </div>
        )}

        {/* ── Radar spinner (searching) ─────────────────────── */}
        {isSearching && (
          <div className="radar-wrap">
            <div className="radar">
              <div className="radar__ring radar__ring--1" />
              <div className="radar__ring radar__ring--2" />
              <div className="radar__ring radar__ring--3" />
              <div className="radar__dot" />
            </div>
            <span className="radar__label">Computing optimal route…</span>
          </div>
        )}

        {/* ── Wave progress bar (animating) ────────────────── */}
        {isAnimating && (
          <div className="progress-section">
            <div className="progress-section__header">
              <span className="progress-section__label">
                <Zap size={12} />
                Bidirectional search
              </span>
              <span className="progress-section__pct">
                {Math.round(animProgress * 100)}%
              </span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${Math.round(animProgress * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Route stats ───────────────────────────────────── */}
        {routeData && isComplete && (
          <>
            <div className="stats-grid">
              <div className="stat-card stat-card--distance">
                <div className="stat-card__icon">
                  <Ruler size={17} />
                </div>
                <div className="stat-card__body">
                  <span className="stat-card__value">
                    {formatDistance(routeData.distance)}
                  </span>
                  <span className="stat-card__label">Distance</span>
                </div>
              </div>
              <div className="stat-card stat-card--time">
                <div className="stat-card__icon">
                  <Clock size={17} />
                </div>
                <div className="stat-card__body">
                  <span className="stat-card__value">
                    {formatDuration(routeData.duration)}
                  </span>
                  <span className="stat-card__label">Drive time</span>
                </div>
              </div>
            </div>

            {/* Border crossing info */}
            <BorderBadge
              crossesBorder={routeData.crossesBorder}
              countries={routeData.countries}
            />
          </>
        )}

        {/* ── Error ─────────────────────────────────────────── */}
        {isError && errorMessage && (
          <div className="error-box">
            <AlertCircle size={15} className="error-box__icon" />
            <span className="error-box__msg">{errorMessage}</span>
          </div>
        )}

        {/* ── Divider + actions ─────────────────────────────── */}
        {hasPoints && (
          <>
            <div className="control-panel__divider" />
            <div className="control-panel__actions">
              {startPoint && endPoint && (
                <button
                  id="btn-swap"
                  className="btn btn--secondary"
                  onClick={onSwap}
                  disabled={isSearching || isAnimating}
                  title="Swap start and end (Ctrl+S)"
                >
                  <ArrowLeftRight size={14} />
                  Swap
                </button>
              )}
              <button
                id="btn-reset"
                className="btn btn--danger"
                onClick={onReset}
                title="Clear and start over (Esc)"
              >
                <RotateCcw size={14} />
                Reset
              </button>
            </div>
          </>
        )}

        {/* ── Footer ────────────────────────────────────────── */}
        {(isComplete || appState === 'idle') && (
          <div className="control-panel__footer">
            {isComplete
              ? 'Click map to plan a new route'
              : 'Click two points to visualize a route'}
          </div>
        )}

      </div>
    </div>
  );
};

export default ControlPanel;
