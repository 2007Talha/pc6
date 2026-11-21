import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  mapUsAqiToTier,
  geocodeCity,
  fetchLiveAqi,
} from '../services/openMeteoService.ts';

describe('openMeteoService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('mapUsAqiToTier', () => {
    it('maps AQI values to appropriate tiers', () => {
      expect(mapUsAqiToTier(50)).toBe('moderate');
      expect(mapUsAqiToTier(150)).toBe('moderate');
      expect(mapUsAqiToTier(250)).toBe('poor');
      expect(mapUsAqiToTier(350)).toBe('very-poor');
      expect(mapUsAqiToTier(450)).toBe('severe');
    });
  });

  describe('geocodeCity', () => {
    it('returns null for blank city names without calling fetch', async () => {
      const res = await geocodeCity('   ');
      expect(res).toBeNull();
    });

    it('returns geocoding result for valid response', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [{ name: 'Delhi', latitude: 28.61, longitude: 77.23, country: 'India' }],
        }),
      } as unknown as Response);

      const res = await geocodeCity('Delhi');
      expect(res).toEqual({ name: 'Delhi', latitude: 28.61, longitude: 77.23, country: 'India' });
    });

    it('returns null when no results found', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      } as unknown as Response);

      const res = await geocodeCity('NonExistentPlace123');
      expect(res).toBeNull();
    });
  });

  describe('fetchLiveAqi', () => {
    it('fetches coordinates and returns formatted live AQI data', async () => {
      globalThis.fetch = vi
        .fn()
        // First call: geocoding
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            results: [{ name: 'New Delhi', latitude: 28.61, longitude: 77.23, country: 'India' }],
          }),
        } as unknown as Response)
        // Second call: air quality
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            current: { pm2_5: 185.4, pm10: 290.1, us_aqi: 325 },
          }),
        } as unknown as Response);

      const data = await fetchLiveAqi('New Delhi');
      expect(data).not.toBeNull();
      expect(data?.city).toBe('New Delhi');
      expect(data?.country).toBe('India');
      expect(data?.pm25).toBe(185);
      expect(data?.pm10).toBe(290);
      expect(data?.usAqi).toBe(325);
      expect(data?.aqiTier).toBe('very-poor');
    });

    it('returns null if city is not found', async () => {
      globalThis.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] }),
      } as unknown as Response);

      const data = await fetchLiveAqi('UnknownTown');
      expect(data).toBeNull();
    });
  });
});
