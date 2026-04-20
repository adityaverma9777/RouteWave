import React from 'react';
import { Polyline, CircleMarker } from 'react-leaflet';
import type { LatLng } from '../types';

interface WaveAnimationProps {
  leftCoords: LatLng[];
  rightCoords: LatLng[];
  isComplete: boolean;
}

const WaveAnimation: React.FC<WaveAnimationProps> = ({
  leftCoords,
  rightCoords,
  isComplete,
}) => {
  if (isComplete || (leftCoords.length === 0 && rightCoords.length === 0)) {
    return null;
  }

  const leftTip = leftCoords.length > 0 ? leftCoords[leftCoords.length - 1] : null;
  const rightTip = rightCoords.length > 0 ? rightCoords[0] : null;

  return (
    <>
      {/* Forward wave (blue, from start) */}
      {leftCoords.length > 1 && (
        <Polyline
          positions={leftCoords}
          pathOptions={{
            color: '#3B82F6',
            weight: 5,
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
      )}

      {/* Reverse wave (cyan, from end) */}
      {rightCoords.length > 1 && (
        <Polyline
          positions={rightCoords}
          pathOptions={{
            color: '#06B6D4',
            weight: 5,
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
      )}

      {/* Wave tip pulse — blue (start side) */}
      {leftTip && (
        <>
          <CircleMarker
            center={leftTip}
            radius={10}
            pathOptions={{
              color: '#3B82F6',
              fillColor: '#3B82F6',
              fillOpacity: 0.25,
              weight: 2,
              opacity: 0.6,
            }}
          />
          <CircleMarker
            center={leftTip}
            radius={5}
            pathOptions={{
              color: '#FFFFFF',
              fillColor: '#3B82F6',
              fillOpacity: 1,
              weight: 2,
            }}
          />
        </>
      )}

      {/* Wave tip pulse — cyan (end side) */}
      {rightTip && (
        <>
          <CircleMarker
            center={rightTip}
            radius={10}
            pathOptions={{
              color: '#06B6D4',
              fillColor: '#06B6D4',
              fillOpacity: 0.25,
              weight: 2,
              opacity: 0.6,
            }}
          />
          <CircleMarker
            center={rightTip}
            radius={5}
            pathOptions={{
              color: '#FFFFFF',
              fillColor: '#06B6D4',
              fillOpacity: 1,
              weight: 2,
            }}
          />
        </>
      )}
    </>
  );
};

export default WaveAnimation;
