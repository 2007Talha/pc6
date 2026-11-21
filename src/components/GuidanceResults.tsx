import { useState, useCallback } from 'react';
import type { GenerationState, GuidanceResult } from '../types/index.ts';
import { DailyRoutineSection } from './DailyRoutineSection.tsx';
import { IaqHacksSection } from './IaqHacksSection.tsx';
import { AlternativesSection } from './AlternativesSection.tsx';
import { ImpactMetricsSection } from './ImpactMetricsSection.tsx';

interface GuidanceResultsProps {
  readonly state: GenerationState;
  readonly onRetry: () => void;
}

function formatResultsAsText(r: GuidanceResult): string {
  let text = `VayuShield Guidance\n${'='.repeat(40)}\n\n${r.summary}\n\n`;
  text += `Daily Routine\n${'-'.repeat(20)}\n`;
  for (const b of r.dailyRoutine) {
    text += `${b.icon} ${b.time} — ${b.activity}: ${b.reason}\n`;
  }
  text += `\nIndoor Air Quality Hacks\n${'-'.repeat(20)}\n`;
  for (const h of r.iaqHacks) {
    text += `[${h.priority.toUpperCase()}] ${h.title}\n`;
    for (const s of h.steps) text += `  • ${s}\n`;
  }
  text += `\nSustainable Alternatives\n${'-'.repeat(20)}\n`;
  for (const a of r.sustainableAlternatives) {
    text += `${a.icon} ${a.category}: ${a.current} → ${a.alternative} (${a.benefit})\n`;
  }
  text += `\nImpact\n${'-'.repeat(20)}\n`;
  text += `PM2.5 Reduction: ~${r.impactMetrics.pm25ReductionPercent}%\n`;
  text += `Weekly CO₂e Avoided: ~${r.impactMetrics.weeklyCo2eAvoidedKg} kg\n`;
  text += `Health: ${r.impactMetrics.healthBenefit}\n`;
  text += `Community: ${r.impactMetrics.communityBenefit}\n`;
  return text;
}

function formatResultsAsMarkdown(r: GuidanceResult): string {
  let md = `# VayuShield Guidance\n\n> ${r.summary}\n\n`;
  md += `## 🕐 Low-Emission Daily Routine\n\n`;
  md += `| Time | Activity | Why |\n|------|----------|-----|\n`;
  for (const b of r.dailyRoutine) {
    md += `| ${b.icon} ${b.time} | ${b.activity} | ${b.reason} |\n`;
  }
  md += `\n## 🏠 Indoor Air Quality Hacks\n\n`;
  for (const h of r.iaqHacks) {
    md += `### ${h.title} (${h.priority} priority)\n\n`;
    for (const s of h.steps) md += `- ${s}\n`;
    md += '\n';
  }
  md += `## 🌱 Sustainable Alternatives\n\n`;
  for (const a of r.sustainableAlternatives) {
    md += `- ${a.icon} **${a.category}**: ${a.current} → ${a.alternative} — *${a.benefit}*\n`;
  }
  md += `\n## 📊 Quantified Impact\n\n`;
  md += `- **PM2.5 Reduction**: ~${r.impactMetrics.pm25ReductionPercent}%\n`;
  md += `- **Weekly CO₂e Avoided**: ~${r.impactMetrics.weeklyCo2eAvoidedKg} kg\n`;
  md += `- **Health**: ${r.impactMetrics.healthBenefit}\n`;
  md += `- **Community**: ${r.impactMetrics.communityBenefit}\n\n`;
  md += `> ${r.impactMetrics.explanation}\n`;
  return md;
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
              {source === 'gemini' ? '✨ Gemini AI' : '⚙️ Deterministic Engine'}
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
      <IaqHacksSection hacks={result.iaqHacks} />
      <AlternativesSection alternatives={result.sustainableAlternatives} />
      <ImpactMetricsSection metrics={result.impactMetrics} />
    </div>
  );
}
