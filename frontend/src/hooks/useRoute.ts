import { useState, useCallback } from 'react';
import type { RouteData, LatLng, RouteError } from '../types';
import { API_BASE } from '../utils/config';

interface UseRouteReturn {
  routeData: RouteData | null;
  error: RouteError | null;
  isLoading: boolean;
  fetchRoute: (start: LatLng, end: LatLng) => Promise<RouteData | null>;
  clearRoute: () => void;
}

export function useRoute(): UseRouteReturn {
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [error, setError] = useState<RouteError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRoute = useCallback(async (start: LatLng, end: LatLng): Promise<RouteData | null> => {
    setIsLoading(true);
    setError(null);
    setRouteData(null);

    try {
      const response = await fetch(`${API_BASE}/api/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start, end }),
        signal: AbortSignal.timeout(45000),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const message = (body as { error?: string }).error || 'Routing failed';

        setError({
          message,
          code: response.status === 404 ? 'NO_ROUTE' : 'SERVICE_ERROR',
        });
        return null;
      }

      const data = await response.json() as RouteData;
      setRouteData(data);
      return data;
    } catch (err) {
      const isTimeout = err instanceof Error && err.name === 'TimeoutError';
      setError({
        message: isTimeout ? 'Request timed out. Is the backend running?' : 'Network error. Check your connection.',
        code: 'NETWORK_ERROR',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearRoute = useCallback(() => {
    setRouteData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { routeData, error, isLoading, fetchRoute, clearRoute };
}
