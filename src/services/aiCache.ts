import type { GuidanceResult } from '../types/index.ts';

interface CacheEntry {
  readonly result: GuidanceResult;
  readonly cachedAt: number;
}

const MAX_CACHE_ENTRIES = 100;
const cacheStore = new Map<string, CacheEntry>();

/** Simple, fast hash for context payload without external dependencies */
export function hashPayload(payload: unknown): string {
  const str = JSON.stringify(payload);
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(16);
}

/** Get cached guidance if available */
export function getCachedGuidance(key: string): GuidanceResult | null {
  const entry = cacheStore.get(key);
  if (!entry) return null;
  return entry.result;
}

/** Store guidance in cache with LRU eviction */
export function setCachedGuidance(key: string, result: GuidanceResult): void {
  if (cacheStore.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = cacheStore.keys().next().value;
    if (oldestKey !== undefined) {
      cacheStore.delete(oldestKey);
    }
  }
  cacheStore.set(key, { result, cachedAt: Date.now() });
}

/** Clear cache (useful for testing) */
export function clearGuidanceCache(): void {
  cacheStore.clear();
}
