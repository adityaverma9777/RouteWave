import React from 'react';
import { Polyline } from 'react-leaflet';
import type { LatLng } from '../types';

interface RoutePolylineProps {
  coords: LatLng[];
}

const RoutePolyline: React.FC<RoutePolylineProps> = ({ coords }) => {
  if (!coords || coords.length < 2) return null;

  return (
    <>
      {/* Outer glow layer */}
      <Polyline
        positions={coords}
        pathOptions={{
          color: '#3B82F6',
          weight: 12,
          opacity: 0.18,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />
      {/* Mid glow layer */}
      <Polyline
        positions={coords}
        pathOptions={{
          color: '#60A5FA',
          weight: 7,
          opacity: 0.45,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />
      {/* Core route line */}
      <Polyline
        positions={coords}
        pathOptions={{
          color: '#93C5FD',
          weight: 4,
          opacity: 1,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />
    </>
  );
};

export default RoutePolyline;
