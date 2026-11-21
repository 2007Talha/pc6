import { describe, it, expect } from 'vitest';
import { formatResultsAsText, formatResultsAsMarkdown } from '../utils/exportFormatters.ts';
import { isGuidanceResult } from '../services/geminiService.ts';
import { generateDeterministicGuidance } from '../services/airQualityEngine.ts';
import { DEFAULT_USER_CONTEXT } from '../constants/index.ts';

describe('exportFormatters utility suite', () => {
  const sampleGuidance = generateDeterministicGuidance(DEFAULT_USER_CONTEXT);

  it('formats guidance into well-structured plain text', () => {
    const text = formatResultsAsText(sampleGuidance);
    expect(text).toContain('VayuShield Guidance');
    expect(text).toContain('Daily Routine');
    expect(text).toContain('Indoor Air Quality Hacks');
    expect(text).toContain('Sustainable Alternatives');
    expect(text).toContain('PM2.5 Reduction:');
  });

  it('formats guidance into valid Markdown with tables and headers', () => {
    const md = formatResultsAsMarkdown(sampleGuidance);
    expect(md).toContain('# VayuShield Guidance');
    expect(md).toContain('## 🕐 Low-Emission Daily Routine');
    expect(md).toContain('| Time | Activity | Why |');
    expect(md).toContain('## 🏠 Indoor Air Quality Hacks');
    expect(md).toContain('## 🌱 Sustainable Alternatives');
    expect(md).toContain('## 📊 Quantified Impact');
  });

  it('validates genuine GuidanceResult using isGuidanceResult type guard', () => {
    expect(isGuidanceResult(sampleGuidance)).toBe(true);
    expect(isGuidanceResult(null)).toBe(false);
    expect(isGuidanceResult({})).toBe(false);
    expect(isGuidanceResult({ dailyRoutine: [] })).toBe(false);
  });

  it('rejects guidance missing impact metrics object', () => {
    const invalid = { ...sampleGuidance, impactMetrics: null };
    expect(isGuidanceResult(invalid)).toBe(false);
  });

  it('rejects guidance missing summary text', () => {
    const invalid = { ...sampleGuidance, summary: 12345 };
    expect(isGuidanceResult(invalid)).toBe(false);
  });

  it('preserves Unicode characters like µg/m³ and CO₂e in formatted Markdown', () => {
    const md = formatResultsAsMarkdown(sampleGuidance);
    expect(md).toContain('CO₂e');
    expect(md).not.toContain('$CO_2e$');
  });
});
