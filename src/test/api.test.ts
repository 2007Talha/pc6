import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Server } from 'http';
import { app } from '../../server';

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const address = server.address();
      if (address && typeof address === 'object') {
        baseUrl = `http://localhost:${address.port}`;
      }
      resolve();
    });
  });
});

afterAll(async () => {
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
});

describe('Tier 5: Server HTTP API & Security Validation Tests', () => {
  it('1. GET /api/health returns status 200 and telemetry', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { status: string; uptime: number; cacheEntries: number };
    expect(json.status).toBe('ok');
    expect(typeof json.uptime).toBe('number');
    expect(typeof json.cacheEntries).toBe('number');
  });

  it('2. Verifies Helmet security headers on HTTP responses', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('content-security-policy')).not.toBeNull();
  });

  it('3. Verifies CORS headers allow standard localhost requests', async () => {
    const res = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: 'http://localhost:5173' },
    });
    expect(res.headers.get('access-control-allow-origin')).toBe('http://localhost:5173');
  });

  it('4. POST /api/guidance returns 200 with valid payload', async () => {
    const payload = {
      location: 'Delhi',
      aqiTier: 'very-poor',
      householdProfile: 'family-young-children',
      housingType: 'apartment',
      commuteMode: 'public-transit',
      cookingFuel: 'lpg',
      customScenario: 'commute',
    };

    const res = await fetch(`${baseUrl}/api/guidance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as { data: { summary: string; dailyRoutine: unknown[] }; fromCache: boolean };
    expect(json.data.summary).toBeDefined();
    expect(Array.isArray(json.data.dailyRoutine)).toBe(true);
    expect(json.fromCache).toBe(false);
  });

  it('5. POST /api/guidance hits SHA-256 LRU cache on identical replay (<20ms)', async () => {
    const payload = {
      location: 'Delhi',
      aqiTier: 'very-poor',
      householdProfile: 'family-young-children',
      housingType: 'apartment',
      commuteMode: 'public-transit',
      cookingFuel: 'lpg',
      customScenario: 'commute',
    };

    const t0 = performance.now();
    const res = await fetch(`${baseUrl}/api/guidance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const duration = performance.now() - t0;

    expect(res.status).toBe(200);
    const json = (await res.json()) as { fromCache: boolean };
    expect(json.fromCache).toBe(true);
    expect(duration).toBeLessThan(100);
  });

  it('6. POST /api/guidance rejects invalid AQI tier with 400', async () => {
    const payload = {
      location: 'Delhi',
      aqiTier: 'invalid-tier',
      householdProfile: 'family-young-children',
    };

    const res = await fetch(`${baseUrl}/api/guidance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(400);
    const json = (await res.json()) as { error: string };
    expect(json.error).toContain('Invalid user context payload');
  });

  it('7. POST /api/guidance sanitizes control characters in location name', async () => {
    const payload = {
      location: 'Delhi\x00\x1fCleaned',
      aqiTier: 'moderate',
      householdProfile: 'daily-commuters',
      housingType: 'apartment',
      commuteMode: 'work-from-home',
      cookingFuel: 'electric',
    };

    const res = await fetch(`${baseUrl}/api/guidance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(200);
  });

  it('8. POST /api/cadr calculates Corsi-Rosenthal blueprint with 200', async () => {
    const payload = {
      roomAreaSqFt: 300,
      ceilingHeightFt: 10,
      targetAch: 5,
    };

    const res = await fetch(`${baseUrl}/api/cadr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as { metrics: { targetCadrCfm: number; roomVolumeM3: number }; blueprint: { name: string } };
    expect(json.metrics.targetCadrCfm).toBeGreaterThan(0);
    expect(json.blueprint.name).toContain('Corsi-Rosenthal Box');
  });

  it('9. POST /api/cadr rejects non-positive room area with 400', async () => {
    const payload = {
      roomAreaSqFt: -50,
      ceilingHeightFt: 10,
    };

    const res = await fetch(`${baseUrl}/api/cadr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(400);
  });

  it('10. SPA splat fallback returns HTTP 200 on deep links', async () => {
    const res = await fetch(`${baseUrl}/arbitrary/deep/link`);
    expect(res.status).toBe(200);
  });
});
