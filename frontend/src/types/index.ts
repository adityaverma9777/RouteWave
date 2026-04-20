
export type AppState =
  | 'idle'
  | 'selecting_start'
  | 'selecting_end'
  | 'searching'
  | 'animating'
  | 'complete'
  | 'error';

export type LatLng = [number, number]; // [lat, lng]

export interface RouteData {
  geometry: LatLng[];
  distance: number;   // meters
  duration: number;   // seconds
  crossesBorder: boolean;
  countries: string[];
}

export interface RouteRequest {
  start: LatLng;
  end: LatLng;
}

export interface RouteError {
  message: string;
  code: 'NO_ROUTE' | 'SERVICE_ERROR' | 'NETWORK_ERROR' | 'INVALID_INPUT';
}

export type AnimPhase = 'idle' | 'exploring' | 'converging' | 'complete';

export interface AnimationState {
  phase: AnimPhase;
  /** Sliced branches from the start side (blue) */
  leftBranches: LatLng[][];
  /** Sliced branches from the end side (cyan) */
  rightBranches: LatLng[][];
  /** Full route coords — available during converging & complete */
  finalRoute: LatLng[];
  /** Approx coordinate where the two fronts met */
  meetingPoint: LatLng | null;
  /** 0→1 progress of the convergence flash animation */
  convergenceProgress: number;
  isComplete: boolean;
  /** 0→1 overall progress (for progress bar in panel) */
  progress: number;
}

export type MarkerType = 'start' | 'end';
