import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark';

export function useTheme(): {
  theme: Theme;
  toggleTheme: () => void;
} {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem('vayushield-theme');
      if (stored === 'light' || stored === 'dark') return stored;
    } catch { /* SSR or private mode */ }
    if (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('vayushield-theme', theme);
    } catch { /* storage full or private mode */ }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, toggleTheme };
}
