import { generateDeterministicGuidance } from '../src/services/airQualityEngine';
import { evaluateRoomCadr, getCorsiRosenthalBlueprint, type CadrMetrics, type CorsiRosenthalBlueprint } from '../src/services/cadrEngine';
import type { UserContext, GuidanceResult } from '../src/types';
import type { ValidatedGuidancePayload, ValidatedCadrPayload } from './validators';

export async function processGuidance(payload: ValidatedGuidancePayload): Promise<GuidanceResult> {
  const context: UserContext = {
    location: payload.location,
    aqiTier: payload.aqiTier,
    householdProfile: payload.householdProfile,
    housingType: payload.housingType || 'apartment',
    commuteMode: payload.commuteMode || 'public-transit',
    cookingFuel: payload.cookingFuel || 'lpg',
    customScenario: payload.customScenario || '',
  };

  return generateDeterministicGuidance(context);
}

export function processCadr(payload: ValidatedCadrPayload): { metrics: CadrMetrics; blueprint: CorsiRosenthalBlueprint } {
  const metrics = evaluateRoomCadr(payload.roomAreaSqFt, payload.ceilingHeightFt ?? 9, payload.targetAch ?? 4);
  const blueprint = getCorsiRosenthalBlueprint();
  return { metrics, blueprint };
}
