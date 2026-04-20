import { z } from 'zod';

export const RouteRequestSchema = z.object({
  start: z.tuple([
    z.number().min(-90).max(90),   // latitude
    z.number().min(-180).max(180), // longitude
  ]),
  end: z.tuple([
    z.number().min(-90).max(90),
    z.number().min(-180).max(180),
  ]),
});

export type RouteRequest = z.infer<typeof RouteRequestSchema>;

export interface RouteResponse {
  geometry: [number, number][];
  distance: number;
  duration: number;
  crossesBorder: boolean;
  countries: string[];
}

export interface OSRMRoute {
  geometry: {
    coordinates: [number, number][];
    type: string;
  };
  legs: {
    distance: number;
    duration: number;
    summary: string;
  }[];
  distance: number;
  duration: number;
}

export interface OSRMResponse {
  code: string;
  routes: OSRMRoute[];
  waypoints: { location: [number, number]; name: string }[];
}
