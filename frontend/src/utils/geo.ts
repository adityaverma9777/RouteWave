import type { LatLng } from '../types';

// ─── Formatting ───────────────────────────────────────────────────────────────
export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);

  if (h > 0) {
    return `${h}h ${m}m`;
  }
  return `${m} min`;
}

export function formatCoord(coord: LatLng): string {
  const [lat, lng] = coord;
  const latStr = `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? 'N' : 'S'}`;
  const lngStr = `${Math.abs(lng).toFixed(4)}°${lng >= 0 ? 'E' : 'W'}`;
  return `${latStr}, ${lngStr}`;
}

// ─── Country Names ────────────────────────────────────────────────────────────
const COUNTRY_NAMES: Record<string, string> = {
  AD: 'Andorra', AE: 'UAE', AF: 'Afghanistan', AL: 'Albania', AM: 'Armenia',
  AT: 'Austria', AU: 'Australia', AZ: 'Azerbaijan', BA: 'Bosnia', BE: 'Belgium',
  BG: 'Bulgaria', BY: 'Belarus', CH: 'Switzerland', CY: 'Cyprus', CZ: 'Czechia',
  DE: 'Germany', DK: 'Denmark', EE: 'Estonia', ES: 'Spain', FI: 'Finland',
  FR: 'France', GB: 'UK', GE: 'Georgia', GR: 'Greece', HR: 'Croatia',
  HU: 'Hungary', IE: 'Ireland', IL: 'Israel', IN: 'India', IS: 'Iceland',
  IT: 'Italy', JP: 'Japan', KZ: 'Kazakhstan', LI: 'Liechtenstein', LT: 'Lithuania',
  LU: 'Luxembourg', LV: 'Latvia', MC: 'Monaco', MD: 'Moldova', ME: 'Montenegro',
  MK: 'N. Macedonia', MT: 'Malta', NL: 'Netherlands', 'NO': 'Norway', PL: 'Poland',
  PT: 'Portugal', RO: 'Romania', RS: 'Serbia', RU: 'Russia', SE: 'Sweden',
  SI: 'Slovenia', SK: 'Slovakia', SM: 'San Marino', TR: 'Turkey', UA: 'Ukraine',
  US: 'United States', VA: 'Vatican', XK: 'Kosovo',
};

export function getCountryName(iso: string): string {
  return COUNTRY_NAMES[iso] ?? iso;
}

// ─── Interpolation ────────────────────────────────────────────────────────────
/** Linearly interpolate between two coords */
export function interpolate(a: LatLng, b: LatLng, t: number): LatLng {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}
