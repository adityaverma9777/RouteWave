import axios, { AxiosError } from 'axios';
import { OSRMResponse, OSRMRoute } from '../middleware/validate';
import { logger } from '../middleware/logger';

const OSRM_URL = process.env.OSRM_URL || 'http://localhost:5001';
const OSRM_FALLBACK_URL = 'https://router.project-osrm.org';

async function queryOSRM(baseUrl: string, startLng: number, startLat: number, endLng: number, endLat: number): Promise<OSRMRoute> {
  const url = `${baseUrl}/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=false`;
  
  const response = await axios.get<OSRMResponse>(url, { timeout: baseUrl === OSRM_FALLBACK_URL ? 30000 : 3000 });
  const data = response.data;

  if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
    throw new Error('OSRM returned no route');
  }

  return data.routes[0];
}

export async function getRoute(
  start: [number, number],
  end: [number, number]
): Promise<{ geometry: [number, number][]; distance: number; duration: number }> {
  const [startLat, startLng] = start;
  const [endLat, endLng] = end;

  let route: OSRMRoute;

  // Try local OSRM first, fall back to public demo
  try {
    logger.info({ osrm: OSRM_URL }, 'querying local OSRM');
    route = await queryOSRM(OSRM_URL, startLng, startLat, endLng, endLat);
    logger.info('local OSRM responded successfully');
  } catch (localErr) {
    logger.warn({ err: (localErr as Error).message }, 'local OSRM failed, trying public fallback');
    try {
      route = await queryOSRM(OSRM_FALLBACK_URL, startLng, startLat, endLng, endLat);
      logger.info('public OSRM fallback responded successfully');
    } catch (fallbackErr) {
      const axErr = fallbackErr as AxiosError;
      logger.error({ err: axErr.message }, 'all OSRM sources failed');
      throw new Error('No route available between these points');
    }
  }

  // Convert OSRM [lng, lat] → our [lat, lng] convention
  const geometry: [number, number][] = route.geometry.coordinates.map(
    ([lng, lat]) => [lat, lng]
  );

  return {
    geometry,
    distance: Math.round(route.distance),
    duration: Math.round(route.duration),
  };
}
