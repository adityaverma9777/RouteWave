// ─── API Config ───────────────────────────────────────────────────────────────
// In production, requests go to the same origin (backend serves frontend).
// In dev, Vite proxies /api → localhost:7860.
export const API_BASE = import.meta.env.VITE_API_URL || '';

// ─── Map Config ───────────────────────────────────────────────────────────────
export const MAP_CONFIG = {
  defaultCenter: [48.8566, 2.3522] as [number, number], // Paris — central for demo
  defaultZoom: 5,
  minZoom: 2,
  maxZoom: 18,
  tileUrl: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  tileAttribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
};

// ─── Animation Config ────────────────────────────────────────────────────────
export const ANIMATION_CONFIG = {
  speed: 4,          // coords revealed per rAF frame
  frameRate: 60,     // target FPS
};
