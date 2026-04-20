import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { logger } from './middleware/logger';
import { routeRouter } from './routes/route';

const app = express();
const PORT = parseInt(process.env.PORT || '7860', 10);


app.use(helmet({
  contentSecurityPolicy: false, // Allow map tiles from external origins
}));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(compression());
app.use(express.json({ limit: '10kb' }));


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);


app.use((req, _res, next) => {
  logger.info({ method: req.method, url: req.url, ip: req.ip }, 'incoming request');
  next();
});


app.use('/api', routeRouter);


app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    osrm: process.env.OSRM_URL || 'http://localhost:5001',
  });
});


const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});


app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err }, 'unhandled error');
  res.status(500).json({ error: 'Internal server error' });
});


app.listen(PORT, '0.0.0.0', () => {
  logger.info({ port: PORT }, `🌊 RouteWave backend running`);
});

export default app;
