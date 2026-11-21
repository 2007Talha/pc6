import { describe, it, expect, beforeEach } from 'vitest';
import {
  hashPayload,
  getCachedGuidance,
  setCachedGuidance,
  clearGuidanceCache,
} from '../services/aiCache.ts';
import type { GuidanceResult } from '../types/index.ts';

const mockResult: GuidanceResult = {
  dailyRoutine: [],
  iaqHacks: [],
  sustainableAlternatives: [],
  impactMetrics: {
    pm25ReductionPercent: 30,
    weeklyCo2eAvoidedKg: 5,
    healthBenefit: 'Health',
    communityBenefit: 'Community',
    explanation: 'Explanation',
  },
  summary: 'Summary',
};

describe('aiCache', () => {
  beforeEach(() => {
    clearGuidanceCache();
  });

  it('generates consistent hash for identical payload objects', () => {
    const payloadA = { city: 'Delhi', tier: 'severe' };
    const payloadB = { city: 'Delhi', tier: 'severe' };
    expect(hashPayload(payloadA)).toBe(hashPayload(payloadB));
  });

  it('generates distinct hashes for different cities', () => {
    const hashDelhi = hashPayload({ city: 'Delhi', tier: 'severe' });
    const hashLahore = hashPayload({ city: 'Lahore', tier: 'severe' });
    expect(hashDelhi).not.toBe(hashLahore);
  });

  it('stores and retrieves cached results by hash key', () => {
    const key = hashPayload({ test: 123 });
    expect(getCachedGuidance(key)).toBeNull();

    setCachedGuidance(key, mockResult);
    const retrieved = getCachedGuidance(key);
    expect(retrieved).toEqual(mockResult);
  });

  it('evicts oldest entries when capacity exceeds maximum limit (LRU behavior)', () => {
    for (let i = 0; i < 105; i++) {
      setCachedGuidance(`key-${i}`, { ...mockResult, summary: `Entry ${i}` });
    }
    expect(getCachedGuidance('key-0')).toBeNull();
    expect(getCachedGuidance('key-4')).toBeNull();
    expect(getCachedGuidance('key-104')).toBeDefined();
  });

  it('clears all cached entries when clearGuidanceCache is invoked', () => {
    setCachedGuidance('k1', mockResult);
    setCachedGuidance('k2', mockResult);
    clearGuidanceCache();
    expect(getCachedGuidance('k1')).toBeNull();
    expect(getCachedGuidance('k2')).toBeNull();
  });

  it('handles empty payload hashing predictably', () => {
    const hash1 = hashPayload({});
    const hash2 = hashPayload({});
    expect(hash1).toBe(hash2);
    expect(typeof hash1).toBe('string');
    expect(hash1.length).toBeGreaterThan(0);
  });

  it('generates distinct hashes when user context changes single enum property', () => {
    const ctxCar = hashPayload({ commute: 'car', fuel: 'lpg' });
    const ctxTransit = hashPayload({ commute: 'public-transit', fuel: 'lpg' });
    expect(ctxCar).not.toBe(ctxTransit);
  });
});
