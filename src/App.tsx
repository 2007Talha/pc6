import { useCallback, useRef } from 'react';
import { useTheme } from './hooks/useTheme.ts';
import { useGuidance } from './hooks/useGuidance.ts';
import { Header } from './components/Header.tsx';
import { ContextForm } from './components/ContextForm.tsx';
import { GuidanceResults } from './components/GuidanceResults.tsx';
import type { UserContext } from './types/index.ts';

export function App() {
  const { theme, toggleTheme } = useTheme();
  const { state, generate, reset } = useGuidance();
  const lastContextRef = useRef<UserContext | null>(null);

  const handleSubmit = useCallback((ctx: UserContext) => {
    lastContextRef.current = ctx;
    generate(ctx);
  }, [generate]);

  const handleRetry = useCallback(() => {
    if (lastContextRef.current) {
      generate(lastContextRef.current);
    }
  }, [generate]);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <main className="main-content" id="main-content" role="main" tabIndex={-1}>
        <ContextForm
          onSubmit={handleSubmit}
          onReset={reset}
          generationStatus={state.status}
        />
        <div aria-live="polite" className="status-live">
          {state.status === 'loading' && (
            <p className="sr-only">Generating your personalized guidance, please wait...</p>
          )}
        </div>
        <GuidanceResults state={state} onRetry={handleRetry} />
      </main>
      <footer className="app-footer" role="contentinfo">
        <p>
          VayuShield — Empowering families and communities to navigate winter smog safely.
          Built with care for cleaner air.
        </p>
      </footer>
    </>
  );
}
