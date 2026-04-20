import React from 'react';
import { Polyline } from 'react-leaflet';
import type { LatLng } from '../types';

interface RoutePolylineProps { coords: LatLng[]; }

/**
 * Final optimal route — shown after convergence completes.
 * Three-layer look: wide soft glow → medium glow → crisp core.
 * Colors adjusted for visibility on the light Voyager map.
 */
const RoutePolyline: React.FC<RoutePolylineProps> = ({ coords }) => {
  if (!coords || coords.length < 2) return null;

  return (
    <>
      {/* Wide outer glow */}
      <Polyline
        positions={coords}
        pathOptions={{ color: '#1D4ED8', weight: 14, opacity: 0.12, lineCap: 'round', lineJoin: 'round' }}
      />
      {/* Mid glow */}
      <Polyline
        positions={coords}
        pathOptions={{ color: '#2563EB', weight: 8,  opacity: 0.35, lineCap: 'round', lineJoin: 'round' }}
      />
      {/* Crisp core */}
      <Polyline
        positions={coords}
        pathOptions={{ color: '#2563EB', weight: 4,  opacity: 1,    lineCap: 'round', lineJoin: 'round' }}
      />
    </>
  );
};

export default RoutePolyline;
