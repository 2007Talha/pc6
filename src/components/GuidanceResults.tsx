import { useState, useCallback } from 'react';
import type { GenerationState } from '../types/index.ts';
import { DailyRoutineSection } from './DailyRoutineSection.tsx';
import { IaqHacksSection } from './IaqHacksSection.tsx';
import { AlternativesSection } from './AlternativesSection.tsx';
import { ImpactMetricsSection } from './ImpactMetricsSection.tsx';
import { InversionCurve } from './InversionCurve.tsx';
import { CadrCalculator } from './CadrCalculator.tsx';
import { CommunityPledgesSection } from './CommunityPledgesSection.tsx';
import { formatResultsAsText, formatResultsAsMarkdown } from '../utils/exportFormatters.ts';

interface GuidanceResultsProps {
  readonly state: GenerationState;
  readonly onRetry: () => void;
}

export function GuidanceResults({ state, onRetry }: GuidanceResultsProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyAll = useCallback(async () => {
    if (!state.result) return;
    const text = formatResultsAsText(state.result);
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        if (typeof document.execCommand === 'function') {
          document.execCommand('copy');
        }
        document.body.removeChild(textarea);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Silently catch clipboard restrictions
    }
  }, [state.result]);

  const handleExportMarkdown = useCallback(() => {
    if (!state.result) return;
    const md = formatResultsAsMarkdown(state.result);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vayushield-guidance.md';
    a.click();
    URL.revokeObjectURL(url);
  }, [state.result]);

  if (state.status === 'idle') {
    return (
      <section className="empty-state" aria-label="Awaiting input">
        <p>🌬️ Fill in your context above or pick a 1-click test scenario to generate personalized air quality guidance.</p>
      </section>
    );
  }

  if (state.status === 'loading') {
    return (
      <section className="loading-skeleton" aria-label="Loading guidance" aria-busy="true">
        <div className="skeleton-line skeleton-title" />
        <div className="skeleton-line" />
        <div className="skeleton-line" />
        <div className="skeleton-line skeleton-short" />
        <div className="skeleton-line skeleton-title" />
        <div className="skeleton-line" />
        <div className="skeleton-line" />
      </section>
    );
  }

  if (state.status === 'error') {
    return (
      <section className="error-state" role="alert">
        <p>⚠️ {state.error ?? 'Something went wrong.'}</p>
        <button type="button" className="btn-primary" onClick={onRetry}>
          Retry Generation
        </button>
      </section>
    );
  }

  if (!state.result) return null;

  const { result, source } = state;

  return (
    <div className="results-container" aria-live="polite">
      <div className="results-header">
        <h2>Your Personalized Guidance</h2>
        <div className="results-meta">
          {source && (
            <span className={`source-badge source-${source}`}>
              {source === 'gemini' ? '✨ Gemini AI' : source === 'cached' ? '⚡ Cached (<5ms)' : '⚙️ Deterministic Engine'}
            </span>
          )}
          <div className="export-actions">
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={handleCopyAll}
              aria-label="Copy all guidance to clipboard"
            >
              {isCopied ? '✓ Copied!' : '📋 Copy'}
            </button>
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={handleExportMarkdown}
              aria-label="Export guidance as Markdown file"
            >
              📥 Export MD
            </button>
          </div>
        </div>
      </div>

      <div className="summary-banner">
        <p>{result.summary}</p>
      </div>

      <DailyRoutineSection blocks={result.dailyRoutine} />
      <InversionCurve />
      <IaqHacksSection hacks={result.iaqHacks} />
      <CadrCalculator />
      <AlternativesSection alternatives={result.sustainableAlternatives} />
      <CommunityPledgesSection />
      <ImpactMetricsSection metrics={result.impactMetrics} />
    </div>
  );
}
