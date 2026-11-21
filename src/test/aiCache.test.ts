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

  it('stores and retrieves cached results by hash key', () => {
    const key = hashPayload({ test: 123 });
    expect(getCachedGuidance(key)).toBeNull();

    setCachedGuidance(key, mockResult);
    const retrieved = getCachedGuidance(key);
    expect(retrieved).toEqual(mockResult);
  });

  it('evicts oldest entries when capacity exceeds maximum limit', () => {
    for (let i = 0; i < 105; i++) {
      setCachedGuidance(`key-${i}`, { ...mockResult, summary: `Entry ${i}` });
    }
    // Oldest entries (e.g. key-0 to key-4) should be pruned
    expect(getCachedGuidance('key-0')).toBeNull();
    expect(getCachedGuidance('key-104')).toBeDefined();
  });
});
