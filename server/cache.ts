import { createHash } from 'crypto';

export interface CacheEntry {
  data: unknown;
  cachedAt: number;
}

export const serverCache = new Map<string, CacheEntry>();
const MAX_CACHE_ENTRIES = 100;

/**
 * Creates deterministic 16-character SHA-256 hex digest for server response caching.
 */
export function hashPayload(obj: unknown): string {
  return createHash('sha256').update(JSON.stringify(obj)).digest('hex').slice(0, 16);
}

/**
 * Prunes the oldest cached entries when limit is reached.
 */
export function pruneCache(): void {
  if (serverCache.size >= MAX_CACHE_ENTRIES) {
    const firstKey = serverCache.keys().next().value;
    if (firstKey !== undefined) serverCache.delete(firstKey);
  }
}
