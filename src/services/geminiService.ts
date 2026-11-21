import type { UserContext, GuidanceResult, GenerationState } from '../types/index.ts';
import { generateDeterministicGuidance } from './airQualityEngine.ts';
import { AQI_TIERS, HOUSEHOLD_PROFILES } from '../constants/index.ts';

/** Strip HTML tags and common prompt injection patterns */
export function sanitizeInput(input: string, maxLength = 500): string {
  return input
    .replace(/<[^>]*>/g, '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0, maxLength);
}

/** Check whether the Gemini API key is configured */
export function isApiKeyConfigured(): boolean {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  return typeof key === 'string' && key.trim().length > 0;
}

/** Build a structured prompt for Gemini */
export function buildPrompt(ctx: UserContext): string {
  const tierInfo = AQI_TIERS.find(t => t.id === ctx.aqiTier);
  const profileInfo = HOUSEHOLD_PROFILES.find(p => p.id === ctx.householdProfile);

  return `You are VayuShield, an expert air quality advisor for Indian winter smog conditions.
Given the user's context below, return ONLY valid JSON (no markdown, no explanation) matching this exact structure:
{
  "dailyRoutine": [{"time":"string","activity":"string","reason":"string","icon":"emoji"}],
  "iaqHacks": [{"title":"string","steps":["string"],"applicableTo":["apartment"|"independent-house"],"priority":"high"|"medium"|"low"}],
  "sustainableAlternatives": [{"category":"string","current":"string","alternative":"string","benefit":"string","icon":"emoji"}],
  "impactMetrics": {"pm25ReductionPercent":number,"weeklyCo2eAvoidedKg":number,"healthBenefit":"string","communityBenefit":"string","explanation":"string"},
  "summary": "string"
}

User Context:
- Location: ${sanitizeInput(ctx.location, 100)}
- AQI Tier: ${tierInfo?.label ?? ctx.aqiTier} (${tierInfo?.range ?? 'N/A'}) — ${tierInfo?.description ?? ''}
- Profile: ${profileInfo?.label ?? ctx.householdProfile} — ${profileInfo?.description ?? ''}
- Housing: ${ctx.housingType}
- Commute: ${ctx.commuteMode}
- Cooking Fuel: ${ctx.cookingFuel}
${ctx.customScenario ? `- Custom Scenario: ${sanitizeInput(ctx.customScenario)}` : ''}

Provide 6-8 daily routine blocks, 4-6 IAQ hacks, 4-5 sustainable alternatives, and quantified impact metrics with transparent calculations. Write in clean plain Unicode text (e.g. PM2.5, µg/m³, CO₂e, NO₂); do NOT use LaTeX math or dollar signs. All advice must be specific to the user's context.`;
}

/** Normalize LaTeX or dollar-sign math syntax to clean Unicode text */
export function cleanLatexMath(str: string): string {
  if (!str || typeof str !== 'string') return str;
  return str
    .replace(/\$PM_\{?2\.5\}?\$|PM_\{2\.5\}/g, 'PM2.5')
    .replace(/\$(?:\\sim|\\approx)?\s*([0-9.]+)\s*~?\s*\\mu\s*g\/m\^\{?3\}?\$|\\mu\s*g\/m\^\{?3\}?/g, '$1 µg/m³')
    .replace(/\$(?:\\sim|\\approx)?\s*([0-9.]+)\s*~?\s*kg~?CO_\{?2\}?e?(?:\/week)?\$|CO_\{?2\}?e/g, '$1 kg CO₂e/week')
    .replace(/\$?\((?:NO_\{?2\}?)\)\$?|\$NO_\{?2\}?\$|NO_\{2\}/g, 'NO₂')
    .replace(/\$NO_\{?x\}?\$|NO_\{x\}/g, 'NOx')
    .replace(/\\sim|\\approx/g, '~')
    .replace(/\\mu g/g, 'µg')
    .replace(/\$([^$]+)\$/g, '$1')
    .trim();
}

/** Recursively sanitize strings across parsed result */
export function sanitizeGuidanceText(val: unknown): unknown {
  if (typeof val === 'string') return cleanLatexMath(val);
  if (Array.isArray(val)) return val.map(sanitizeGuidanceText);
  if (val && typeof val === 'object') {
    const res: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val)) {
      res[k] = sanitizeGuidanceText(v);
    }
    return res;
  }
  return val;
}

/** Safely parse Gemini's JSON response */
export function parseGeminiResponse(raw: string): GuidanceResult {
  let jsonStr = raw.trim();
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch?.[1]) {
    jsonStr = fenceMatch[1].trim();
  }

  const parsed: unknown = JSON.parse(jsonStr);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Response is not a valid JSON object');
  }

  const obj = parsed as Record<string, unknown>;

  if (!Array.isArray(obj['dailyRoutine']) || !Array.isArray(obj['iaqHacks'])) {
    throw new Error('Response missing required arrays');
  }

  return sanitizeGuidanceText(parsed) as GuidanceResult;
}

/** Generate guidance — Gemini-first with defensive timeout and deterministic fallback */
export async function generateGuidance(ctx: UserContext): Promise<GenerationState> {
  if (!isApiKeyConfigured()) {
    const result = generateDeterministicGuidance(ctx);
    return { status: 'success', result, error: null, source: 'deterministic' };
  }

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API call timed out')), 3500),
    );

    const apiCall = (async () => {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = buildPrompt(ctx);
      const response = await model.generateContent(prompt);
      const text = response.response.text();
      return parseGeminiResponse(text);
    })();

    const result = await Promise.race([apiCall, timeoutPromise]);
    return { status: 'success', result, error: null, source: 'gemini' };
  } catch (err) {
    console.warn('Gemini API failed or timed out, falling back to deterministic engine:', err);
    const result = generateDeterministicGuidance(ctx);
    return { status: 'success', result, error: null, source: 'deterministic' };
  }
}
