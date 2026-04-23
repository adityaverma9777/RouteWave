import { Router, Request, Response } from 'express';
import { RouteRequestSchema, RouteResponse } from '../middleware/validate';
import { getRoute } from '../services/osrm';
import { detectBorderCrossing } from '../services/borders';
import { logger } from '../middleware/logger';

export const routeRouter = Router();

routeRouter.post('/route', async (req: Request, res: Response): Promise<void> => {

  const parsed = RouteRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Invalid request body',
      details: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { start, end } = parsed.data;


  if (start[0] === end[0] && start[1] === end[1]) {
    res.status(400).json({ error: 'Start and end points must be different' });
    return;
  }

  logger.info(
    { start, end },
    'route request received'
  );

  try {

    const { geometry, distance, duration } = await getRoute(start, end);

    logger.info(
      { points: geometry.length, distance, duration },
      'route computed'
    );

    const { crossesBorder, countries } = await detectBorderCrossing(
      start,
      end,
      geometry
    );

    const response: RouteResponse = {
      geometry,
      distance,
      duration,
      crossesBorder,
      countries,
    };

    res.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Routing failed';
    logger.warn({ err, start, end }, 'route computation failed');

    if (message.includes('No route') || message.includes('no route')) {
      res.status(404).json({ error: 'No route found between these points' });
    } else {
      res.status(503).json({ error: 'Routing service unavailable. Please try again.' });
    }
  }
});

// Route info endpoint
routeRouter.get('/info', (_req: Request, res: Response) => {
  res.json({
    name: 'RouteWave API',
    version: '1.0.0',
    endpoints: {
      'POST /api/route': 'Compute route between two coordinates',
      'GET /health': 'Health check',
    },
  });
});
