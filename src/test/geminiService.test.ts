import { describe, it, expect } from 'vitest';
import {
  sanitizeInput,
  buildPrompt,
  parseGeminiResponse,
  cleanLatexMath,
  isApiKeyConfigured,
  generateGuidance,
} from '../services/geminiService.ts';
import type { UserContext } from '../types/index.ts';

const testContext: UserContext = {
  location: 'Varanasi',
  aqiTier: 'poor',
  householdProfile: 'elderly-respiratory',
  housingType: 'independent-house',
  commuteMode: 'car',
  cookingFuel: 'lpg',
  customScenario: 'Asthma patient at home',
};

describe('geminiService', () => {
  it('sanitizes input and strips script tags', () => {
    const malicious = '<img src=x onerror=alert(1)>Test';
    const clean = sanitizeInput(malicious);
    expect(clean).not.toContain('<img');
    expect(clean).not.toContain('onerror');
  });

  it('builds a detailed prompt containing user context', () => {
    const prompt = buildPrompt(testContext);
    expect(prompt).toContain('Varanasi');
    expect(prompt).toContain('Asthma patient at home');
    expect(prompt).toContain('dailyRoutine');
    expect(prompt).toContain('iaqHacks');
  });

  it('parses valid JSON response correctly', () => {
    const mockJson = JSON.stringify({
      dailyRoutine: [{ time: '8:00 AM', activity: 'Test activity', reason: 'Test reason', icon: '☀️' }],
      iaqHacks: [{ title: 'Test Hack', steps: ['Step 1'], applicableTo: ['apartment'], priority: 'high' }],
      sustainableAlternatives: [{ category: 'Commute', current: 'A', alternative: 'B', benefit: 'C', icon: '🚲' }],
      impactMetrics: {
        pm25ReductionPercent: 30,
        weeklyCo2eAvoidedKg: 5,
        healthBenefit: 'Better lungs',
        communityBenefit: 'Cleaner street',
        explanation: 'Math calculation',
      },
      summary: 'Test summary',
    });

    const parsed = parseGeminiResponse(mockJson);
    expect(parsed.dailyRoutine.length).toBe(1);
    expect(parsed.iaqHacks.length).toBe(1);
    expect(parsed.impactMetrics.pm25ReductionPercent).toBe(30);
  });

  it('parses JSON wrapped in markdown fences', () => {
    const fencedJson = '```json\n{"dailyRoutine":[],"iaqHacks":[],"sustainableAlternatives":[],"impactMetrics":{"pm25ReductionPercent":10,"weeklyCo2eAvoidedKg":1,"healthBenefit":"","communityBenefit":"","explanation":""},"summary":""}\n```';
    const parsed = parseGeminiResponse(fencedJson);
    expect(parsed).toBeDefined();
    expect(parsed.impactMetrics.pm25ReductionPercent).toBe(10);
  });

  it('throws on malformed JSON', () => {
    expect(() => parseGeminiResponse('not json')).toThrow();
  });

  it('falls back to deterministic engine when API key is unset and caches response', async () => {
    // When no API key is provided, should use deterministic engine
    const state = await generateGuidance(testContext);
    expect(state.status).toBe('success');
    expect(state.source).toBe('deterministic');
    expect(state.result).not.toBeNull();
    expect(state.result?.dailyRoutine.length).toBeGreaterThan(0);

    // Second call with same context should hit in-memory LRU cache (<5ms)
    const cachedState = await generateGuidance(testContext);
    expect(cachedState.status).toBe('success');
    expect(cachedState.source).toBe('cached');
  });

  it('correctly reports API key status', () => {
    const configured = isApiKeyConfigured();
    expect(typeof configured).toBe('boolean');
  });

  it('cleans raw LaTeX math and dollar signs to plain Unicode', () => {
    expect(cleanLatexMath('$53~\\mu g/m^{3}$')).toBe('53 µg/m³');
    expect(cleanLatexMath('$\\sim8.5~kg~CO_{2}e/week$')).toBe('8.5 kg CO₂e/week');
    expect(cleanLatexMath('Avoid $(NO_{2})$ emissions and $PM_{2.5}$')).toBe('Avoid NO₂ emissions and PM2.5');
  });

  it('sanitizes LaTeX in parsed Gemini JSON responses', () => {
    const raw = JSON.stringify({
      dailyRoutine: [{ time: '8:00 AM', activity: 'Inhale less $PM_{2.5}$', reason: 'High $(NO_{2})$', icon: '😷' }],
      iaqHacks: [{ title: 'Purifier', steps: ['Filter $53~\\mu g/m^{3}$'], applicableTo: ['apartment'], priority: 'high' }],
      sustainableAlternatives: [{ category: 'Commute', current: 'A', alternative: 'B', benefit: '$\\sim8.5~kg~CO_{2}e/week$', icon: '🚲' }],
      impactMetrics: {
        pm25ReductionPercent: 20,
        weeklyCo2eAvoidedKg: 8.5,
        healthBenefit: 'No $PM_{2.5}$',
        communityBenefit: 'Less $(NO_{2})$',
        explanation: 'Math calculation',
      },
      summary: 'Summary with $PM_{2.5}$',
    });

    const parsed = parseGeminiResponse(raw);
    expect(parsed.dailyRoutine[0]?.activity).toBe('Inhale less PM2.5');
    expect(parsed.dailyRoutine[0]?.reason).toBe('High NO₂');
    expect(parsed.iaqHacks[0]?.steps[0]).toBe('Filter 53 µg/m³');
    expect(parsed.sustainableAlternatives[0]?.benefit).toBe('8.5 kg CO₂e/week');
    expect(parsed.summary).toBe('Summary with PM2.5');
  });
});
