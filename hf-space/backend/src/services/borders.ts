import fs from 'fs';
import path from 'path';
import { logger } from '../middleware/logger';


interface CountryFeature {
  type: 'Feature';
  properties: { 'ISO3166-1-Alpha-2': string; name: string };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

interface CountriesGeoJSON {
  type: 'FeatureCollection';
  features: CountryFeature[];
}

let countriesData: CountriesGeoJSON | null = null;

function loadBoundaries(): CountriesGeoJSON {
  if (countriesData) return countriesData;

  try {
    const dataPath = path.join(__dirname, '../../data/boundaries.geojson');
    const raw = fs.readFileSync(dataPath, 'utf-8');
    countriesData = JSON.parse(raw) as CountriesGeoJSON;
    logger.info({ features: countriesData.features.length }, 'loaded country boundaries');
  } catch (err) {
    logger.warn({ err }, 'could not load boundaries.geojson, border detection disabled');
    countriesData = { type: 'FeatureCollection', features: [] };
  }

  return countriesData;
}

function pointInPolygon(point: [number, number], polygon: number[][]): boolean {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }

  return inside;
}

function getCountryForPoint(lat: number, lng: number, boundaries: CountriesGeoJSON): string {
  for (const feature of boundaries.features) {
    const { geometry } = feature;

    if (geometry.type === 'Polygon') {
      if (pointInPolygon([lng, lat], geometry.coordinates[0] as number[][])) {
        return feature.properties['ISO3166-1-Alpha-2'];
      }
    } else if (geometry.type === 'MultiPolygon') {
      for (const polygon of geometry.coordinates as number[][][][]) {
        if (pointInPolygon([lng, lat], polygon[0])) {
          return feature.properties['ISO3166-1-Alpha-2'];
        }
      }
    }
  }

  return 'UNKNOWN';
}

export async function detectBorderCrossing(
  start: [number, number],
  end: [number, number],
  routeCoords: [number, number][]
): Promise<{ crossesBorder: boolean; countries: string[] }> {
  try {
    const boundaries = loadBoundaries();

    if (boundaries.features.length === 0) {
      return { crossesBorder: false, countries: [] };
    }


    const MAX_SAMPLES = 40;
    const step = Math.max(1, Math.floor(routeCoords.length / MAX_SAMPLES));
    const sampledPoints: [number, number][] = [start];
    for (let i = step; i < routeCoords.length - 1; i += step) {
      sampledPoints.push(routeCoords[i]);
      if (sampledPoints.length >= MAX_SAMPLES) break;
    }
    sampledPoints.push(end);

    const countriesSet = new Set<string>();

    for (const [lat, lng] of sampledPoints) {
      const country = getCountryForPoint(lat, lng, boundaries);
      if (country && country !== 'UNKNOWN' && country !== '-99' && country !== '-1') {
        countriesSet.add(country);
      }
    }

    const countries = Array.from(countriesSet);
    const crossesBorder = countries.length > 1;

    logger.info({ countries, crossesBorder }, 'border detection result');
    return { crossesBorder, countries };
  } catch (err) {
    logger.error({ err }, 'border detection failed');
    return { crossesBorder: false, countries: [] };
  }
}
