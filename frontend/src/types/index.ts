// ─── App State ────────────────────────────────────────────────────────────────
export type AppState =
  | 'idle'
  | 'selecting_start'
  | 'selecting_end'
  | 'searching'
  | 'animating'
  | 'complete'
  | 'error';

// ─── Coordinates ─────────────────────────────────────────────────────────────
export type LatLng = [number, number]; // [lat, lng]

// ─── Route Data ───────────────────────────────────────────────────────────────
export interface RouteData {
  geometry: LatLng[];
  distance: number;   // meters
  duration: number;   // seconds
  crossesBorder: boolean;
  countries: string[];
}

// ─── Route Request/Response ───────────────────────────────────────────────────
export interface RouteRequest {
  start: LatLng;
  end: LatLng;
}

export interface RouteError {
  message: string;
  code: 'NO_ROUTE' | 'SERVICE_ERROR' | 'NETWORK_ERROR' | 'INVALID_INPUT';
}

// ─── Animation State ─────────────────────────────────────────────────────────
export interface AnimationState {
  leftCoords: LatLng[];
  rightCoords: LatLng[];
  isComplete: boolean;
  progress: number; // 0–1
}

// ─── Marker ───────────────────────────────────────────────────────────────────
export type MarkerType = 'start' | 'end';
