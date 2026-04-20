import React from 'react';
import { Circle, MapPin, Loader2, Zap, CheckCircle2, XCircle } from 'lucide-react';
import type { AppState } from '../types';

interface StatusBadgeProps { state: AppState; }

const STATUS_CONFIG: Record<AppState, {
  label: string;
  className: string;
  icon: React.ReactNode;
}> = {
  idle: {
    label: 'Ready',
    className: 'status-badge status-badge--idle',
    icon: <Circle size={9} fill="currentColor" stroke="none" />,
  },
  selecting_start: {
    label: 'Pick start',
    className: 'status-badge status-badge--selecting',
    icon: <MapPin size={11} />,
  },
  selecting_end: {
    label: 'Pick end',
    className: 'status-badge status-badge--selecting',
    icon: <MapPin size={11} />,
  },
  searching: {
    label: 'Routing…',
    className: 'status-badge status-badge--searching',
    icon: <Loader2 size={11} className="status-badge__spinner" />,
  },
  animating: {
    label: 'Searching',
    className: 'status-badge status-badge--animating',
    icon: <Zap size={11} />,
  },
  complete: {
    label: 'Found',
    className: 'status-badge status-badge--complete',
    icon: <CheckCircle2 size={11} />,
  },
  error: {
    label: 'No route',
    className: 'status-badge status-badge--error',
    icon: <XCircle size={11} />,
  },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ state }) => {
  const cfg = STATUS_CONFIG[state];
  return (
    <span className={cfg.className}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

export default StatusBadge;
