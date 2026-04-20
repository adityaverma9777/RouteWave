import React from 'react';
import type { AppState } from '../types';

const STATE_CONFIG: Record<AppState, { label: string; color: string; icon: string; pulse: boolean }> = {
  idle:             { label: 'Ready',         color: '#6B7280', icon: '◉', pulse: false },
  selecting_start:  { label: 'Pick Start',    color: '#10B981', icon: '⊕', pulse: true  },
  selecting_end:    { label: 'Pick End',      color: '#F59E0B', icon: '⊕', pulse: true  },
  searching:        { label: 'Computing...',  color: '#3B82F6', icon: '⟳', pulse: true  },
  animating:        { label: 'Searching...',  color: '#8B5CF6', icon: '⟿', pulse: true  },
  complete:         { label: 'Route Found',   color: '#10B981', icon: '✓', pulse: false },
  error:            { label: 'No Route',      color: '#EF4444', icon: '✕', pulse: false },
};

interface StatusBadgeProps {
  state: AppState;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ state }) => {
  const config = STATE_CONFIG[state];

  return (
    <div className={`status-badge ${config.pulse ? 'status-badge--pulse' : ''}`}
         style={{ '--badge-color': config.color } as React.CSSProperties}>
      <span className="status-badge__icon"
            style={{ animation: state === 'searching' ? 'spin 1s linear infinite' : undefined }}>
        {config.icon}
      </span>
      <span className="status-badge__label">{config.label}</span>
    </div>
  );
};

export default StatusBadge;
