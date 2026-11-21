import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  mapUsAqiToTier,
  getUsAqiCategory,
  getIndianNaqiCategory,
  geocodeCity,
  fetchLiveAqi,
} from '../services/openMeteoService.ts';

describe('openMeteoService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('mapUsAqiToTier & getUsAqiCategory', () => {
    it('correctly categorizes US AQI 168 as Unhealthy and maps to poor tier', () => {
      expect(getUsAqiCategory(168)).toBe('Unhealthy');
      expect(mapUsAqiToTier(168)).toBe('poor');
    });

    it('maps AQI values to appropriate tiers adhering to EPA warning thresholds', () => {
      expect(mapUsAqiToTier(50)).toBe('moderate');
      expect(mapUsAqiToTier(140)).toBe('moderate');
      expect(mapUsAqiToTier(180)).toBe('poor');
      expect(mapUsAqiToTier(320)).toBe('very-poor');
      expect(mapUsAqiToTier(450)).toBe('severe');
    });

    it('correctly classifies Indian NAQI categories based on PM2.5', () => {
      expect(getIndianNaqiCategory(25)).toBe('Good');
      expect(getIndianNaqiCategory(59)).toBe('Satisfactory');
      expect(getIndianNaqiCategory(75)).toBe('Moderate');
      expect(getIndianNaqiCategory(110)).toBe('Poor');
      expect(getIndianNaqiCategory(180)).toBe('Very Poor');
      expect(getIndianNaqiCategory(300)).toBe('Severe');
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

    it('returns null when geocoding results array is empty or undefined', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      } as unknown as Response);

      const res = await geocodeCity('NonExistentCityXYZ123');
      expect(res).toBeNull();
    });
  });

  describe('fetchLiveAqi', () => {
    it('fetches coordinates and returns formatted live AQI with US & NAQI categories', async () => {
      globalThis.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            results: [{ name: 'New Delhi', latitude: 28.61, longitude: 77.23, country: 'India' }],
          }),
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            current: { pm2_5: 59.2, pm10: 120.1, us_aqi: 168 },
          }),
        } as unknown as Response);

      const data = await fetchLiveAqi('New Delhi');
      expect(data).not.toBeNull();
      expect(data?.city).toBe('New Delhi');
      expect(data?.pm25).toBe(59);
      expect(data?.usAqi).toBe(168);
      expect(data?.aqiCategory).toBe('Unhealthy');
      expect(data?.indianNaqiCategory).toBe('Satisfactory');
      expect(data?.aqiTier).toBe('poor');
    });

    it('handles network failures gracefully without unhandled rejections', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network timeout'));
      const data = await fetchLiveAqi('Lahore');
      expect(data).toBeNull();
    });
  });
});
