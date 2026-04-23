import axios, { AxiosError } from 'axios';
import { OSRMResponse, OSRMRoute } from '../middleware/validate';
import { logger } from '../middleware/logger';

const OSRM_URL = process.env.OSRM_URL || 'http://localhost:5001';
const OSRM_FALLBACK_URL = 'https://router.project-osrm.org';

const LOCAL_COVERAGE = {
  minLat: 49.44,
  maxLat: 50.19,
  minLng: 5.73,
  maxLng: 6.53,
};

function isWithinLocalCoverage(lat: number, lng: number): boolean {
  return (
    lat >= LOCAL_COVERAGE.minLat &&
    lat <= LOCAL_COVERAGE.maxLat &&
    lng >= LOCAL_COVERAGE.minLng &&
    lng <= LOCAL_COVERAGE.maxLng
  );
}

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

  const bothInLocal = isWithinLocalCoverage(startLat, startLng) && isWithinLocalCoverage(endLat, endLng);

  if (bothInLocal) {
    try {
      logger.info({ osrm: OSRM_URL }, 'both points within local coverage, querying local OSRM');
      route = await queryOSRM(OSRM_URL, startLng, startLat, endLng, endLat);
      logger.info('local OSRM responded successfully');
    } catch (localErr) {
      logger.warn({ err: (localErr as Error).message }, 'local OSRM failed, trying public fallback');
      route = await queryPublicFallback(startLng, startLat, endLng, endLat);
    }
  } else {
    logger.info('points outside local OSRM coverage, using public server directly');
    route = await queryPublicFallback(startLng, startLat, endLng, endLat);
  }

  const geometry: [number, number][] = route.geometry.coordinates.map(
    ([lng, lat]) => [lat, lng]
  );

  return {
    geometry,
    distance: Math.round(route.distance),
    duration: Math.round(route.duration),
  };
}

async function queryPublicFallback(startLng: number, startLat: number, endLng: number, endLat: number): Promise<OSRMRoute> {
  try {
    const route = await queryOSRM(OSRM_FALLBACK_URL, startLng, startLat, endLng, endLat);
    logger.info('public OSRM fallback responded successfully');
    return route;
  } catch (fallbackErr) {
    const axErr = fallbackErr as AxiosError;
    logger.error({ err: axErr.message }, 'public OSRM fallback also failed');
    throw new Error('No route available between these points');
  }
}
