import type { UserContext, GuidanceResult, ImpactMetrics } from '../types/index.ts';
import { generateDailyRoutine } from './routineEngine.ts';
import { generateIaqHacks } from './iaqHacksEngine.ts';
import { generateAlternatives } from './alternativesEngine.ts';
import { calculateImpactMetrics } from './impactEngine.ts';

export { generateDailyRoutine } from './routineEngine.ts';
export { generateIaqHacks } from './iaqHacksEngine.ts';
export { generateAlternatives } from './alternativesEngine.ts';
export { calculateImpactMetrics } from './impactEngine.ts';

function generateSummary(ctx: UserContext, metrics: ImpactMetrics): string {
  const tierLabel = ctx.aqiTier.replace('-', ' ');
  const scenarioNote = ctx.customScenario?.trim() ? ` Tailored for your scenario: "${ctx.customScenario.trim()}".` : '';
  return `Based on ${tierLabel} AQI conditions in ${ctx.location || 'your area'}, `
    + `VayuShield has tailored a low-emission winter protocol for your ${ctx.housingType.replace('-', ' ')} household. `
    + `By adhering to these steps, you can cut personal PM2.5 exposure by ~${metrics.pm25ReductionPercent}% `
    + `and sustain an avoided carbon footprint of ~${metrics.weeklyCo2eAvoidedKg} kg CO₂e weekly.${scenarioNote}`;
}

/** Main entry: generates complete deterministic guidance from user context */
export function generateDeterministicGuidance(ctx: UserContext): GuidanceResult {
  const dailyRoutine = generateDailyRoutine(ctx);
  const iaqHacks = generateIaqHacks(ctx);
  const sustainableAlternatives = generateAlternatives(ctx);
  const impactMetrics = calculateImpactMetrics(ctx);
  const summary = generateSummary(ctx, impactMetrics);

  return { dailyRoutine, iaqHacks, sustainableAlternatives, impactMetrics, summary };
}
