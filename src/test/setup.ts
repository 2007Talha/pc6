import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Stub VITE_GEMINI_API_KEY to empty during unit tests for fast deterministic offline test runs
vi.stubEnv('VITE_GEMINI_API_KEY', '');

// Mock clipboard for jsdom test environment
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

// Mock window.matchMedia for jsdom test environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
