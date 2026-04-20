import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { LatLng, AppState, RouteData, AnimationState } from '../types';
import { MAP_CONFIG } from '../utils/config';
import WaveAnimation from './WaveAnimation';
import RoutePolyline from './RoutePolyline';

// Fix Leaflet default icon path issue with Vite
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ─── Custom Icons ─────────────────────────────────────────────────────────────
const startIcon = L.divIcon({
  className: '',
  html: `<div class="map-marker map-marker--start">
    <div class="map-marker__pin"></div>
    <div class="map-marker__pulse"></div>
  </div>`,
  iconSize: [32, 40],
  iconAnchor: [16, 40],
});

const endIcon = L.divIcon({
  className: '',
  html: `<div class="map-marker map-marker--end">
    <div class="map-marker__pin"></div>
    <div class="map-marker__pulse"></div>
  </div>`,
  iconSize: [32, 40],
  iconAnchor: [16, 40],
});

// ─── Click Handler ────────────────────────────────────────────────────────────
interface MapClickHandlerProps {
  appState: AppState;
  onMapClick: (latlng: LatLng) => void;
}

const MapClickHandler: React.FC<MapClickHandlerProps> = ({ appState, onMapClick }) => {
  const blockingStates: AppState[] = ['searching', 'animating'];

  useMapEvents({
    click(e) {
      if (blockingStates.includes(appState)) return;
      onMapClick([e.latlng.lat, e.latlng.lng]);
    },
  });

  return null;
};

// ─── Main Map Component ───────────────────────────────────────────────────────
interface MapViewProps {
  appState: AppState;
  startPoint: LatLng | null;
  endPoint: LatLng | null;
  routeData: RouteData | null;
  animState: AnimationState;
  onMapClick: (latlng: LatLng) => void;
}

const MapView: React.FC<MapViewProps> = ({
  appState,
  startPoint,
  endPoint,
  routeData,
  animState,
  onMapClick,
}) => {
  const isComplete = appState === 'complete';
  const isAnimating = appState === 'animating';

  const getCursor = () => {
    if (appState === 'searching' || appState === 'animating') return 'wait';
    if (appState === 'selecting_end' || appState === 'selecting_start' || appState === 'idle') return 'crosshair';
    return 'default';
  };

  return (
    <MapContainer
      center={MAP_CONFIG.defaultCenter}
      zoom={MAP_CONFIG.defaultZoom}
      minZoom={MAP_CONFIG.minZoom}
      maxZoom={MAP_CONFIG.maxZoom}
      style={{ height: '100%', width: '100%', cursor: getCursor() }}
      zoomControl={false}
      attributionControl={true}
    >
      {/* Dark tile layer */}
      <TileLayer
        url={MAP_CONFIG.tileUrl}
        attribution={MAP_CONFIG.tileAttribution}
        maxZoom={MAP_CONFIG.maxZoom}
      />

      {/* Click events */}
      <MapClickHandler appState={appState} onMapClick={onMapClick} />

      {/* Start marker */}
      {startPoint && (
        <Marker position={startPoint} icon={startIcon} />
      )}

      {/* End marker */}
      {endPoint && (
        <Marker position={endPoint} icon={endIcon} />
      )}

      {/* Wave animation (during animating state) */}
      {isAnimating && !animState.isComplete && (
        <WaveAnimation
          leftCoords={animState.leftCoords}
          rightCoords={animState.rightCoords}
          isComplete={animState.isComplete}
        />
      )}

      {/* Final route (after animation completes) */}
      {isComplete && routeData && (
        <RoutePolyline coords={routeData.geometry} />
      )}
    </MapContainer>
  );
};

export default MapView;
