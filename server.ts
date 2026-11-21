import express, { type Request, type Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { serverCache, hashPayload, pruneCache } from './server/cache';
import { validateGuidancePayload, validateCadrPayload, sanitizeText } from './server/validators';
import { helmetMiddleware, corsMiddleware, aiRateLimiter, safeErrorHandler } from './server/middleware';
import { processGuidance, processCadr } from './server/aiService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// 1. Defensive Middleware Chain
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(express.json({ limit: '15kb' }));

// 2. Health & Telemetry Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    timestamp: Date.now(),
    cacheEntries: serverCache.size,
  });
});

// 3. Air Quality Guidance Endpoint
app.post('/api/guidance', aiRateLimiter, async (req: Request, res: Response) => {
  const body = req.body as Record<string, unknown>;
  if (typeof body.location === 'string') {
    body.location = sanitizeText(body.location, 80);
  }
  if (typeof body.customScenario === 'string') {
    body.customScenario = sanitizeText(body.customScenario, 500);
  }

  if (!validateGuidancePayload(body)) {
    return res.status(400).json({ error: 'Invalid user context payload or missing required fields.' });
  }

  const cacheKey = hashPayload({ ...body, type: 'guidance' });
  if (serverCache.has(cacheKey)) {
    return res.status(200).json({ data: serverCache.get(cacheKey)!.data, fromCache: true });
  }

  const result = await processGuidance(body);
  pruneCache();
  serverCache.set(cacheKey, { data: result, cachedAt: Date.now() });
  return res.status(200).json({ data: result, fromCache: false });
});

// 4. CADR Sizing & Corsi-Rosenthal Blueprint Endpoint
app.post('/api/cadr', (req: Request, res: Response) => {
  if (!validateCadrPayload(req.body)) {
    return res.status(400).json({ error: 'Invalid room dimensions payload.' });
  }

  const result = processCadr(req.body);
  return res.status(200).json(result);
});

// 5. Static Assets & SPA Fallback
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*splat', (_req: Request, res: Response) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('VayuShield API Gateway Active. Run `npm run build` to serve frontend SPA.');
    }
  });
});

// 6. Safe Error Handler
app.use(safeErrorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    // Started successfully
  });
}
